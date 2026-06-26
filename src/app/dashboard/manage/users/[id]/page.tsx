import UserManageView from "@/components/management/UserManageView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageUserPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main className="pt-16" dir="rtl">
      <UserManageView userId={id} />
    </main>
  );
}
