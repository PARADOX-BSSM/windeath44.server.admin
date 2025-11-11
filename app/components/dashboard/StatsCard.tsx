import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
  bgColor: string;
  iconColor: string;
  valueColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  bgColor, 
  iconColor, 
  valueColor = 'text-foreground' 
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        <div className={`h-12 w-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}