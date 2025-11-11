// Optimized Events Store with O(1) filtering using indices
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SystemEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EventFilter {
  type: string;
  severity: string;
  source: string;
  acknowledged: boolean | null;
  timeRange: number; // hours
}

// Optimized indices for O(1) filtering
interface EventIndices {
  byType: Map<string, Set<string>>;
  bySeverity: Map<string, Set<string>>;
  bySource: Map<string, Set<string>>;
  byAcknowledged: Map<boolean, Set<string>>;
  byTimeRange: Map<number, Set<string>>; // Bucketed by hour
}

export interface EventsState {
  events: Map<string, SystemEvent>; // Use Map for O(1) access
  filteredEvents: SystemEvent[]; // Computed property for compatibility
  filteredEventIds: string[];
  indices: EventIndices;
  filters: EventFilter;
  isLoading: boolean;
  loading: boolean; // Keep both for compatibility
  error: string | null;
  stats: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    unresolved: number;
  };
}

export interface EventsActions {
  addEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
  updateEvent: (id: string, updates: Partial<SystemEvent>) => void;
  removeEvent: (id: string) => void;
  acknowledgeEvent: (id: string) => void; // Alias for compatibility
  markResolved: (id: string) => void;
  setFilter: (filter: Partial<EventFilter>) => void;
  clearFilters: () => void;
  getFilteredEvents: () => SystemEvent[];
  refreshEvents: () => Promise<void>;
  getEventStats: () => void;
  getUnacknowledgedCount: () => number;
  bulkAddEvents: (events: SystemEvent[]) => void;
}

export type EventsStore = EventsState & EventsActions;

const DEFAULT_FILTER: EventFilter = {
  type: 'all',
  severity: 'all',
  source: 'all',
  acknowledged: null,
  timeRange: 24, // Last 24 hours
};

