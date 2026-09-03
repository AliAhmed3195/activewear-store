import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const categories = await getCategories();

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl mb-6">New Product</h1>
      <ProductForm categories={categories} />
    </AdminShell>
  );
}
