import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, withDbFallback } from "@/lib/db";
import CustomOrdersAdmin from "@/components/admin/CustomOrdersAdmin";
import { FABRIC_OPTIONS } from "@/lib/fabric-catalog";

export const dynamic = "force-dynamic";

export default async function AdminCustomOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const orders = await withDbFallback(
    () => prisma.customOrder.findMany({ orderBy: { createdAt: "desc" } }),
    []
  );

  const fabricMap = Object.fromEntries(FABRIC_OPTIONS.map((f) => [f.id, f.name]));

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow">Operations</p>
        <h1 className="section-title mt-1">Custom / team quotes</h1>
        <p className="section-desc mt-2">
          Quote requests for names, numbers, logos, and bulk kits.
        </p>
      </div>
      <CustomOrdersAdmin initial={orders} fabricMap={fabricMap} />
    </div>
  );
}
