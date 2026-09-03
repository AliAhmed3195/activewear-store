import type { NextRequest } from "next/server";

export interface RequestGeo {
  clientIp: string | null;
  geoCountry: string | null;
  geoRegion: string | null;
  geoCity: string | null;
  userAgent: string | null;
}

function firstForwardedIp(value: string | null): string | null {
  if (!value) return null;
  const ip = value.split(",")[0]?.trim();
  if (!ip || ip === "unknown") return null;
  return ip;
}

function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

export function getClientIp(req: NextRequest): string | null {
  return (
    firstForwardedIp(req.headers.get("x-forwarded-for")) ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    null
  );
}

/** Prefer edge platform headers, then optional public IP lookup. */
export async function resolveRequestGeo(req: NextRequest): Promise<RequestGeo> {
  const clientIp = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  let geoCountry =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;
  let geoRegion = req.headers.get("x-vercel-ip-country-region");
  let geoCity = req.headers.get("x-vercel-ip-city");

  if (geoCountry === "XX") geoCountry = null;

  if ((!geoCountry || !geoCity) && clientIp && !isPrivateIp(clientIp)) {
    try {
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(clientIp)}?fields=status,country,countryCode,regionName,city`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          status?: string;
          country?: string;
          countryCode?: string;
          regionName?: string;
          city?: string;
        };
        if (data.status === "success") {
          geoCountry = geoCountry || data.countryCode || data.country || null;
          geoRegion = geoRegion || data.regionName || null;
          geoCity = geoCity || data.city || null;
        }
      }
    } catch {
      /* geo lookup is best-effort */
    }
  }

  return {
    clientIp,
    geoCountry,
    geoRegion,
    geoCity,
    userAgent: userAgent ? userAgent.slice(0, 500) : null,
  };
}

export function formatGeoLabel(geo: {
  geoCity?: string | null;
  geoRegion?: string | null;
  geoCountry?: string | null;
}): string {
  return [geo.geoCity, geo.geoRegion, geo.geoCountry].filter(Boolean).join(", ") || "Unknown";
}
