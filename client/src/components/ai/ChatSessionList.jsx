import React from 'react';
import { MessageSquare, Plus, Trash2, Sparkles } from 'lucide-react';

export default function ChatSessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}) {
  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full md:w-72 flex-shrink-0">
      {/* Header Actions */}
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Sessions Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Previous Chats
        </div>

        {sessions.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs italic">
            No previous conversations found. Click "New Conversation" to start.
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session._id === activeSessionId;
            return (
              <div
                key={session._id}
                onClick={() => onSelectSession(session._id)}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200/60 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-6">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{session.title || 'Untitled Chat'}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this conversation session?')) {
                      onDeleteSession(session._id);
                    }
                  }}
                  title="Delete chat session"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all"
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
