import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium py-1.5 flex-wrap">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
      >
        <Home size={14} />
        <span>Dashboard</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={13} className="text-gray-300 shrink-0" />
          {item.to ? (
            <Link
              to={item.to}
              className="text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
