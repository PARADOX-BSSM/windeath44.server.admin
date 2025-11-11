'use client';

import React, { useEffect, useState } from 'react';
import { useMemorialStore } from '../../store/memorialStore';
import { MemorialApplicationListResponse, MemorialApplicationState } from '../../types/memorial';
import ApplicationList from '../../components/memorial/ApplicationList';
import ApplicationDetail from '../../components/memorial/ApplicationDetail';

export default function MemorialApplicationsPage() {
  const {
    applications,
    selectedApplication,
    isLoading,
    error,
    filters,
    hasNext,
    statusCounts,
    fetchApplications,
    fetchApplicationById,
    searchByCharacter,
    approveApplication,
    rejectApplication,
    deleteApplication,
    updateApplication,
    setFilters,
    setSelectedApplication,
    clearApplications,
    bulkApprove,
    bulkReject,
    bulkDelete,
  } = useMemorialStore();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchType, setSearchType] = useState<'all' | 'character'>('all');
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemorialApplicationState | 'all'>('all');

  useEffect(() => {
    // Load applications on component mount
    fetchApplications();
  }, [fetchApplications]);

  const handleSearch = () => {
    clearApplications();
    setSelectedIds([]);
    
    if (searchType === 'character' && searchValue) {
      const characterId = parseInt(searchValue);
      if (!isNaN(characterId)) {
        searchByCharacter(characterId, { 
          size: 20, 
          memorizingCode: statusFilter === 'all' ? undefined : getMemorizingCode(statusFilter)
        });
      }
    } else {
      fetchApplications({ 
        size: 20, 
        memorizingCode: statusFilter === 'all' ? undefined : getMemorizingCode(statusFilter)
      });
    }
  };

  const handleLoadMore = () => {
    const lastApp = applications[applications.length - 1];
    if (lastApp && hasNext) {
      if (searchType === 'character' && searchValue) {
        const characterId = parseInt(searchValue);
        if (!isNaN(characterId)) {
          searchByCharacter(characterId, { 
            cursorId: lastApp.memorialApplicationId,
            size: 20,
            memorizingCode: statusFilter === 'all' ? undefined : getMemorizingCode(statusFilter)
          });
        }
      } else {
        fetchApplications({ 
          cursorId: lastApp.memorialApplicationId,
          size: 20,
          memorizingCode: statusFilter === 'all' ? undefined : getMemorizingCode(statusFilter)
        });
      }
    }
  };

  const getMemorizingCode = (status: MemorialApplicationState): 1 | 2 | 3 => {
    switch (status) {
      case 'APPROVED': return 1;
      case 'REJECTED': return 2;
      case 'PENDING': return 3;
      default: return 1;
    }
  };

  const handleApplicationClick = (application: MemorialApplicationListResponse) => {
    fetchApplicationById(application.memorialApplicationId);
  };

  const handleCloseDetail = () => {
    setSelectedApplication(null);
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    try {
      switch (action) {
        case 'approve':
          await bulkApprove(selectedIds);
          break;
        case 'reject':
          await bulkReject(selectedIds);
          break;
        case 'delete':
          await bulkDelete(selectedIds);
          break;
      }
      setSelectedIds([]);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Memorial Applications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and review memorial applications from users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-foreground">{statusCounts.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts.approved}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statusCounts.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'all' | 'character')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Applications</option>
                  <option value="character">By Character ID</option>
                </select>
                
                {searchType === 'character' && (
                  <input
                    type="number"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Enter Character ID"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                )}
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MemorialApplicationState | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {selectedIds.length} application(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Bulk Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Bulk Reject
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Bulk Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Applications List */}
        <ApplicationList
          applications={applications}
          isLoading={isLoading}
          onApplicationClick={handleApplicationClick}
          onApprove={approveApplication}
          onReject={rejectApplication}
          onDelete={deleteApplication}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showBulkActions={true}
        />

        {/* Load More Button */}
        {hasNext && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {/* Application Detail Modal */}
        <ApplicationDetail
          application={selectedApplication}
          isLoading={isLoading}
          onClose={handleCloseDetail}
          onApprove={approveApplication}
          onReject={rejectApplication}
          onDelete={deleteApplication}
          onUpdate={updateApplication}
        />
      </div>
    </div>
  );
}