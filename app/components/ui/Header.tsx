'use client';

// All authentication-related logic has been removed.
// The header now only displays the application title.

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Server Admin Dashboard</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">windeath44.server</span>
          </div>
          
          {/* User-related UI has been removed as authentication is handled externally. */}
        </div>
      </div>
    </header>
  );
}
