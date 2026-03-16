import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';

type MessageHandler = (body: unknown) => void;

interface WebSocketContextType {
    connected: boolean;
    subscribe: (destination: string, handler: MessageHandler) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const clientRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const subscribersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());

    useEffect(() => {
        if (!user) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        const loc = window.location;
        const wsProtocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${loc.host}/ws`;

        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                setConnected(true);
                // Re-subscribe existing subscribers after reconnect
                subscribersRef.current.forEach((_handlers, destination) => {
                    client.subscribe(destination, (message) => {
                        const body = JSON.parse(message.body);
                        const handlers = subscribersRef.current.get(destination);
                        handlers?.forEach((h) => h(body));
                    });
                });
            },
            onDisconnect: () => {
                setConnected(false);
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message']);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
            setConnected(false);
        };
    }, [user]);

    const subscribe = useCallback((destination: string, handler: MessageHandler): (() => void) => {
        // Track the handler
        if (!subscribersRef.current.has(destination)) {
            subscribersRef.current.set(destination, new Set());
        }
        subscribersRef.current.get(destination)!.add(handler);

        // If already connected, subscribe immediately
        let stompSub: { unsubscribe: () => void } | null = null;
        if (clientRef.current?.connected) {
            stompSub = clientRef.current.subscribe(destination, (message) => {
                const body = JSON.parse(message.body);
                const handlers = subscribersRef.current.get(destination);
                handlers?.forEach((h) => h(body));
            });
        }

        // Return cleanup function
        return () => {
            const handlers = subscribersRef.current.get(destination);
            if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    subscribersRef.current.delete(destination);
                }
            }
            stompSub?.unsubscribe();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ connected, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
