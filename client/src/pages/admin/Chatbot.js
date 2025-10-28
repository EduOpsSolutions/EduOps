import React, { useEffect, useRef } from "react";
import { BsTrash, BsClipboard } from "react-icons/bs";
import useAuthStore from "../../stores/authStore";
import useChatbotStore from "../../stores/chatbotStore";

export default function Chatbot() {
  const {
    messages,
    input,
    isStreaming,
    chats,
    activeChat,
    sidebarOpen,
    quickActions,

    setInput,
    setSidebarOpen,
    setActiveChat,
    sendMessage,
    deleteChat,
    addChat,
    handleQuickAction,
    copyMessage,
  } = useChatbotStore();

  const { getUser } = useAuthStore();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full overflow-hidden flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="font-semibold text-lg">Chat History</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center justify-between px-4 py-2 text-sm truncate cursor-pointer ${
                  activeChat === chat.id
                    ? "bg-german-red bg-opacity-10 text-dark-red border-l-4 border-dark-red"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <button
                  className="flex-1 text-left"
                  onClick={() => setActiveChat(chat.id)}
                >
                  {chat.title}
                </button>
                <button
                  onClick={() => deleteChat(chat.id)}
                  className="ml-2 text-gray-400 hover:text-dark-red"
                >
                  <BsTrash />
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => addChat()}
              className="w-full px-3 py-2 bg-dark-red text-white rounded-md text-sm hover:bg-dark-red-2"
            >
              + New Chat
            </button>
          </div>
        </aside>
      )}

      {/* Main Chat */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-2 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                ☰
              </button>
            )}
            <h1 className="text-lg font-semibold">EduOps Assistant</h1>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-auto p-6 space-y-4">
          {/* Quick Actions - only show if no user messages */}
          {!messages.some((m) => m.role === "user") && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.text)}
                    className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-dark-red hover:shadow-lg transition-all duration-200 text-left group"
                  >
                    <div className="flex-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-sm leading-tight">
                        {action.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2 max-w-xl ${
                m.role === "user"
                  ? "ml-auto flex-row-reverse text-right"
                  : "mr-auto text-left"
              }`}
            >
              {/* Avatar */}
              {m.role === "assistant" ? (
                <div className="flex items-center justify-center w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex-shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#000000"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <g
                        id="🔍-Product-Icons"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="ic_fluent_bot_24_filled"
                          fill="#FD0100"
                          fillRule="nonzero"
                        >
                          <path
                            d="M17.7530511,13.999921 C18.9956918,13.999921 20.0030511,15.0072804 20.0030511,16.249921 L20.0030511,17.1550008 C20.0030511,18.2486786 19.5255957,19.2878579 18.6957793,20.0002733 C17.1303315,21.344244 14.8899962,22.0010712 12,22.0010712 C9.11050247,22.0010712 6.87168436,21.3444691 5.30881727,20.0007885 C4.48019625,19.2883988 4.00354153,18.2500002 4.00354153,17.1572408 L4.00354153,16.249921 C4.00354153,15.0072804 5.01090084,13.999921 6.25354153,13.999921 L17.7530511,13.999921 Z M11.8985607,2.00734093 L12.0003312,2.00049432 C12.380027,2.00049432 12.6938222,2.2826482 12.7434846,2.64872376 L12.7503312,2.75049432 L12.7495415,3.49949432 L16.25,3.5 C17.4926407,3.5 18.5,4.50735931 18.5,5.75 L18.5,10.254591 C18.5,11.4972317 17.4926407,12.504591 16.25,12.504591 L7.75,12.504591 C6.50735931,12.504591 5.5,11.4972317 5.5,10.254591 L5.5,5.75 C5.5,4.50735931 6.50735931,3.5 7.75,3.5 L11.2495415,3.49949432 L11.2503312,2.75049432 C11.2503312,2.37079855 11.5324851,2.05700336 11.8985607,2.00734093 L12.0003312,2.00049432 L11.8985607,2.00734093 Z M9.74928905,6.5 C9.05932576,6.5 8.5,7.05932576 8.5,7.74928905 C8.5,8.43925235 9.05932576,8.99857811 9.74928905,8.99857811 C10.4392523,8.99857811 10.9985781,8.43925235 10.9985781,7.74928905 C10.9985781,7.05932576 10.4392523,6.5 9.74928905,6.5 Z M14.2420255,6.5 C13.5520622,6.5 12.9927364,7.05932576 12.9927364,7.74928905 C12.9927364,8.43925235 13.5520622,8.99857811 14.2420255,8.99857811 C14.9319888,8.99857811 15.4913145,8.43925235 15.4913145,7.74928905 C15.4913145,7.05932576 14.9319888,6.5 14.2420255,6.5 Z"
                            id="🎨-Color"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-600 text-white text-sm font-semibold flex-shrink-0">
                  {(() => {
                    const user = getUser();
                    const userInitials = user.firstName[0] + user.lastName[0];
                    const profilePic = user?.profilePicLink;

                    if (profilePic) {
                      return (
                        <>
                          <img
                            src={profilePic}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <span className="w-full h-full items-center justify-center text-white font-bold bg-german-red rounded-full hidden">
                            {userInitials}
                          </span>
                        </>
                      );
                    }

                    return (
                      <span className="w-full h-full flex items-center justify-center text-white font-bold bg-german-red rounded-full">
                        {userInitials}
                      </span>
                    );
                  })()}
                </div>
              )}

              {/* Message bubble */}
              <div>
                <div
                  className={`inline-block px-4 py-2 rounded-2xl shadow-sm ${
                    m.role === "user"
                      ? "bg-slate-600 text-white"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-base leading-relaxed">
                    {m.text ||
                      (isStreaming && m.role === "assistant" ? "…" : "")}
                  </p>
                </div>
                <div className="text-xs text-gray-400 mt-1 flex gap-2 items-center">
                  {new Date(m.ts).toLocaleTimeString()}
                  {m.role === "assistant" &&
                    m.text &&
                    m.text.trim().length > 50 &&
                    !isStreaming &&
                    m.text !== "…" &&
                    !m.text.startsWith("Hello! I'm your EduOps") &&
                    !m.text.startsWith("I'll help you with that task") &&
                    !m.text.includes("Would you like me to start") &&
                    !m.text.includes(
                      "Which class or semester would you like"
                    ) &&
                    !m.text.includes("What would you like to work on today") &&
                    !m.text.includes("How can I help you") &&
                    !m.text.includes("let me process the information") &&
                    !m.text.match(
                      /^(I can|I'll|Let me help|I'm here to).*\?$/
                    ) && (
                      <button
                        onClick={() => copyMessage(m.text)}
                        className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1 transition-colors"
                        title="Copy response"
                      >
                        <BsClipboard />
                        <span>Copy</span>
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <footer className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                isStreaming ? "Assistant is typing…" : "Type something..."
              }
              rows={1}
              className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 resize-none bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red-2"
              disabled={isStreaming}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="px-4 py-2 rounded-lg bg-dark-red text-white text-sm font-medium hover:bg-dark-red-2 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
