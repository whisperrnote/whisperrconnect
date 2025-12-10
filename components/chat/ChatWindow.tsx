'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChatService } from '@/lib/services/chat';
import { useAuth } from '@/lib/auth';
import { Messages } from '@/types/appwrite';
import { useRouter } from 'next/navigation';

export const ChatWindow = ({ conversationId }: { conversationId: string }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Messages[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (conversationId) {
            loadMessages();
            // Poll for new messages every 5 seconds for MVP
            const interval = setInterval(loadMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            const response = await ChatService.getMessages(conversationId);
            // Appwrite returns newest first, so reverse for display
            setMessages(response.rows.reverse() as unknown as Messages[]);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        const text = inputText;
        setInputText(''); // Optimistic clear

        try {
            await ChatService.sendMessage(conversationId, user.$id, text);
            loadMessages(); // Refresh immediately
        } catch (error) {
            console.error('Failed to send message:', error);
            setInputText(text); // Restore on error
        }
    };

    const handleCall = () => {
        // Navigate to call page with this conversation ID
        router.push(`/call/${conversationId}?caller=true`);
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading conversation...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ 
                padding: '15px 20px', 
                borderBottom: '1px solid #eee', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#fff'
            }}>
                <div style={{ fontWeight: 'bold' }}>Chat</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={handleCall}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            backgroundColor: '#0070f3',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <span>📞</span> Call
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.$id;
                    
                    if (msg.type === 'call_signal') {
                        // Only show "Join Call" for the initial offer or if it's a generic signal
                        // Actually, showing every signal is spammy.
                        // We should probably hide them or collapse them.
                        // For MVP, let's just show a "Call started" message if it's an offer.
                        try {
                            const signal = JSON.parse(msg.content || '{}');
                            if (signal.type === 'offer') {
                                return (
                                    <div key={msg.$id} style={{ alignSelf: 'center', margin: '10px 0' }}>
                                        <button
                                            onClick={() => router.push(`/call/${conversationId}`)}
                                            style={{
                                                padding: '10px 20px',
                                                borderRadius: '20px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            📞 Join Call
                                        </button>
                                    </div>
                                );
                            }
                            return null; // Hide other signals
                        } catch (e) { return null; }
                    }

                    return (
                        <div 
                            key={msg.$id} 
                            style={{ 
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                padding: '10px 15px',
                                borderRadius: '15px',
                                backgroundColor: isMe ? '#0070f3' : '#f0f0f0',
                                color: isMe ? 'white' : 'black',
                                borderBottomRightRadius: isMe ? '5px' : '15px',
                                borderBottomLeftRadius: isMe ? '15px' : '5px'
                            }}
                        >
                            {msg.content}
                            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '5px', textAlign: 'right' }}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                />
                <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        backgroundColor: inputText.trim() ? '#0070f3' : '#ccc',
                        color: 'white',
                        border: 'none',
                        cursor: inputText.trim() ? 'pointer' : 'default'
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};
