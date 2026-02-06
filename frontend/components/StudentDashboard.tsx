'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Star, Video, MessageSquare, BookOpen, Zap } from 'lucide-react';

interface Session {
  id: number | string;
  tutor: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingLink?: string;
  rating?: number;
}

interface StudentDashboardProps {
  studentName?: string;
  onBookNewSession?: () => void;
  sessions?: Session[];
}

const MOCK_SESSIONS: Session[] = [
  {
    id: 1,
    tutor: 'Dr. Abebe',
    subject: 'Mathematics',
    date: '2026-02-15',
    time: '14:00',
    duration: 60,
    status: 'upcoming',
    meetingLink: 'https://meet.jitsi.org/tutor-session-001',
  },
  {
    id: 2,
    tutor: 'Marta',
    subject: 'English Literature',
    date: '2026-02-10',
    time: '10:00',
    duration: 60,
    status: 'completed',
    rating: 5,
  },
  {
    id: 3,
    tutor: 'Yonas',
    subject: 'Physics',
    date: '2026-02-08',
    time: '16:00',
    duration: 90,
    status: 'completed',
    rating: 4,
  },
];

export function StudentDashboard({
  studentName = 'Kidane Tekle',
  onBookNewSession,
  sessions = MOCK_SESSIONS,
}: StudentDashboardProps) {
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming' || s.status === 'confirmed');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  const [searchQuery, setSearchQuery] = useState('');

  // Default handler if not provided
  const handleBookSession = () => {
    if (onBookNewSession) {
      onBookNewSession();
    } else {
      window.location.href = '/browse';
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/browse?query=${encodeURIComponent(searchQuery)}`;
    } else {
      handleBookSession();
    }
  };

  const avgRating =
    pastSessions.filter(s => s.rating).length > 0
      ? (
        pastSessions
          .filter(s => s.rating)
          .reduce((sum, s) => sum + (s.rating || 0), 0) / pastSessions.filter(s => s.rating).length
      ).toFixed(1)
      : '—';

  const totalHours = Math.round(pastSessions.reduce((sum, s) => sum + s.duration, 0) / 60);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Welcome back, {studentName}</h1>
          <p className="text-muted-foreground mt-2">Keep progressing with your tutoring goals</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
              placeholder="Search for a tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="gap-2">
            <Zap className="h-4 w-4" />
            Find Tutor
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{upcomingSessions.length}</div>
              <span className="text-xs text-muted-foreground">scheduled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hours Learned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{totalHours}h</div>
              <span className="text-xs text-muted-foreground">total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{avgRating}</div>
              <Star className="h-5 w-5 fill-accent text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card className="border-2 border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your next scheduled tutoring sessions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No upcoming sessions yet</p>
              <p className="text-sm text-muted-foreground mt-1">Schedule your first session to get started</p>
              <Button onClick={onBookNewSession} variant="outline" className="mt-4 bg-transparent">
                Find a Tutor
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="group border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {session.subject}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{session.tutor}</span>
                      </div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Session {index + 1}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-4 py-3 border-t border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span className="text-foreground font-medium">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-foreground font-medium">{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-foreground font-medium">{session.duration} mins</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {session.meetingLink && (
                      <Link href={`/session/${session.id}`} className="flex-1">
                        <Button className="w-full gap-2">
                          <Video className="h-4 w-4" />
                          Join Now
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <Card className="border-2 border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-secondary" />
              <div>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Your completed tutoring sessions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {pastSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{session.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.tutor} •{' '}
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {session.rating && (
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-sm font-medium text-foreground">{session.rating}</span>
                      <Star className="h-4 w-4 fill-accent text-accent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
