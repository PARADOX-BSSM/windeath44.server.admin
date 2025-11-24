export const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value || '');
    }
  }
  return null;
};

export const getAuthToken = (): string | null => {
  // 쿠키에서 먼저 시도
  const cookieToken = getCookieValue('auth_token');
  if (cookieToken) return cookieToken;
  
  // localStorage에서 시도
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  
  return null;
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const logout = (): void => {
  console.log('Starting logout process...');
  
  // 여러 방법으로 쿠키 삭제 시도
  const cookiePatterns = [
    'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT',
    'auth_token=; path=/admin; expires=Thu, 01 Jan 1970 00:00:01 GMT', 
    'auth_token=; path=/admin/dashboard; expires=Thu, 01 Jan 1970 00:00:01 GMT',
    'auth_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT',
    'auth_token=; max-age=0; path=/',
    'auth_token=; max-age=0',
  ];
  
  cookiePatterns.forEach(pattern => {
    document.cookie = pattern;
  });
  
  console.log('Cookies before cleanup:', document.cookie);
  
  // localStorage에서 토큰 삭제
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    console.log('localStorage cleared');
  }
  
  // 삭제 후 확인
  setTimeout(() => {
    const remainingToken = getCookieValue('auth_token');
    console.log('Remaining token after logout:', remainingToken ? 'Still exists' : 'Cleared');
    console.log('Cookies after cleanup:', document.cookie);
  }, 100);
  
  console.log('User logged out, tokens cleared');
};