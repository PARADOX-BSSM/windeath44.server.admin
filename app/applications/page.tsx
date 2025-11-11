'use client';

import React, { useState, useEffect } from 'react';

interface MemorialApplication {
  memorialApplicationId: number;
  userId: string;
  characterId: number;
  content: string;
  createdAt: string;
  state: 'APPROVED' | 'REJECTED' | 'PENDING';
  likes: number;
  userDidLike?: boolean;
}

interface ApiResponse {
  message: string;
  data: {
    values: MemorialApplication[];
    hasNext: boolean;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<MemorialApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [cursorId, setCursorId] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const stateMapping = {
    'all': undefined,
    'approved': 1,
    'rejected': 2,
    'pending': 3
  };

  const fetchApplications = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('size', '20');
      
      if (!reset && cursorId) {
        params.append('cursorId', cursorId.toString());
      }
      
      if (selectedState !== 'all') {
        const memorizingCode = stateMapping[selectedState as keyof typeof stateMapping];
        if (memorizingCode) {
          params.append('memorizingCode', memorizingCode.toString());
        }
      }

      const response = await fetch(`/api/applications?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (reset) {
        setApplications(data.data.values);
      } else {
        setApplications(prev => [...prev, ...data.data.values]);
      }
      
      setHasNext(data.data.hasNext);
      
      if (data.data.values.length > 0) {
        setCursorId(data.data.values[data.data.values.length - 1].memorialApplicationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/applications/approve/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh applications
        fetchApplications(true);
      } else {
        throw new Error('Failed to approve application');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve application');
    }
  };

  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`/api/applications/cancel/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh applications
        fetchApplications(true);
      } else {
        throw new Error('Failed to reject application');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject application');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh applications
        fetchApplications(true);
      } else {
        throw new Error('Failed to delete application');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const cookies = document.cookie.split(';');
      const authTokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
      
      if (!authTokenCookie) {
        console.log('No auth token found, redirecting to login');
        window.location.href = '/admin/dashboard/auth/login';
        return;
      }

      const token = authTokenCookie.split('=')[1];
      if (!token) {
        console.log('Empty auth token, redirecting to login');
        window.location.href = '/admin/dashboard/auth/login';
        return;
      }

      try {
        // Verify token with server
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();
        
        if (result.valid) {
          console.log('Token verified successfully');
          setIsAuthenticated(true);
        } else {
          console.log('Token verification failed:', result.message);
          // Clear invalid token
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/admin/dashboard/auth/login';
          return;
        }
      } catch (error) {
        console.error('Token verification error:', error);
        // Clear token on error
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/admin/dashboard/auth/login';
        return;
      }
      
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications(true);
    }
  }, [selectedState, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading && applications.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Memorial Applications</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage memorial applications and their approval status
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => fetchApplications(true)}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Status
        </label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Applications</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {applications.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              No applications found
            </li>
          ) : (
            applications.map((app) => (
              <li key={app.memorialApplicationId} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Application #{app.memorialApplicationId}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          User: {app.userId} | Character ID: {app.characterId}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(app.createdAt)} | ❤️ {app.likes}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                        {app.content}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(app.state)}`}>
                      {app.state}
                    </span>
                    
                    <div className="flex space-x-2">
                      {app.state === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(app.memorialApplicationId)}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app.memorialApplicationId)}
                            className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(app.memorialApplicationId)}
                        className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        
        {hasNext && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => fetchApplications(false)}
              disabled={loading}
              className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}