'use client';

import React, { useState } from 'react';
import { MemorialApplicationListResponse, MemorialApplicationState } from '../../types/memorial';

interface ApplicationListProps {
  applications: MemorialApplicationListResponse[];
  isLoading: boolean;
  onApplicationClick: (application: MemorialApplicationListResponse) => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  showBulkActions?: boolean;
}

export default function ApplicationList({
  applications,
  isLoading,
  onApplicationClick,
  onApprove,
  onReject,
  onDelete,
  selectedIds = [],
  onSelectionChange,
  showBulkActions = false,
}: ApplicationListProps) {
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const getStatusColor = (status: MemorialApplicationState) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const handleAction = async (action: () => Promise<void>, id: number) => {
    setProcessingIds(prev => new Set([...prev, id]));
    try {
      await action();
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange(applications.map(app => app.memorialApplicationId));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
      }
    }
  };

  const isAllSelected = applications.length > 0 && selectedIds.length === applications.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < applications.length;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="p-6 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm">There are no memorial applications to display.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {showBulkActions && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {selectedIds.length} selected
              </span>
            </div>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => console.log('Bulk approve:', selectedIds)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                >
                  Bulk Approve
                </button>
                <button
                  onClick={() => console.log('Bulk reject:', selectedIds)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                >
                  Bulk Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {applications.map((application) => (
          <div
            key={application.memorialApplicationId}
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {showBulkActions && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(application.memorialApplicationId)}
                    onChange={(e) => handleSelectOne(application.memorialApplicationId, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 
                      className="font-medium text-foreground hover:text-blue-600 cursor-pointer"
                      onClick={() => onApplicationClick(application)}
                    >
                      #{application.memorialApplicationId}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.state)}`}>
                      {application.state}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Character ID: {application.characterId}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {application.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>By: {application.userId}</span>
                    <span>Created: {new Date(application.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {application.likes}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {application.state === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAction(() => onApprove(application.memorialApplicationId), application.memorialApplicationId)}
                      disabled={processingIds.has(application.memorialApplicationId)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      {processingIds.has(application.memorialApplicationId) ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(() => onReject(application.memorialApplicationId), application.memorialApplicationId)}
                      disabled={processingIds.has(application.memorialApplicationId)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {processingIds.has(application.memorialApplicationId) ? 'Processing...' : 'Reject'}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handleAction(() => onDelete(application.memorialApplicationId), application.memorialApplicationId)}
                  disabled={processingIds.has(application.memorialApplicationId)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
                
                <button
                  onClick={() => onApplicationClick(application)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}