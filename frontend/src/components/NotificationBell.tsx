import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Clock, XCircle, MessageSquare, Star, CalendarCheck } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    appointmentId?: number;
    isRead: boolean;
    createdAt: string;
}

const ICON_MAP: Record<string, typeof Bell> = {
    REMINDER_24H: Clock,
    REMINDER_48H: Clock,
    CANCELLATION: XCircle,
    RESCHEDULE: CalendarCheck,
    CONFIRMATION: Check,
    APPOINTMENT_COMPLETED: CalendarCheck,
    NEW_MESSAGE: MessageSquare,
    NEW_REVIEW: Star,
};

const NotificationBell = () => {
    const { user } = useAuth();
    const { subscribe } = useWebSocket();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count'),
            ]);
            setNotifications(notifRes.data);
            setUnreadCount(countRes.data.count);
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Subscribe to real-time notifications via WebSocket
    useEffect(() => {
        if (!user) return;
        const unsub = subscribe(`/topic/notifications/${user.id}`, (data) => {
            const notif = data as Notification;
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });
        return () => unsub();
    }, [user, subscribe]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* ignore */ }
    };

    const getNavigationTarget = (notif: Notification): string => {
        switch (notif.type) {
            case 'NEW_MESSAGE':
                return '/messages';
            case 'NEW_REVIEW':
                return '/dashboard?status=COMPLETED';
            case 'CONFIRMATION':
                return '/dashboard?status=CONFIRMED';
            case 'CANCELLATION':
                return '/dashboard?status=CANCELLED';
            case 'APPOINTMENT_COMPLETED':
                return '/dashboard?status=COMPLETED';
            case 'RESCHEDULE':
            case 'REMINDER_24H':
            case 'REMINDER_48H':
            default:
                return '/dashboard';
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }
        setOpen(false);
        navigate(getNavigationTarget(notif));
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { /* ignore */ }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center min-w-[18px] px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] flex flex-col">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map(notif => {
                                const Icon = ICON_MAP[notif.type] || Bell;
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                                            !notif.isRead ? 'bg-blue-50/50' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`shrink-0 p-1.5 rounded-full ${
                                                notif.type === 'CANCELLATION' ? 'bg-red-100 text-red-600' :
                                                notif.type.startsWith('REMINDER') ? 'bg-yellow-100 text-yellow-600' :
                                                notif.type === 'NEW_MESSAGE' ? 'bg-purple-100 text-purple-600' :
                                                notif.type === 'NEW_REVIEW' ? 'bg-amber-100 text-amber-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5 ml-2" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
