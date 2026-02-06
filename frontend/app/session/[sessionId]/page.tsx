'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Clock, Users, Share, Settings } from 'lucide-react';
import { ChatInterface } from '@/components/ChatInterface'; // Reusing chat interface
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function SessionPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const router = useRouter();

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Simulate timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        // In a real app, this would end the session API call
        if (confirm('Are you sure you want to end this session?')) {
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-neutral-900 text-white overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xl tracking-tight">Tutora</span>
                            <Badge variant="outline" className="text-neutral-400 border-neutral-700">Live</Badge>
                        </div>
                    </Link>
                    <div className="h-6 w-px bg-neutral-700 mx-2" />
                    <div>
                        <h1 className="text-sm font-semibold">Mathematics - Calculus 101</h1>
                        <p className="text-xs text-neutral-400">with Dr. Abebe</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-full">
                        <Clock className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 relative bg-black p-4 flex items-center justify-center">
                    {/* Main Video Stream (Remote) */}
                    <div className="w-full h-full bg-neutral-800 rounded-lg overflow-hidden relative group">
                        {videoOn ? (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                <Users className="h-32 w-32 text-neutral-600" />
                                <p className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded text-sm">
                                    Dr. Abebe
                                </p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-4xl font-bold">DA</span>
                                </div>
                            </div>
                        )}

                        {/* Local Video (PiP) */}
                        <div className="absolute bottom-4 right-4 w-48 h-36 bg-neutral-900 rounded-lg border border-neutral-700 shadow-xl overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                <span className="text-sm text-neutral-500">You</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls Bar (Floating) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-neutral-900/90 backdrop-blur border border-neutral-800 px-6 py-4 rounded-2xl shadow-2xl z-20">
                        <Button
                            variant={micOn ? "secondary" : "destructive"}
                            size="icon"
                            className="h-12 w-12 rounded-full"
                            onClick={() => setMicOn(!micOn)}
                        >
                            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant={videoOn ? "secondary" : "destructive"}
                            size="icon"
                            className="h-12 w-12 rounded-full"
                            onClick={() => setVideoOn(!videoOn)}
                        >
                            {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </Button>
                        <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                            <Share className="h-5 w-5" />
                        </Button>

                        <div className="mx-2 h-8 w-px bg-neutral-700" />

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full relative">
                                    <MessageSquare className="h-5 w-5" />
                                    <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-neutral-900" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[400px] p-0 border-l border-neutral-800 bg-background sm:max-w-md">
                                <div className="h-full flex flex-col">
                                    <div className="p-4 border-b border-neutral-800">
                                        <h3 className="font-semibold">Session Chat</h3>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <ChatInterface
                                            tutorName="Dr. Abebe"
                                            studentName="You"
                                            tutorId={1}
                                            isTutor={false} // Would be dynamic based on auth
                                        />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className="mx-2 h-8 w-px bg-neutral-700" />

                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-12 w-12 rounded-full px-8 w-auto gap-2"
                            onClick={handleEndCall}
                        >
                            <PhoneOff className="h-5 w-5" />
                            <span className="font-semibold">End</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
