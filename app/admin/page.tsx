'use client';

import { useEffect } from 'react';

export default function AdminRootPage() {
  useEffect(() => {
    // /admin 접속 시 대시보드로 리다이렉트 (미들웨어에서도 처리되지만 클라이언트 측 백업)
    window.location.href = '/admin/dashboard';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}