export const useEventsStore = create<EventsStore>()(
  persist(
    (set, get) => ({
      // State
      events: new Map(),
      filteredEvents: [],
      filteredEventIds: [],
      indices: {
        byType: new Map(),
        bySeverity: new Map(),
        bySource: new Map(),
        byAcknowledged: new Map(),
        byTimeRange: new Map(),
      },
      filters: DEFAULT_FILTER,
      isLoading: false,
      loading: false,
      error: null,
      stats: {
        total: 0,
        byType: {},
        bySeverity: {},
        unresolved: 0,
      },

      // Actions
      addEvent: (eventData) => {
        const event: SystemEvent = {
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          ...eventData,
          acknowledged: eventData.acknowledged ?? false,
        };

        set((state) => {
          const newEvents = new Map(state.events);
          newEvents.set(event.id, event);

          const newIndices = updateIndices(state.indices, event, 'add');
          const filteredIds = applyFiltersOptimized(newIndices, state.filters, newEvents);
          const filteredEvents = filteredIds
            .map(id => newEvents.get(id))
            .filter((event): event is SystemEvent => event !== undefined)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          return {
            events: newEvents,
            indices: newIndices,
            filteredEventIds: filteredIds,
            filteredEvents,
            stats: calculateStats(newEvents),
          };
        });
      },

      updateEvent: (id, updates) => {
        set((state) => {
          const event = state.events.get(id);
          if (!event) return state;

          const updatedEvent = { ...event, ...updates };
          const newEvents = new Map(state.events);
          newEvents.set(id, updatedEvent);

          // Remove old indices and add new ones
          let newIndices = updateIndices(state.indices, event, 'remove');
          newIndices = updateIndices(newIndices, updatedEvent, 'add');

          const filteredIds = applyFiltersOptimized(newIndices, state.filters, newEvents);
          const filteredEvents = filteredIds
            .map(id => newEvents.get(id))
            .filter((event): event is SystemEvent => event !== undefined)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          return {
            events: newEvents,
            indices: newIndices,
            filteredEventIds: filteredIds,
            filteredEvents,
            stats: calculateStats(newEvents),
          };
        });
      },

      removeEvent: (id) => {
        set((state) => {
          const event = state.events.get(id);
          if (!event) return state;

          const newEvents = new Map(state.events);
          newEvents.delete(id);

          const newIndices = updateIndices(state.indices, event, 'remove');
          const filteredIds = applyFiltersOptimized(newIndices, state.filters, newEvents);
          const filteredEvents = filteredIds
            .map(id => newEvents.get(id))
            .filter((event): event is SystemEvent => event !== undefined)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          return {
            events: newEvents,
            indices: newIndices,
            filteredEventIds: filteredIds,
            filteredEvents,
            stats: calculateStats(newEvents),
          };
        });
      },

      acknowledgeEvent: (id) => {
        const { updateEvent } = get();
        updateEvent(id, { acknowledged: true });
      },

      markResolved: (id) => {
        const { updateEvent } = get();
        updateEvent(id, { acknowledged: true });
      },

      setFilter: (filterUpdate) => {
        set((state) => {
          const newFilters = { ...state.filters, ...filterUpdate };
          const filteredIds = applyFiltersOptimized(state.indices, newFilters, state.events);
          const filteredEvents = filteredIds
            .map(id => state.events.get(id))
            .filter((event): event is SystemEvent => event !== undefined)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          return {
            filters: newFilters,
            filteredEventIds: filteredIds,
            filteredEvents,
          };
        });
      },

      clearFilters: () => {
        set((state) => {
          const filteredEventIds = Array.from(state.events.keys());
          const filteredEvents = filteredEventIds
            .map(id => state.events.get(id))
            .filter((event): event is SystemEvent => event !== undefined)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          
          return {
            filters: DEFAULT_FILTER,
            filteredEventIds,
            filteredEvents,
          };
        });
      },

      getFilteredEvents: () => {
        const { events, filteredEventIds } = get();
        return filteredEventIds
          .map(id => events.get(id))
          .filter((event): event is SystemEvent => event !== undefined)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by timestamp DESC
      },

      refreshEvents: async () => {
        set({ loading: true, isLoading: true, error: null });

        try {
          // Simulate API call - replace with actual implementation
          const mockEvents: SystemEvent[] = [
            {
              id: 'evt1',
              type: 'error',
              severity: 'high',
              title: 'Database Connection Lost',
              description: 'Lost connection to primary database',
              source: 'database',
              timestamp: new Date(Date.now() - 300000),
              acknowledged: false,
            },
            {
              id: 'evt2',
              type: 'warning',
              severity: 'medium',
              title: 'High Memory Usage',
              description: 'Memory usage exceeded 80%',
              source: 'system',
              timestamp: new Date(Date.now() - 600000),
              acknowledged: true,
            },
          ];

          const { bulkAddEvents } = get();
          bulkAddEvents(mockEvents);

          set({ loading: false, isLoading: false });
        } catch (error) {
          set({
            loading: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to refresh events',
          });
        }
      },

      getEventStats: () => {
        const { events } = get();
        const stats = calculateStats(events);
        set({ stats });
      },

      bulkAddEvents: (events) => {
        set((state) => {
          const newEvents = new Map(state.events);
          let newIndices = { ...state.indices };

          // Batch process events for better performance
          events.forEach(event => {
            newEvents.set(event.id, event);
            newIndices = updateIndices(newIndices, event, 'add');
          });

          const filteredIds = applyFiltersOptimized(newIndices, state.filters, newEvents);
          const filteredEvents = filteredIds
            .map(id => newEvents.get(id))
            .filter((event): event is SystemEvent => event !== undefined)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          return {
            events: newEvents,
            indices: newIndices,
            filteredEventIds: filteredIds,
            filteredEvents,
            stats: calculateStats(newEvents),
          };
        });
      },

      getUnacknowledgedCount: () => {
        const { events } = get();
        let count = 0;
        for (const event of events.values()) {
          if (!event.acknowledged) count++;
        }
        return count;
      },
    }),
    {
      name: 'events-storage',
      partialize: (state) => ({
        // Only persist essential data, not indices (will be rebuilt)
        events: Array.from(state.events.entries()).slice(0, 500), // Convert Map to Array for persistence
        filters: state.filters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rebuild Map and indices from persisted array
          const eventsMap = new Map(state.events as any) as Map<string, SystemEvent>;
          const indices = rebuildIndices(eventsMap);
          const filteredIds = applyFiltersOptimized(indices, state.filters, eventsMap);
          
          state.events = eventsMap;
          state.indices = indices;
          state.filteredEventIds = filteredIds;
          state.stats = calculateStats(eventsMap);
        }
      },
    }
  )
);

