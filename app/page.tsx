import AdminOverview from '@/app/components/dashboard/AdminOverview';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1">
        <main className="p-6">
          <AdminOverview />
        </main>
      </div>
    </div>
  );
}
