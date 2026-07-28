import React, { useState } from 'react';
import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import SourceReference from './SourceReference';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'like' | 'dislike' | null

  // Copy full message response
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Copy individual code block
  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Rich inline and block formatting parser
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Split by code blocks ```lang ... ```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockId = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Push pre-code block text
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: content.slice(lastIndex, match.index)
        });
      }

      // Push code block
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        value: match[2].trim(),
        id: blockId++
      });

      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex)
      });
    }

    return parts.map((part, pIdx) => {
      if (part.type === 'code') {
        const isCodeCopied = copiedCodeIndex === part.id;
        return (
          <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-400">
                {part.language}
              </span>
              <button
                onClick={() => handleCopyCode(part.value, part.id)}
                className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] font-medium"
              >
                {isCodeCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200">
              <code>{part.value}</code>
            </pre>
          </div>
        );
      }

      // Format standard markdown lines
      const lines = part.value.split('\n');
      return (
        <div key={pIdx} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} className="h-2" />;

            // Header # / ## / ###
            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="text-sm font-bold text-gray-900 mt-2 mb-1">
                  {trimmed.replace(/^###\s+/, '')}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="text-base font-extrabold text-gray-900 mt-3 mb-1 tracking-tight">
                  {trimmed.replace(/^##\s+/, '')}
                </h3>
              );
            }

            // Bullet items
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const itemText = trimmed.replace(/^[-*]\s+/, '');
              return (
                <div key={lIdx} className="flex items-start gap-2 text-xs leading-relaxed text-gray-800 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2"></span>
                  <span>{parseInlineStyles(itemText)}</span>
                </div>
              );
            }

            // Standard line
            return (
              <p key={lIdx} className="text-xs leading-relaxed text-gray-800">
                {parseInlineStyles(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper for bold and inline code
  const parseInlineStyles = (str) => {
    const tokens = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-950">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={i} className="bg-blue-50 text-blue-900 border border-blue-200/60 font-mono text-[11px] px-1.5 py-0.5 rounded font-semibold">
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  return (
    <div className={`flex items-start gap-3 my-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${
          isUser
            ? 'bg-slate-900 border border-slate-800'
            : 'bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-500/30'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
      </div>

      {/* Content Container */}
      <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-5 py-4 rounded-2xl text-xs leading-relaxed transition-all shadow-2xs ${
            isUser
              ? 'bg-slate-900 text-white rounded-tr-xs font-medium'
              : 'bg-white border border-gray-200/90 text-gray-900 rounded-tl-xs'
          }`}
        >
          {/* Main message content */}
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          ) : (
            <div>{renderFormattedContent(message.content)}</div>
          )}

          {/* Sources for Assistant Messages */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <SourceReference sources={message.sources} />
          )}
        </div>

        {/* Message Metadata & Actions */}
        <div className={`flex items-center gap-3 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-gray-400 font-medium">
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just now'}
          </span>

          {!isUser && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyMessage}
                title="Copy response"
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              
              <button
                onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                title="Helpful response"
                className={`p-1 rounded-lg transition-colors ${
                  feedback === 'like' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                title="Not helpful"
                className={`p-1 rounded-lg transition-colors ${
                  feedback === 'dislike' ? 'text-rose-600 bg-rose-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
