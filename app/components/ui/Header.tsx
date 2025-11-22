'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/app/lib/auth';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/dashboard/auth/login');
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Server Admin Dashboard</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">windeath44.server</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
