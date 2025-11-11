import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface SystemEvent {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  tags: string[];
  metadata?: Record<string, any>;
}

interface EventsState {
  events: SystemEvent[];
  filteredEvents: SystemEvent[];
  isLoading: boolean;
  selectedEvent: string | null;
  filters: {
    type: SystemEvent['type'] | 'all';
    severity: SystemEvent['severity'] | 'all';
    source: string | 'all';
    acknowledged: boolean | 'all';
    timeRange: '1h' | '24h' | '7d' | '30d' | 'all';
  };
  realTimeUpdates: boolean;
  maxEvents: number;
}

interface EventsActions {
  addEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
  acknowledgeEvent: (eventId: string) => void;
  acknowledgeMultipleEvents: (eventIds: string[]) => void;
  deleteEvent: (eventId: string) => void;
  clearAllEvents: () => void;
  setSelectedEvent: (eventId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<EventsState['filters']>) => void;
  applyFilters: () => void;
  setRealTimeUpdates: (enabled: boolean) => void;
  refreshEvents: () => Promise<void>;
  exportEvents: (format: 'json' | 'csv') => void;
  getEventsByType: (type: SystemEvent['type']) => SystemEvent[];
  getUnacknowledgedCount: () => number;
}

type EventsStore = EventsState & EventsActions;

const initialEvents: SystemEvent[] = [
  {
    id: '1',
    title: 'Deployment Successful',
    description: 'Application deployed to production',
    type: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    source: 'ArgoCD',
    severity: 'low',
    acknowledged: false,
    tags: ['deployment', 'production'],
    metadata: {
      version: 'v1.2.3',
      environment: 'production',
    },
  },
  {
    id: '2',
    title: 'Service Mesh Updated',
    description: 'Kiali configuration refreshed',
    type: 'info',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    source: 'Kiali',
    severity: 'low',
    acknowledged: false,
    tags: ['service-mesh', 'configuration'],
    metadata: {
      component: 'istio-proxy',
      version: '1.18.2',
    },
  },
  {
    id: '3',
    title: 'High Memory Usage',
    description: 'Memory usage exceeded 80%',
    type: 'warning',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    source: 'Prometheus',
    severity: 'medium',
    acknowledged: false,
    tags: ['memory', 'performance', 'threshold'],
    metadata: {
      currentUsage: '85%',
      threshold: '80%',
      node: 'worker-node-1',
    },
  },
];

export const useEventsStore = create<EventsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        events: initialEvents,
        filteredEvents: initialEvents,
        isLoading: false,
        selectedEvent: null,
        filters: {
          type: 'all',
          severity: 'all',
          source: 'all',
          acknowledged: 'all',
          timeRange: '24h',
        },
        realTimeUpdates: true,
        maxEvents: 1000,

        // Actions
        addEvent: (eventData) => {
          const newEvent: SystemEvent = {
            ...eventData,
            id: Date.now().toString(),
            timestamp: new Date(),
          };
          
          set((state) => {
            const events = [newEvent, ...state.events].slice(0, state.maxEvents);
            return { events };
          });
          
          // Apply filters after adding
          get().applyFilters();
        },

        acknowledgeEvent: (eventId) =>
          set((state) => ({
            events: state.events.map((event) =>
              event.id === eventId ? { ...event, acknowledged: true } : event
            ),
          })),

        acknowledgeMultipleEvents: (eventIds) =>
          set((state) => ({
            events: state.events.map((event) =>
              eventIds.includes(event.id) ? { ...event, acknowledged: true } : event
            ),
          })),

        deleteEvent: (eventId) =>
          set((state) => ({
            events: state.events.filter((event) => event.id !== eventId),
          })),

        clearAllEvents: () =>
          set(() => ({ events: [], filteredEvents: [] })),

        setSelectedEvent: (eventId) =>
          set(() => ({ selectedEvent: eventId })),

        setLoading: (loading) =>
          set(() => ({ isLoading: loading })),

        setFilters: (newFilters) =>
          set((state) => {
            const filters = { ...state.filters, ...newFilters };
            return { filters };
          }),

        applyFilters: () => {
          const { events, filters } = get();
          let filtered = [...events];

          // Filter by type
          if (filters.type !== 'all') {
            filtered = filtered.filter((event) => event.type === filters.type);
          }

          // Filter by severity
          if (filters.severity !== 'all') {
            filtered = filtered.filter((event) => event.severity === filters.severity);
          }

          // Filter by source
          if (filters.source !== 'all') {
            filtered = filtered.filter((event) => event.source === filters.source);
          }

          // Filter by acknowledged status
          if (filters.acknowledged !== 'all') {
            filtered = filtered.filter((event) => event.acknowledged === filters.acknowledged);
          }

          // Filter by time range
          if (filters.timeRange !== 'all') {
            const now = new Date();
            const timeRanges = {
              '1h': 60 * 60 * 1000,
              '24h': 24 * 60 * 60 * 1000,
              '7d': 7 * 24 * 60 * 60 * 1000,
              '30d': 30 * 24 * 60 * 60 * 1000,
            };
            
            const cutoffTime = new Date(now.getTime() - timeRanges[filters.timeRange]);
            filtered = filtered.filter((event) => event.timestamp >= cutoffTime);
          }

          set(() => ({ filteredEvents: filtered }));
        },

        setRealTimeUpdates: (enabled) =>
          set(() => ({ realTimeUpdates: enabled })),

        refreshEvents: async () => {
          const { setLoading, addEvent } = get();
          
          setLoading(true);
          
          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // Mock new event
            const mockEvents = [
              {
                title: 'New Pod Started',
                description: 'New pod instance started in production',
                type: 'info' as const,
                source: 'Kubernetes',
                severity: 'low' as const,
                acknowledged: false,
                tags: ['kubernetes', 'scaling'],
              },
              {
                title: 'Database Connection Pool Warning',
                description: 'Connection pool utilization above 90%',
                type: 'warning' as const,
                source: 'Database',
                severity: 'medium' as const,
                acknowledged: false,
                tags: ['database', 'performance'],
              },
            ];

            // Randomly add one of the mock events
            const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
            addEvent(randomEvent);
            
          } catch (error) {
            console.error('Failed to refresh events:', error);
          } finally {
            setLoading(false);
          }
        },

        exportEvents: (format) => {
          const { filteredEvents } = get();
          
          if (format === 'json') {
            const dataStr = JSON.stringify(filteredEvents, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `events-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
          } else if (format === 'csv') {
            const headers = ['ID', 'Title', 'Description', 'Type', 'Severity', 'Source', 'Timestamp', 'Acknowledged'];
            const csvContent = [
              headers.join(','),
              ...filteredEvents.map((event) =>
                [
                  event.id,
                  `"${event.title}"`,
                  `"${event.description}"`,
                  event.type,
                  event.severity,
                  event.source,
                  event.timestamp.toISOString(),
                  event.acknowledged,
                ].join(',')
              ),
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `events-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
          }
        },

        getEventsByType: (type) => {
          const { events } = get();
          return events.filter((event) => event.type === type);
        },

        getUnacknowledgedCount: () => {
          const { events } = get();
          return events.filter((event) => !event.acknowledged).length;
        },
      }),
      {
        name: 'events-storage',
        partialize: (state) => ({
          events: state.events,
          filters: state.filters,
          realTimeUpdates: state.realTimeUpdates,
        }),
      }
    ),
    {
      name: 'events-store',
    }
  )
);