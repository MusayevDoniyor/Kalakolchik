import { verifyAdminSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "MindSnap Admin Panel | MindSnap Bot",
  description: "Management portal for MindSnap Telegram Bot reminders, users, and media.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdminSession();

  return (
    <AdminShell adminEmail={session.email || "otabekabduvaliyev1910@gmail.com"}>
      {children}
    </AdminShell>
  );
}
