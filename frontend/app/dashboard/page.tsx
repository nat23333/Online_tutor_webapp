'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { StudentDashboard } from '@/components/StudentDashboard';
import { TutorDashboard } from '@/components/TutorDashboard';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Home, LogOut, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
  const { userRole, isAuthenticated, logout, user, isLoading } = useAuth();
  const router = useRouter();
  const [tutorProfile, setTutorProfile] = useState<{ firstName: string; lastName: string; photoUrl?: string; headline?: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (!userRole) {
      router.push('/onboarding');
      return;
    }

    if (userRole === 'tutor') {
      const saved = localStorage.getItem('tutorProfile');
      if (saved) {
        try {
          setTutorProfile(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing profile", e);
        }
      }
    }

    if (isAuthenticated) {
      fetchNotifications();
      fetchBookings();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchBookings();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, router, userRole, isLoading]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading || (isAuthenticated && !userRole)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  const displayName = user?.name || (userRole === 'student' ? "Kidane Tekle" : "Dr. Abebe");
  const displayImage = user?.image || undefined;

  const sessions = bookings.map(b => ({
    id: b.id,
    tutor: b.tutor?.fullName || 'Tutor',
    subject: 'Tutoring Session',
    date: b.startTime?.split('T')[0] || '',
    time: b.startTime?.split('T')[1]?.substring(0, 5) || '',
    duration: b.durationMins || 60,
    status: b.status.toLowerCase() as any,
    meetingLink: b.meetingLink,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {userRole === 'student' && (
              <Link href="/browse">
                <Button className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Find a Tutor
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    {unreadCount > 0 && <span className="text-[10px] font-normal text-muted-foreground">{unreadCount} unread</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          className={`flex flex-col items-start p-3 focus:bg-accent cursor-pointer ${!notif.isRead ? 'bg-primary/5' : ''}`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex justify-between w-full mb-1">
                            <span className={`font-semibold text-sm ${!notif.isRead ? 'text-primary' : 'text-foreground'}`}>{notif.title}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{new Date(notif.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</p>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {displayImage && <img src={displayImage} alt="Profile" className="w-8 h-8 rounded-full border border-border" />}
              <Button variant="ghost" size="icon" onClick={logout} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Viewing as {userRole === 'student' ? 'Student' : 'Tutor'}
            </h2>
          </div>

          {userRole === 'student' ? (
            <StudentDashboard
              studentName={displayName}
              sessions={sessions}
              onBookNewSession={() => {
                window.location.href = '/browse';
              }}
            />
          ) : (
            <TutorDashboard
              tutorName={tutorProfile ? `${tutorProfile.firstName} ${tutorProfile.lastName}` : displayName}
              photoUrl={tutorProfile?.photoUrl || displayImage}
              specialization={tutorProfile?.headline || "Mathematics"}
              hourlyRate={500}
              onEditProfile={() => router.push('/tutor/profile/edit')}
              onUpdateAvailability={() => console.log('Opening availability editor...')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
