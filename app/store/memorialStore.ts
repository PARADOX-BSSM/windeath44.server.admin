import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  MemorialApplication,
  MemorialApplicationListResponse,
  MemorialApplicationState,
  MemorialApplicationFilters
} from '../types/memorial';
import { memorialApiClient } from '../lib/memorial-api';

interface MemorialState {
  applications: MemorialApplicationListResponse[];
  selectedApplication: MemorialApplication | null;
  isLoading: boolean;
  error: string | null;
  filters: MemorialApplicationFilters;
  hasNext: boolean;
  totalCount: number;
  statusCounts: {
    approved: number;
    rejected: number;
    pending: number;
    total: number;
  };
}

interface MemorialActions {
  // Data fetching
  fetchApplications: (filters?: MemorialApplicationFilters) => Promise<void>;
  fetchApplicationById: (id: number, userId?: string) => Promise<void>;
  searchByCharacter: (characterId: number, filters?: MemorialApplicationFilters, userId?: string) => Promise<void>;
  fetchUserApplications: (userId: string, filters?: MemorialApplicationFilters) => Promise<void>;
  
  // Admin actions
  approveApplication: (id: number, authorization?: string) => Promise<void>;
  rejectApplication: (id: number) => Promise<void>;
  updateApplication: (id: number, content: string) => Promise<void>;
  deleteApplication: (id: number) => Promise<void>;
  
  // UI state management
  setFilters: (filters: Partial<MemorialApplicationFilters>) => void;
  setSelectedApplication: (application: MemorialApplication | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearApplications: () => void;
  
  // Bulk operations
  bulkApprove: (ids: number[]) => Promise<void>;
  bulkReject: (ids: number[]) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
  
  // Statistics
  calculateStatusCounts: () => void;
  refreshData: () => Promise<void>;
}

type MemorialStore = MemorialState & MemorialActions;

const initialState: MemorialState = {
  applications: [],
  selectedApplication: null,
  isLoading: false,
  error: null,
  filters: {
    size: 20,
    cursorId: undefined,
    memorizingCode: undefined,
    characterId: undefined,
    userId: undefined,
  },
  hasNext: false,
  totalCount: 0,
  statusCounts: {
    approved: 0,
    rejected: 0,
    pending: 0,
    total: 0,
  },
};

export const useMemorialStore = create<MemorialStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Data fetching
        fetchApplications: async (filters = {}) => {
          const { setLoading, setError, calculateStatusCounts } = get();
          
          setLoading(true);
          setError(null);
          
          try {
            const mergedFilters = { ...get().filters, ...filters };
            const response = await memorialApiClient.getMemorialApplications(mergedFilters);
            
            set((state) => ({
              applications: filters.cursorId ? [...state.applications, ...response.values] : response.values,
              hasNext: response.hasNext,
              totalCount: response.values.length,
              filters: mergedFilters,
            }));
            
            calculateStatusCounts();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch applications');
          } finally {
            setLoading(false);
          }
        },

        fetchApplicationById: async (id, userId) => {
          const { setLoading, setError } = get();
          
          setLoading(true);
          setError(null);
          
          try {
            const application = await memorialApiClient.getMemorialApplication(id, userId);
            set({
              selectedApplication: {
                memorialApplicationId: id,
                ...application,
              },
            });
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch application');
          } finally {
            setLoading(false);
          }
        },

        searchByCharacter: async (characterId, filters = {}, userId) => {
          const { setLoading, setError, calculateStatusCounts } = get();
          
          setLoading(true);
          setError(null);
          
          try {
            const mergedFilters = { ...get().filters, ...filters };
            const response = await memorialApiClient.searchMemorialApplications(
              characterId,
              mergedFilters,
              userId
            );
            
            set((state) => ({
              applications: filters.cursorId ? [...state.applications, ...response.values] : response.values,
              hasNext: response.hasNext,
              totalCount: response.values.length,
              filters: { ...mergedFilters, characterId },
            }));
            
            calculateStatusCounts();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to search applications');
          } finally {
            setLoading(false);
          }
        },

        fetchUserApplications: async (userId, filters = {}) => {
          const { setLoading, setError, calculateStatusCounts } = get();
          
          setLoading(true);
          setError(null);
          
          try {
            const mergedFilters = { ...get().filters, ...filters };
            const response = await memorialApiClient.getMyMemorialApplications(userId, mergedFilters);
            
            set((state) => ({
              applications: filters.cursorId ? [...state.applications, ...response.values] : response.values,
              hasNext: response.hasNext,
              totalCount: response.values.length,
              filters: { ...mergedFilters, userId },
            }));
            
            calculateStatusCounts();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch user applications');
          } finally {
            setLoading(false);
          }
        },

