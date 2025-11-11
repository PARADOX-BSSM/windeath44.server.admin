import { useMonitoringStore } from '../../store/monitoringStore';

interface MonitoringToolsProps {
  onToolClick?: (toolId: string) => void;
}

export default function MonitoringTools({ onToolClick }: MonitoringToolsProps) {
  const { tools, isLoading, openTool, refreshAllTools } = useMonitoringStore();
  const handleToolClick = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
      // Use admin route for authenticated access to monitoring tools
      const adminUrl = `/admin/${toolId}`;
      window.open(adminUrl, '_blank');
    }
    openTool(toolId);
    onToolClick?.(toolId);
  };

  const handleRefresh = async () => {
    await refreshAllTools();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Inactive':
      case 'Error':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Monitoring Tools</h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Refresh all tools"
        >
          <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 ${tool.bgColor} rounded-lg flex items-center justify-center`}>
                <span className={`${tool.textColor} font-bold text-sm`}>{tool.letter}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{tool.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                {tool.status}
              </span>
              {tool.metrics && (
                <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{tool.metrics.responseTime}ms</span>
                  <span>{tool.metrics.uptime}%</span>
                  <span>{tool.metrics.errorRate}% err</span>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToolClick(tool.id);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                자세히 보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}