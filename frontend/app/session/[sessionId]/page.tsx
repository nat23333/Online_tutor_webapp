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
import { Loader2, AlertCircle } from 'lucide-react';
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
    // Format: https://meet.jit.si/booking-123-abc
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

    return (
        <div className="h-screen bg-neutral-900 overflow-hidden flex flex-col">
            <header className="flex-none px-6 py-3 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
                <div>
                    <h1 className="text-white font-semibold">Session: {new Date(booking.startTime).toLocaleDateString()}</h1>
                    <p className="text-xs text-neutral-400">
                        {user.role === 'STUDENT' ? `Tutor: ${booking.tutor.fullName}` : `Student: ${booking.student.fullName}`}
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
                    userEmail={user.email}
                    meetingLink={booking.meetingLink}
                    onLeave={() => router.push('/dashboard')}
                />
            </div>
        </div>
    );
}
