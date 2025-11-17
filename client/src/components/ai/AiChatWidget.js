import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { RiRobot2Line } from 'react-icons/ri';
import { Tooltip } from 'flowbite-react';
import axiosInstance from '../../utils/axios';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * Floating AI Chat Widget (frontend-only stub)
 * - Bottom-right floating button opens a chat panel
 * - Restricts answers to scheduling topics
 * - Prepared for future Gemini integration (hook at sendMessage)
 */
function AiChatWidget({
  schedules = [],
  teachers = [],
  courses = [],
  onScheduleCreate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your Scheduling Assistant. I can answer questions about schedules and help propose schedule setups.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);
  const panelRef = useRef(null);

  // Resizable state
  const [panelSize, setPanelSize] = useState({ width: 384, height: 500 }); // Default: w-96, h-auto
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Close when clicking outside the panel
  useEffect(() => {
    if (!isOpen || isResizing) return;
    const handlePointerDown = (event) => {
      const panelEl = panelRef.current;
      if (!panelEl) return;
      if (!panelEl.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isOpen, isResizing]);

  // Handle resize
  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: panelSize.width,
      height: panelSize.height,
      direction,
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const { x, y, width, height, direction } = resizeStartPos.current;
      const deltaX = x - e.clientX; // Reversed because panel is on the right
      const deltaY = y - e.clientY; // Reversed because panel grows upward

      let newWidth = width;
      let newHeight = height;

      if (direction.includes('left')) {
        newWidth = Math.max(300, Math.min(800, width + deltaX));
      }
      if (direction.includes('top')) {
        newHeight = Math.max(300, Math.min(window.innerHeight - 150, height + deltaY));
      }

      setPanelSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const scheduleIndex = useMemo(() => {
    const byDay = {};
    for (const s of schedules) {
      if (!s?.days) continue;
      s.days
        .split(',')
        .map((d) => d.trim().toUpperCase())
        .forEach((d) => {
          byDay[d] = byDay[d] || [];
          byDay[d].push(s);
        });
    }
    return byDay;
  }, [schedules]);

  const isSchedulingQuestion = (text) => {
    const t = text.toLowerCase();
    const keywords = [
      'schedule',
      'time',
      'class',
      'course',
      'teacher',
      'days',
      'm',
      't',
      'w',
      'th',
      'f',
      'su',
      'sat',
      'sun',
      'room',
      'create',
      'set',
      'update',
      'conflict',
      'available',
      'availability',
      'period',
      'batch',
    ];
    return keywords.some((k) => t.includes(k));
  };

  const listDay = (t) => {
    const map = {
      sunday: 'SU',
      sun: 'SU',
      monday: 'M',
      mon: 'M',
      tuesday: 'T',
      tue: 'T',
      wednesday: 'W',
      wed: 'W',
      thursday: 'TH',
      thu: 'TH',
      friday: 'F',
      fri: 'F',
      saturday: 'S',
      sat: 'S',
    };
    const found = Object.keys(map).find((k) => t.includes(k));
    if (!found) return null;
    return map[found];
  };

  const generateLocalReply = (userText) => {
    if (!isSchedulingQuestion(userText)) {
      return "I can only assist with scheduling. Try: 'What classes are on Thursday?' or 'Suggest a slot for A1 next week.'";
    }

    // Simple heuristics
    const day = listDay(userText.toLowerCase());
    if (day && scheduleIndex[day]) {
      const items = scheduleIndex[day]
        .slice(0, 5)
        .map(
          (s) =>
            `${s.courseName || 'Course'} — ${s.time_start || ''}${
              s.time_end ? ' - ' + s.time_end : ''
            } ${s.location ? '@ ' + s.location : ''}`
        )
        .join('\n');
      return items || 'No classes found for that day.';
    }

    if (/suggest|slot|available|availability/.test(userText.toLowerCase())) {
      return 'To suggest a slot, tell me the course, preferred days (e.g., M,W,F), and time range. I will propose options in a future update.';
    }

    return 'Ask about schedules by day or course. Example: "Show A1 times" or "What is scheduled on Wed?"';
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isThinking) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setIsThinking(true);

    try {
      // Build history from messages (exclude current one)
      const history = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        content: msg.text,
      }));

      const payload = {
        prompt: text,
        history,
        context: {
          schedules: (schedules || []).slice(0, 50),
          teachers: (teachers || []).slice(0, 50),
          courses: (courses || []).slice(0, 50),
        },
      };

      const response = await axiosInstance.post('/ai/ask', payload);
      const data = response.data;
      let aiText = data?.text || generateLocalReply(text);
      console.log('datareceived from gemini', data);

      // Check if AI wants to create a schedule
      if (data?.action === 'create_schedule' && data?.scheduleData) {
        // Clean up the text - remove any SCHEDULE_CREATE_COMMAND remnants
        aiText = aiText.replace(/SCHEDULE_CREATE_COMMAND[\s\S]*$/m, '').trim();
        setMessages((m) => [...m, { role: 'assistant', text: aiText }]);

        if (onScheduleCreate) {
          onScheduleCreate(data.scheduleData);
        }
      } else {
        setMessages((m) => [...m, { role: 'assistant', text: aiText }]);
      }
    } catch (e) {
      const fallback = generateLocalReply(text);
      setMessages((m) => [...m, { role: 'assistant', text: fallback }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="z-10 fixed bottom-4 right-4 rounded-full w-20 h-20 md:w-16 md:h-16 shadow-lg flex items-center justify-center bg-dark-red-2 hover:bg-dark-red-3 text-white transition-colors duration-200"
        aria-label="Open AI Assistant"
      >
        {/* Simple robot icon */}
        <Tooltip content="Open AI Assistant">
          <RiRobot2Line className="size-8 md:size-6" />
        </Tooltip>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-4 z-50 bg-white rounded-lg border-2 border-neutral-300 shadow-xl flex flex-col transition-opacity duration-300 ease-out"
          style={{
            width: `${panelSize.width}px`,
            height: `${panelSize.height}px`,
            maxWidth: '90vw',
            maxHeight: 'calc(100vh - 150px)',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Resize handles */}
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize hover:bg-dark-red-2/20 transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
            title="Resize"
          >
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-dark-red-2 opacity-50"></div>
          </div>
          <div
            className="absolute top-0 left-0 right-0 h-2 cursor-n-resize hover:bg-dark-red-2/20 transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'top')}
            title="Resize height"
          ></div>
          <div
            className="absolute top-0 bottom-0 left-0 w-2 cursor-w-resize hover:bg-dark-red-2/20 transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'left')}
            title="Resize width"
          ></div>
          <div className="px-4 py-3 border-b bg-dark-red-2 text-white rounded-t-lg flex items-center justify-between flex-shrink-0">
            <div className="font-semibold flex items-center gap-2">
              Scheduling Assistant
              <span className="text-xs text-white/60">(drag corners to resize)</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div
            ref={scrollRef}
            className="p-3 space-y-2 overflow-y-auto flex-1"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`text-sm ${
                  m.role === 'assistant' ? 'text-gray-800' : 'text-gray-900'
                }`}
              >
                <div
                  className={`${
                    m.role === 'assistant'
                      ? 'bg-gray-100'
                      : 'bg-dark-red-2 text-white'
                  } inline-block px-3 py-2 rounded-lg max-w-[85%] ${
                    m.role === 'user' ? 'whitespace-pre-wrap' : ''
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <MarkdownRenderer content={m.text} />
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="text-sm text-gray-800">
                <div className="bg-gray-100 inline-block px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about schedules..."
              className="flex-1 border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-red-2"
            />
            <button
              onClick={sendMessage}
              disabled={isThinking}
              className="px-4 py-2 bg-dark-red-2 hover:bg-dark-red-3 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThinking ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

AiChatWidget.propTypes = {
  schedules: PropTypes.array,
  teachers: PropTypes.array,
  courses: PropTypes.array,
  onScheduleCreate: PropTypes.func,
};

export default AiChatWidget;
