import DashboardLayout from '@/components/DashboardLayout';

// Force dynamic rendering for all dashboard pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

