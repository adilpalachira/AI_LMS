import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Search, Sparkles } from 'lucide-react';

export default function ChatSessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session =>
    (session.title || 'Untitled Chat').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200/80 rounded-[20px] shadow-sm w-full md:w-80 flex-shrink-0 overflow-hidden">
      {/* Header & New Chat Button */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>New Conversation</span>
        </button>

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Sessions Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          <span>Previous Chats</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            {filteredSessions.length}
          </span>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-xs font-medium space-y-1">
            <p>No conversations found</p>
            <p className="text-[11px] text-gray-400 font-normal">Start a new chat to ask course questions.</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session._id === activeSessionId;
            return (
              <div
                key={session._id}
                onClick={() => onSelectSession(session._id)}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-all ${
                  isActive
                    ? 'bg-blue-50/90 text-blue-950 font-bold border border-blue-200/80 shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-5">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="truncate leading-snug">{session.title || 'Untitled Chat'}</p>
                    <p className="text-[10px] text-gray-400 font-normal truncate mt-0.5">
                      {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : 'Active session'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this conversation session?')) {
                      onDeleteSession(session._id);
                    }
                  }}
                  title="Delete conversation"
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