// Helper functions for optimized operations

function updateIndices(
  indices: EventIndices,
  event: SystemEvent,
  operation: 'add' | 'remove'
): EventIndices {
  const newIndices = {
    byType: new Map(indices.byType),
    bySeverity: new Map(indices.bySeverity),
    bySource: new Map(indices.bySource),
    byAcknowledged: new Map(indices.byAcknowledged),
    byTimeRange: new Map(indices.byTimeRange),
  };

  const timeHour = Math.floor(event.timestamp.getTime() / (1000 * 60 * 60));

  const updateIndex = (map: Map<any, Set<string>>, key: any) => {
    if (operation === 'add') {
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(event.id);
    } else {
      const set = map.get(key);
      if (set) {
        set.delete(event.id);
        if (set.size === 0) map.delete(key);
      }
    }
  };

  updateIndex(newIndices.byType, event.type);
  updateIndex(newIndices.bySeverity, event.severity);
  updateIndex(newIndices.bySource, event.source);
  updateIndex(newIndices.byAcknowledged, event.acknowledged);
  updateIndex(newIndices.byTimeRange, timeHour);

  return newIndices;
}

// O(1) filtering using indices
function applyFiltersOptimized(
  indices: EventIndices,
  filters: EventFilter,
  events: Map<string, SystemEvent>
): string[] {
  const filterSets: Set<string>[] = [];
  
  // Collect relevant index sets
  if (filters.type !== 'all') {
    const typeSet = indices.byType.get(filters.type);
    if (typeSet) filterSets.push(typeSet);
    else return []; // No events of this type
  }
  
  if (filters.severity !== 'all') {
    const severitySet = indices.bySeverity.get(filters.severity);
    if (severitySet) filterSets.push(severitySet);
    else return []; // No events of this severity
  }
  
  if (filters.source !== 'all') {
    const sourceSet = indices.bySource.get(filters.source);
    if (sourceSet) filterSets.push(sourceSet);
    else return []; // No events from this source
  }
  
  if (filters.acknowledged !== null) {
    const acknowledgedSet = indices.byAcknowledged.get(filters.acknowledged);
    if (acknowledgedSet) filterSets.push(acknowledgedSet);
    else return []; // No events with this acknowledged status
  }

  // Time range filter (more complex, requires iteration)
  if (filters.timeRange > 0) {
    const cutoffTime = Date.now() - (filters.timeRange * 60 * 60 * 1000);
    const timeFilteredIds = new Set<string>();
    
    for (const [id, event] of events) {
      if (event.timestamp.getTime() >= cutoffTime) {
        timeFilteredIds.add(id);
      }
    }
    
    if (timeFilteredIds.size > 0) {
      filterSets.push(timeFilteredIds);
    } else {
      return []; // No recent events
    }
  }

  // If no filters applied, return all event IDs
  if (filterSets.length === 0) {
    return Array.from(events.keys());
  }

  // Find intersection of all filter sets - O(min(set sizes))
  let result = filterSets[0];
  for (let i = 1; i < filterSets.length; i++) {
    const intersection = new Set<string>();
    const smaller = result.size <= filterSets[i].size ? result : filterSets[i];
    const larger = result.size > filterSets[i].size ? result : filterSets[i];
    
    for (const id of smaller) {
      if (larger.has(id)) {
        intersection.add(id);
      }
    }
    result = intersection;
  }

  return Array.from(result);
}

function rebuildIndices(events: Map<string, SystemEvent>): EventIndices {
  const indices: EventIndices = {
    byType: new Map(),
    bySeverity: new Map(),
    bySource: new Map(),
    byAcknowledged: new Map(),
    byTimeRange: new Map(),
  };

  for (const event of events.values()) {
    updateIndices(indices, event, 'add');
  }

  return indices;
}

function calculateStats(events: Map<string, SystemEvent>) {
  const stats = {
    total: events.size,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    unresolved: 0,
  };

  for (const event of events.values()) {
    stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
    if (!event.acknowledged) stats.unresolved++;
  }

  return stats;
}