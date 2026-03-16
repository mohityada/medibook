import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import api from '../api/axios';
import { MessageSquare, Send, ArrowLeft, User, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConversationItem {
    id: number;
    patient: {
        id: number;
        user: { id: number; firstName: string; lastName: string; email: string };
    };
    doctor: {
        id: number;
        speciality: string;
        user: { id: number; firstName: string; lastName: string; email: string };
        hospital?: { name: string };
    };
    lastMessageAt: string | null;
}

interface MessageItem {
    id: number;
    sender: { id: number; firstName: string; lastName: string };
    content: string;
    isRead: boolean;
    isSystem: boolean;
    createdAt: string;
}

const Messages = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMsg, setSendingMsg] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { subscribe } = useWebSocket();

    const isDoctor = user?.roles.includes('ROLE_DOCTOR');

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            const convList: ConversationItem[] = res.data;
            setConversations(convList);
            return convList;
        } catch {
            // silently fail
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Auto-open conversation from URL query params
    const autoSelectConversation = async (convList: ConversationItem[]) => {
        const doctorId = searchParams.get('doctorId');
        const patientEmail = searchParams.get('patientEmail');

        if (doctorId && !isDoctor) {
            // Patient: create/get conversation with this doctor
            try {
                const res = await api.post('/messages/conversations', { doctorId: Number(doctorId) });
                const conv = res.data as ConversationItem;
                // Add to list if not already there
                const existing = convList.find(c => c.id === conv.id);
                if (!existing) {
                    setConversations(prev => [conv, ...prev]);
                }
                setSelectedConv(conv);
            } catch {
                toast.error('Failed to open conversation');
            }
            // Clear query params
            setSearchParams({}, { replace: true });
        } else if (patientEmail && isDoctor) {
            // Doctor: find conversation by patient email
            const match = convList.find(c => c.patient.user.email === patientEmail);
            if (match) {
                setSelectedConv(match);
            }
            setSearchParams({}, { replace: true });
        }
    };

    const fetchMessages = async (convId: number) => {
        try {
            const res = await api.get(`/messages/conversations/${convId}`);
            setMessages(res.data);
            // Mark as read
            api.put(`/messages/conversations/${convId}/read`).catch(() => {});
        } catch {
            toast.error('Failed to load messages');
        }
    };

    useEffect(() => {
        if (user) {
            fetchConversations().then(convList => {
                autoSelectConversation(convList);
            });
        }
    }, [user]);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.id);
            // Subscribe to WebSocket for real-time messages
            const unsub = subscribe(`/topic/conversations/${selectedConv.id}`, (msg) => {
                setMessages(prev => [...prev, msg as MessageItem]);
            });
            return () => { unsub(); };
        }
    }, [selectedConv?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConv) return;
        setSendingMsg(true);
        try {
            await api.post(`/messages/conversations/${selectedConv.id}`, { content: newMessage.trim() });
            setNewMessage('');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSendingMsg(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getOtherPartyName = (conv: ConversationItem) => {
        if (isDoctor) {
            return `${conv.patient.user.firstName} ${conv.patient.user.lastName}`;
        }
        return `Dr. ${conv.doctor.user.firstName} ${conv.doctor.user.lastName}`;
    };

    const getOtherPartySubtext = (conv: ConversationItem) => {
        if (isDoctor) return 'Patient';
        return conv.doctor.speciality + (conv.doctor.hospital ? ` • ${conv.doctor.hospital.name}` : '');
    };

    if (!user) return <div className="p-10 text-center text-gray-500">Please login to access messages</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" /> Communication Center
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden" style={{ height: '70vh' }}>
                {/* Conversation List */}
                <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-semibold text-gray-700 text-sm">Conversations</h2>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No conversations yet</p>
                                <p className="text-xs text-gray-400 mt-1">Book an appointment to start messaging</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                        selectedConv?.id === conv.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                {getOtherPartyName(conv)}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{getOtherPartySubtext(conv)}</p>
                                            {conv.lastMessageAt && (
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    {new Date(conv.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConv(null)}
                                    className="md:hidden p-1 hover:bg-gray-200 rounded"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{getOtherPartyName(selectedConv)}</p>
                                    <p className="text-xs text-gray-500">{getOtherPartySubtext(selectedConv)}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                                {messages.map(msg => {
                                    const isMe = msg.sender.id === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${msg.isSystem ? 'justify-center' : isMe ? 'justify-end' : 'justify-start'}`}>
                                            {msg.isSystem ? (
                                                <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 max-w-md">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                                                        <Bot className="h-3 w-3" /> System
                                                    </div>
                                                    <p className="text-xs text-gray-600">{msg.content}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                                                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 ${
                                                    isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                                                }`}>
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="px-4 py-3 border-t border-gray-200 bg-white">
                                <div className="flex items-end gap-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message..."
                                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={1}
                                        maxLength={1000}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!newMessage.trim() || sendingMsg}
                                        className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Select a conversation</p>
                                <p className="text-gray-400 text-sm mt-1">Choose from your conversations to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
