import { useEventsStore } from '../../store/events/optimized-events-store';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

interface RecentEventsProps {
  onEventClick?: (eventId: string) => void;
}

export default function RecentEvents({ onEventClick }: RecentEventsProps) {
  const { 
    filteredEvents, 
    isLoading, 
    acknowledgeEvent, 
    refreshEvents, 
    getUnacknowledgedCount 
  } = useEventsStore();
  
  const eventList = filteredEvents.slice(0, 5); // Show only recent 5 events
  const unacknowledgedCount = getUnacknowledgedCount();

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-500',
          bg: 'bg-green-50 dark:bg-green-900/10',
          dot: 'bg-green-500',
        };
      case 'info':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/10',
          dot: 'bg-blue-500',
        };
      case 'warning':
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-50 dark:bg-yellow-900/10',
          dot: 'bg-yellow-500',
        };
      case 'error':
        return {
          border: 'border-red-500',
          bg: 'bg-red-50 dark:bg-red-900/10',
          dot: 'bg-red-500',
        };
      default:
        return {
          border: 'border-gray-500',
          bg: 'bg-gray-50 dark:bg-gray-900/10',
          dot: 'bg-gray-500',
        };
    }
  };

  const handleEventClick = (eventId: string) => {
    onEventClick?.(eventId);
  };

  const handleAcknowledge = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acknowledgeEvent(eventId);
  };

  const handleRefresh = async () => {
    await refreshEvents();
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Recent Events</h3>
          {unacknowledgedCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
              {unacknowledgedCount} new
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Refresh events"
        >
          <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        {eventList.map((event) => {
          const styles = getEventStyle(event.type);
          return (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              className={`flex items-start gap-3 p-3 border-l-4 ${styles.border} ${styles.bg} rounded-r-lg cursor-pointer hover:opacity-80 transition-opacity relative`}
            >
              <div className="mt-1">
                <div className={`h-2 w-2 ${styles.dot} rounded-full`}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  {!event.acknowledged && (
                    <button
                      onClick={(e) => handleAcknowledge(event.id, e)}
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                      title="Acknowledge event"
                    >
                      Ack
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{event.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-500">{formatTimeAgo(event.timestamp)}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{event.source}</span>
                  {event.acknowledged && (
                    <>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-green-600 dark:text-green-400">Acknowledged</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}