        // Admin actions
        approveApplication: async (id, authorization) => {
          const { setLoading, setError, refreshData } = get();
          
          setLoading(true);
          setError(null);
          
          try {
            await memorialApiClient.approveMemorialApplication(id, authorization);
            
            // Update local state
            set((state) => ({
              applications: state.applications.map((app) =>
                app.memorialApplicationId === id ? { ...app, state: 'APPROVED' as MemorialApplicationState } : app
              ),
              selectedApplication: state.selectedApplication?.memorialApplicationId === id
                ? { ...state.selectedApplication, state: 'APPROVED' as MemorialApplicationState }
                : state.selectedApplication,
            }));
            
            get().calculateStatusCounts();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to approve application');
          } finally {
            setLoading(false);
          }
        },

        rejectApplication: async (id) => {
          const { setLoading, setError } = get();
          
          setLoading(true);
          setError(null);
          
          try {
            await memorialApiClient.rejectMemorialApplication(id);
            
            // Update local state
            set((state) => ({
              applications: state.applications.map((app) =>
                app.memorialApplicationId === id ? { ...app, state: 'REJECTED' as MemorialApplicationState } : app
              ),
              selectedApplication: state.selectedApplication?.memorialApplicationId === id
                ? { ...state.selectedApplication, state: 'REJECTED' as MemorialApplicationState }
                : state.selectedApplication,
            }));
            
            get().calculateStatusCounts();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to reject application');
          } finally {
            setLoading(false);
          }
        },

        updateApplication: async (id, content) => {
          const { setLoading, setError } = get();
          
          setLoading(true);
          setError(null);
          
          try {
            await memorialApiClient.updateMemorialApplication(id, { content });
            
            // Update local state
            set((state) => ({
              applications: state.applications.map((app) =>
                app.memorialApplicationId === id ? { ...app, content } : app
              ),
              selectedApplication: state.selectedApplication?.memorialApplicationId === id
                ? { ...state.selectedApplication, content }
                : state.selectedApplication,
            }));
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update application');
          } finally {
            setLoading(false);
          }
        },

        deleteApplication: async (id) => {
          const { setLoading, setError } = get();
          
          setLoading(true);
          setError(null);
          
          try {
            await memorialApiClient.deleteMemorialApplication(id);
            
            // Remove from local state
            set((state) => ({
              applications: state.applications.filter((app) => app.memorialApplicationId !== id),
              selectedApplication: state.selectedApplication?.memorialApplicationId === id ? null : state.selectedApplication,
              totalCount: state.totalCount - 1,
            }));
            
            get().calculateStatusCounts();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete application');
          } finally {
            setLoading(false);
          }
        },

        // Bulk operations
        bulkApprove: async (ids) => {
          const { approveApplication } = get();
          await Promise.allSettled(ids.map(id => approveApplication(id)));
        },

        bulkReject: async (ids) => {
          const { rejectApplication } = get();
          await Promise.allSettled(ids.map(id => rejectApplication(id)));
        },

        bulkDelete: async (ids) => {
          const { deleteApplication } = get();
          await Promise.allSettled(ids.map(id => deleteApplication(id)));
        },

        // UI state management
        setFilters: (filters) => {
          set((state) => ({
            filters: { ...state.filters, ...filters },
          }));
        },

        setSelectedApplication: (application) => {
          set({ selectedApplication: application });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error });
        },

        clearApplications: () => {
          set({
            applications: [],
            hasNext: false,
            totalCount: 0,
          });
        },

        // Statistics
        calculateStatusCounts: () => {
          const { applications } = get();
          
          const counts = applications.reduce(
            (acc, app) => {
              acc.total++;
              switch (app.state) {
                case 'APPROVED':
                  acc.approved++;
                  break;
                case 'REJECTED':
                  acc.rejected++;
                  break;
                case 'PENDING':
                  acc.pending++;
                  break;
              }
              return acc;
            },
            { approved: 0, rejected: 0, pending: 0, total: 0 }
          );
          
          set({ statusCounts: counts });
        },

        refreshData: async () => {
          const { filters, fetchApplications } = get();
          await fetchApplications({ ...filters, cursorId: undefined });
        },
      }),
      {
        name: 'memorial-storage',
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'memorial-store',
    }
  )
);