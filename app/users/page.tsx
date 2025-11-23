'use client';

import { useState, useEffect } from 'react';
import { getAuthHeaders } from '@/app/lib/auth';
import Link from 'next/link';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';

interface User {
  userId: string;
  email: string;
  name: string;
  remainToken: number;
  profile: string;
  role: string;
  createdAt: string;
}

interface UserListResponse {
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  totalUserCount: number;
}

interface ApiResponse {
  message: string;
  data: UserListResponse;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt,desc');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sortBy,
      });
      
      if (keyword) params.append('keyword', keyword);
      if (roleFilter) params.append('roleFilter', roleFilter);

      const response = await fetch(`https://prod.windeath44.wiki/api/users?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          'role': 'ADMIN',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result: ApiResponse = await response.json();
      setUsers(result.data.content);
      setTotalPages(result.data.totalPages);
      setTotalUsers(result.data.totalUserCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, size, sortBy]);

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(`Are you sure you want to delete user ${userId}?`)) {
      return;
    }

    try {
      const response = await fetch('https://prod.windeath44.wiki/api/users', {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh the user list
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar activeItem="users" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage user accounts and permissions
                </p>
              </div>
              <Link
                href="/admin/users/create"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Admin
              </Link>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search by user ID or name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="CHIEF">CHIEF</option>
                    <option value="USER">USER</option>
                    <option value="TESTER">TESTER</option>
                    <option value="ANONYMOUS">ANONYMOUS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="createdAt,desc">Newest First</option>
                    <option value="createdAt,asc">Oldest First</option>
                    <option value="name,asc">Name A-Z</option>
                    <option value="name,desc">Name Z-A</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{totalUsers}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Page</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{page + 1} of {totalPages}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">Showing</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{users.length} users</p>
              </div>
            </div>

            {/* User List */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Users</h2>
                
                {loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <button
                      onClick={() => fetchUsers()}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!loading && !error && users.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                  </div>
                )}

                {!loading && !error && users.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">User</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Email</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Role</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Tokens</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Created</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.userId} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.profile}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full bg-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEMxOC4yMDkxIDIwIDIwIDExLjI5MDkgMjAgMTZDMjAgMTMuNzkwOSAxOC4yMDkxIDEyIDE2IDEyQzEzLjc5MDkgMTIgMTIgMTMuNzkwOSAxMiAxNkMxMiAxMS4yMDkxIDEzLjc5MDkgMjAgMTYgMjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xNiAyMkM3LjE2Mzc0IDIyIDAgMjAuMjA5MSAwIDI0QzAgMjYuMjA5MSA3LjE2Mzc0IDI4IDE2IDI4QzI0LjgzNjMgMjggMzIgMjYuMjA5MSAzMiAyNEMzMiAyMC4yMDkxIDI0LjgzNjMgMjIgMTYgMjJaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                                  }}
                                />
                                <div>
                                  <p className="font-medium text-foreground">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.userId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'CHIEF' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'USER' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">{user.remainToken}</td>
                            <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => handleDeleteUser(user.userId)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}