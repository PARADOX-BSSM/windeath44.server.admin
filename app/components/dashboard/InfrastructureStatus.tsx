import { useInfrastructureStore } from '../../store/infrastructureStore';

interface InfrastructureStatusProps {
  onItemClick?: (itemId: string) => void;
}

export default function InfrastructureStatus({ onItemClick }: InfrastructureStatusProps) {
  const { 
    items, 
    isLoading, 
    healthOverview, 
    refreshAllItems, 
    toggleMaintenance 
  } = useInfrastructureStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
      case 'Connected':
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Error':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
  };

  const handleRefresh = async () => {
    await refreshAllItems();
  };

  const handleToggleMaintenance = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMaintenance(itemId);
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-foreground">Infrastructure Status</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">
              {healthOverview.healthy} Healthy
            </span>
            {healthOverview.warning > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                {healthOverview.warning} Warning
              </span>
            )}
            {healthOverview.error > 0 && (
              <span className="text-red-600 dark:text-red-400">
                {healthOverview.error} Error
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Refresh infrastructure"
        >
          <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.isArray(items) && items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-foreground">{item.name}</h4>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
                <button
                  onClick={(e) => handleToggleMaintenance(item.id, e)}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={item.status === 'Maintenance' ? 'Exit maintenance' : 'Enter maintenance'}
                >
                  {item.status === 'Maintenance' ? 'Exit' : 'Maint'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.details}</p>
            {item.metrics.uptime && (
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>Uptime: {item.metrics.uptime}%</span>
                {item.metrics.responseTime && (
                  <span>{item.metrics.responseTime}ms</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}