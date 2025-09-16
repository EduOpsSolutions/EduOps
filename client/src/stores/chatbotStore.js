import { create } from 'zustand';

const useChatbotStore = create((set, get) => ({
    // State
    messages: [
        {
            id: 1,
            role: "assistant",
            text: "Hello! I'm your EduOps Assistant. I can help you with creating schedules, generating student grades, and other administrative tasks. What would you like to work on today?",
            ts: Date.now() - 60000
        }
    ],
    input: "",
    isStreaming: false,
    chats: [
        { id: 1, title: "Schedule Creation for Fall 2025" },
        { id: 2, title: "Grade Reports Generation" },
    ],
    activeChat: 1,
    sidebarOpen: false,
    quickActions: [
        { id: 1, text: 'Create class schedule for semester', category: 'scheduling' },
        { id: 2, text: 'Generate grade reports for students', category: 'grades' },
    ],

    // Actions
    setInput: (value) => set({ input: value }),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setActiveChat: (chatId) => set({ activeChat: chatId }),
    setStreaming: (streaming) => set({ isStreaming: streaming }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
            ...message,
            id: message.id || Date.now(),
            ts: message.ts || Date.now()
        }]
    })),

    updateMessage: (messageId, updates) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
        )
    })),

    deleteChat: (chatId) => set((state) => {
        const newChats = state.chats.filter(chat => chat.id !== chatId);
        const newActiveChat = state.activeChat === chatId && newChats.length > 0
            ? newChats[0].id
            : state.activeChat;

        return {
            chats: newChats,
            activeChat: newActiveChat
        };
    }),

    addChat: () => set((state) => ({
        chats: [...state.chats, {
            id: Date.now(),
            title: `Session ${state.chats.length + 1}`
        }]
    })),

    generateResponse: (userText) => {
        const inputLower = userText.toLowerCase();

        if (inputLower.includes('schedule') || inputLower.includes('timetable')) {
            return "Would you like me to start with a template for the current semester?";
        } else if (inputLower.includes('grade') || inputLower.includes('marks') || inputLower.includes('assessment')) {
            return "Which class or semester would you like to focus on?";
        } else {
            return `I'll help you with that. Based on your request about "${userText}", let me process the information and provide you with a solution.`;
        }
    },

    // Helper function to generate unique IDs
    generateMessageId: (role) => `${role}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,

    // Helper function to simulate streaming response
    streamResponse: (assistantId, response) => {
        const { updateMessage, setStreaming } = get();

        let i = 0;
        const streamText = () => {
            i += 2;
            updateMessage(assistantId, { text: response.slice(0, i) });

            if (i < response.length) {
                setTimeout(streamText, 40);
            } else {
                setStreaming(false);
            }
        };

        setTimeout(streamText, 150);
    },

    sendMessage: async () => {
        const { input, addMessage, setInput, setStreaming, generateResponse, generateMessageId, streamResponse } = get();

        if (!input.trim()) return;

        const userMessage = {
            id: generateMessageId('user'),
            role: "user",
            text: input.trim(),
            ts: Date.now()
        };

        const assistantId = generateMessageId('assistant');

        addMessage(userMessage);
        setInput("");
        addMessage({ id: assistantId, role: "assistant", text: "", ts: Date.now() });

        setStreaming(true);
        const response = generateResponse(userMessage.text);
        streamResponse(assistantId, response);
    },

    handleQuickAction: (actionText) => {
        const { addMessage, setStreaming, generateResponse, generateMessageId, streamResponse } = get();

        const userMessage = {
            id: generateMessageId('user'),
            role: "user",
            text: actionText,
            ts: Date.now()
        };

        const assistantId = generateMessageId('assistant');

        addMessage(userMessage);
        addMessage({ id: assistantId, role: "assistant", text: "", ts: Date.now() });

        setStreaming(true);
        const response = generateResponse(actionText);
        streamResponse(assistantId, response);
    },

    copyMessage: (text) => navigator.clipboard.writeText(text),
}));

export default useChatbotStore;