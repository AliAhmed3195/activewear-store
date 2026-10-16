import StoreFooter from "@/components/store/StoreFooter";
import { getStoreBranding } from "@/lib/store-branding";

export default async function StoreFooterServer() {
  const { logoUrl } = await getStoreBranding();
  return <StoreFooter logoUrl={logoUrl} />;
}
