import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { RiRobot2Line } from 'react-icons/ri';
import { Tooltip } from 'flowbite-react';

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
  const scrollRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Close when clicking outside the panel
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

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
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');

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

      const resp = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/ai/ask`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!resp.ok) {
        const fallback = generateLocalReply(text);
        setMessages((m) => [...m, { role: 'assistant', text: fallback }]);
        return;
      }

      const data = await resp.json();
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
          className="fixed bottom-24 right-4 z-50 w-[92vw] max-w-sm bg-white rounded-lg border border-neutral-300 shadow-xl flex flex-col transition-all duration-300 ease-out transform opacity-100 translate-y-0"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b bg-dark-red-2 text-white rounded-t-lg flex items-center justify-between">
            <div className="font-semibold">Scheduling Assistant</div>
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
            className="p-3 space-y-2 max-h-80 overflow-y-auto"
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
                  } inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex items-center gap-2">
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
              className="px-4 py-2 bg-dark-red-2 hover:bg-dark-red-3 text-white rounded text-sm"
            >
              Send
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
