'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Send, Flag, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Message {
    id: string;
    sender: 'user' | 'tutor';
    content: string;
    timestamp: Date;
    isSystem?: boolean;
}

interface ChatInterfaceProps {
    tutorName: string;
    tutorId: string;
    studentName?: string;
    isTutor?: boolean;
    onClose?: () => void;
    onBlock?: () => void; // Callback when user is blocked
}

export function ChatInterface({ tutorName, tutorId, studentName, isTutor, onClose, onBlock }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'tutor',
            content: `Hello! I'm ${tutorName}. How can I help you with your studies today?`,
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const checkModeration = (text: string): boolean => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s-]?)?(?:\d{3}[\s-]?){2}\d{4}|\d{10}/;
        const socialKeywords = ['facebook', 'instagram', 'telegram', 'whatsapp', 'viber', 'tiktok'];

        if (emailRegex.test(text)) return true;
        if (phoneRegex.test(text)) return true;

        const lowerText = text.toLowerCase();
        if (socialKeywords.some(keyword => lowerText.includes(keyword))) return true;

        return false;
    };

    const handleSendMessage = () => {
        if (!inputValue.trim() || isBlocked) return;

        if (checkModeration(inputValue)) {
            setIsBlocked(true);
            onBlock?.();
            return;
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        // Simulate tutor reply after a delay
        setTimeout(() => {
            if (!isBlocked) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    sender: 'tutor',
                    content: "That sounds great! Would you like to schedule a session?",
                    timestamp: new Date()
                }]);
            }
        }, 1500);
    };

    const handleSendInvitation = () => {
        const systemMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            content: 'Has sent a booking invitation.',
            timestamp: new Date(),
            isSystem: true
        };
        setMessages(prev => [...prev, systemMessage]);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center bg-card">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>{tutorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{tutorName}</h3>
                        <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                </div>
                {!isBlocked && (
                    <Button size="sm" variant="secondary" onClick={handleSendInvitation}>
                        Send Invitation
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isSystem ? 'justify-center' : msg.sender === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {msg.isSystem ? (
                                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> {msg.content}
                                </div>
                            ) : (
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                        }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <span className="text-[10px] opacity-70 block text-right mt-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                    {isBlocked && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Account Restricted</AlertTitle>
                            <AlertDescription>
                                Sharing personal contact information (email, phone, social media) is strictly prohibited. Your chat access has been suspended.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                    <Input
                        placeholder={isBlocked ? "Chat disabled" : "Type a message..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isBlocked}
                    />
                    <Button onClick={handleSendMessage} disabled={isBlocked || !inputValue.trim()} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    For your safety, do not share personal contact details.
                </p>
            </div>
        </div>
    );
}
