'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

const JitsiMeetingRoom = dynamic(
    () => import('@/components/JitsiMeetingRoom').then((mod) => mod.JitsiMeetingRoom),
    { ssr: false }
);
import { Loader2, AlertCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Booking {
    id: string;
    studentId: string;
    tutorId: string;
    startTime: string;
    durationMins: number;
    status: string;
    meetingLink?: string;
    tutor: { fullName: string };
    student: { fullName: string };
}

export default function SessionPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSessionStarted, setIsSessionStarted] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchBooking = async () => {
            try {
                const response = await api.get(`/bookings/${sessionId}`);
                setBooking(response.data);
            } catch (err: any) {
                console.error('Error fetching booking:', err);
                setError(err.response?.data?.message || 'Failed to load session details');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            fetchBooking();
        }
    }, [sessionId, isAuthenticated, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p>Connecting to session...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white p-6">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">Unable to join session</h2>
                <p className="text-neutral-400 mb-6">{error || 'Session not found'}</p>
                <Link href="/dashboard">
                    <Button variant="secondary">Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    // Extract room name from meeting link
    const roomName = booking.meetingLink
        ? booking.meetingLink.split('/').pop()
        : `booking-${booking.id}`; // Fallback

    if (!roomName) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white p-6">
                <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Meeting Not Ready</h2>
                <p className="text-neutral-400 mb-6">The meeting link hasn't been generated yet.</p>
                <Link href="/dashboard">
                    <Button variant="secondary">Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const handleStartSession = () => {
        setIsSessionStarted(true);
    };

    if (!isSessionStarted) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white p-6">
                <div className="max-w-md w-full bg-neutral-800 rounded-xl p-8 border border-neutral-700 shadow-2xl text-center">
                    <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Video className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
                    <p className="text-neutral-400 mb-6">
                        You are about to join the session with
                        <span className="text-white font-semibold block mt-1">
                            {(user as any).role === 'STUDENT' ? booking.tutor.fullName : booking.student.fullName}
                        </span>
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                        <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-700">
                            <span className="text-neutral-500 block mb-1">Duration</span>
                            <span className="font-semibold">{booking.durationMins} mins</span>
                        </div>
                        <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-700">
                            <span className="text-neutral-500 block mb-1">Status</span>
                            <span className="font-semibold text-green-500">Confirmed</span>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full font-semibold text-lg h-12"
                        onClick={handleStartSession}
                    >
                        Start Session
                    </Button>
                    <p className="text-xs text-neutral-500 mt-4">
                        Your camera and microphone will be requested properly.
                    </p>
                </div>
                <Link href="/dashboard" className="mt-8 text-neutral-500 hover:text-white transition-colors">
                    Cancel and return to dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen bg-neutral-900 overflow-hidden flex flex-col">
            <header className="flex-none px-6 py-3 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
                <div>
                    <h1 className="text-white font-semibold">Session: {new Date(booking.startTime).toLocaleDateString()}</h1>
                    <p className="text-xs text-neutral-400">
                        {(user as any).role === 'STUDENT' ? `Tutor: ${booking.tutor.fullName}` : `Student: ${booking.student.fullName}`}
                    </p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="bg-transparent text-white border-neutral-700 hover:bg-neutral-800">
                        Exit
                    </Button>
                </Link>
            </header>

            <div className="flex-1 relative">
                <JitsiMeetingRoom
                    roomName={roomName}
                    userName={user.name || booking.student.fullName || 'User'}
                    userEmail={user.email || ''}
                    meetingLink={booking.meetingLink}
                    onLeave={() => router.push('/dashboard')}
                />
            </div>
        </div>
    );
}
