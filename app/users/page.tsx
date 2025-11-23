'use client';

import { useState, useEffect } from 'react';
import { getAuthHeaders } from '@/app/lib/auth';
import Link from 'next/link';
import Header from '@/app/components/ui/Header';
import Sidebar from '@/app/components/ui/Sidebar';

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

      const response = await fetch(`https://prod.windeath44.wiki/api/users/admin?${params.toString()}`, {
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-blue-500/30">
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeItem="users" />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-8">

              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <p className="text-[10px] font-bold tracking-[0.3em] text-blue-400 uppercase">System Administration</p>
                  </div>
                  <h1 className="text-4xl font-light tracking-tighter text-[var(--foreground)] font-serif">
                    User <span className="font-bold italic">Management</span>
                  </h1>
                </div>
                <Link
                  href="/users/create"
                  className="group relative px-6 py-3 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold tracking-[0.2em] rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] overflow-hidden uppercase flex items-center gap-3 border border-[var(--foreground)]/10"
                >
                  <span className="relative z-10 text-[var(--inverse-foreground)] group-hover:text-white transition-colors">Create Admin</span>
                  <svg className="w-3 h-3 relative z-10 text-[var(--inverse-foreground)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </div>

              {/* Stats Overview */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="glass-card rounded-xl p-6 border border-[var(--border-color)] bg-[var(--foreground)]/[0.02]">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/30 mb-4 uppercase">Total Users</p>
                  <p className="text-4xl font-light text-[var(--foreground)] tracking-tighter">{totalUsers}</p>
                </div>
                <div className="glass-card rounded-xl p-6 border border-[var(--border-color)] bg-[var(--foreground)]/[0.02]">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/30 mb-4 uppercase">Active Page</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-light text-[var(--foreground)] tracking-tighter">{page + 1}</p>
                    <span className="text-sm text-[var(--foreground)]/30 font-light">/ {totalPages}</span>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-6 border border-[var(--border-color)] bg-[var(--foreground)]/[0.02]">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/30 mb-4 uppercase">Visible Rows</p>
                  <p className="text-4xl font-light text-[var(--foreground)] tracking-tighter">{users.length}</p>
                </div>
              </div>

              {/* Filters & Table Container */}
              <div className="glass-panel rounded-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--background)]/20 backdrop-blur-xl">

                {/* Filters Toolbar */}
                <div className="p-6 border-b border-[var(--border-color)] bg-[var(--foreground)]/[0.02]">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-[var(--foreground)]/30 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="SEARCH USERS..."
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/20 focus:outline-none focus:border-blue-500/50 focus:bg-[var(--foreground)]/10 transition-all tracking-wider uppercase font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>

                    <div className="relative">
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-lg py-2.5 px-4 text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/50 focus:bg-[var(--foreground)]/10 transition-all tracking-wider uppercase font-medium appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[var(--background)] text-[var(--foreground)]">All Roles</option>
                        <option value="ADMIN" className="bg-[var(--background)] text-[var(--foreground)]">Admin</option>
                        <option value="CHIEF" className="bg-[var(--background)] text-[var(--foreground)]">Chief</option>
                        <option value="USER" className="bg-[var(--background)] text-[var(--foreground)]">User</option>
                        <option value="TESTER" className="bg-[var(--background)] text-[var(--foreground)]">Tester</option>
                        <option value="ANONYMOUS" className="bg-[var(--background)] text-[var(--foreground)]">Anonymous</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[var(--foreground)]/30">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-lg py-2.5 px-4 text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500/50 focus:bg-[var(--foreground)]/10 transition-all tracking-wider uppercase font-medium appearance-none cursor-pointer"
                      >
                        <option value="createdAt,desc" className="bg-[var(--background)] text-[var(--foreground)]">Newest First</option>
                        <option value="createdAt,asc" className="bg-[var(--background)] text-[var(--foreground)]">Oldest First</option>
                        <option value="name,asc" className="bg-[var(--background)] text-[var(--foreground)]">Name A-Z</option>
                        <option value="name,desc" className="bg-[var(--background)] text-[var(--foreground)]">Name Z-A</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[var(--foreground)]/30">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    <button
                      onClick={handleSearch}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-lg py-2.5 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                {/* Table Content */}
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 z-10 bg-[var(--background)]/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">Loading Data...</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <p className="text-red-400 text-sm mb-4">{error}</p>
                      <button onClick={() => fetchUsers()} className="text-xs font-bold text-[var(--foreground)] bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 px-4 py-2 rounded-lg uppercase tracking-wider transition-colors">
                        Retry Connection
                      </button>
                    </div>
                  )}

                  {!loading && !error && users.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-[var(--foreground)]/40 text-sm font-light">No users found matching your criteria.</p>
                    </div>
                  )}

                  {!loading && !error && users.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[var(--border-color)] bg-[var(--foreground)]/[0.02]">
                            <th className="py-4 px-6 text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em]">User Identity</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Contact</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Role</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Tokens</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Joined</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                          {users.map((user) => (
                            <tr key={user.userId} className="group hover:bg-[var(--foreground)]/[0.02] transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img
                                      src={user.profile}
                                      alt={user.name}
                                      className="w-10 h-10 rounded-full bg-zinc-800 object-cover ring-2 ring-[var(--border-color)] group-hover:ring-[var(--foreground)]/20 transition-all"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMTgxODE4Ii8+CjxwYXRoIGQ9Ik0xNiAyMEMxOC4yMDkxIDIwIDIwIDExLjI5MDkgMjAgMTZDMjAgMTMuNzkwOSAxOC4yMDkxIDEyIDE2IDEyQzEzLjc5MDkgMTIgMTIgMTMuNzkwOSAxMiAxNkMxMiAxMS4yMDkxIDEzLjc5MDkgMjAgMTYgMjBaIiBmaWxsPSIjNDQ0NDQ0Ii8+CjxwYXRoIGQ9Ik0xNiAyMkM3LjE2Mzc0IDIyIDAgMjAuMjA5MSAwIDI0QzAgMjYuMjA5MSA3LjE2Mzc0IDI4IDE2IDI4QzI0LjgzNjMgMjggMzIgMjYuMjA5MSAzMiAyNEMzMiAyMC4yMDkxIDI0LjgzNjMgMjIgMTYgMjJaIiBmaWxsPSIjNDQ0NDQ0Ii8+Cjwvc3ZnPgo=';
                                      }}
                                    />
                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--background)] ${user.role === 'ADMIN' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                                      }`} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-[var(--foreground)] text-sm tracking-tight group-hover:text-blue-400 transition-colors">{user.name}</p>
                                    <p className="text-xs text-[var(--foreground)]/30 font-mono mt-0.5">{user.userId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs text-[var(--foreground)]/60 font-light">{user.email}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                                  user.role === 'CHIEF' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                                    user.role === 'USER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                      'bg-[var(--foreground)]/5 text-[var(--foreground)]/40 border-[var(--border-color)]'
                                  }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono text-[var(--foreground)]/80">{user.remainToken.toLocaleString()}</span>
                                  <span className="text-[10px] text-[var(--foreground)]/20 uppercase">TKN</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs text-[var(--foreground)]/40 font-mono">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button
                                  onClick={() => handleDeleteUser(user.userId)}
                                  className="group/btn relative p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                  title="Delete User"
                                >
                                  <svg className="w-4 h-4 text-[var(--foreground)]/20 group-hover/btn:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
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
                  <div className="border-t border-[var(--border-color)] p-4 bg-[var(--foreground)]/[0.02]">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${page === pageNum
                                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                                : 'text-[var(--foreground)]/40 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'
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
                        className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
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
    </div>
  );
}