import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No Content Found',
  description = 'There are no items added to this section yet.',
  actionButton = null
}) => {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center space-y-3 my-2">
      <div className="w-12 h-12 bg-gray-50 border border-gray-150 text-gray-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
