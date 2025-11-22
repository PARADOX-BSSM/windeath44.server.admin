export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            🎉 Windeath44 Admin Portal - Test Page
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              이 페이지는 Next.js와 Tailwind CSS가 제대로 작동하는지 확인하기 위한 테스트 페이지입니다.
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900">User Management</h3>
                <p className="text-sm text-blue-700 mt-2">사용자 관리 시스템이 구현되었습니다.</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900">API Endpoints</h3>
                <p className="text-sm text-green-700 mt-2">모든 API 엔드포인트가 준비되었습니다.</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900">UI Components</h3>
                <p className="text-sm text-purple-700 mt-2">반응형 UI 컴포넌트가 완성되었습니다.</p>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <a 
                href="/admin/dashboard" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                대시보드로 이동
              </a>
              <a 
                href="/admin/users" 
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
              >
                사용자 관리
              </a>
              <a 
                href="/admin/users/create" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
              >
                관리자 계정 생성
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>✅ Next.js 15.1.0 • ✅ Tailwind CSS • ✅ TypeScript • ✅ User Management API</p>
        </div>
      </div>
    </div>
  );
}