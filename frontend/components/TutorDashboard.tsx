'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Star, TrendingUp, Users, MessageSquare, Settings } from 'lucide-react';

interface TutorSession {
  id: number;
  student: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingLink?: string;
  studentRating?: number;
  amount: number;
}

interface TutorStats {
  completedSessions: number;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
}

interface TutorDashboardProps {
  tutorName?: string;
  photoUrl?: string;
  specialization?: string;
  hourlyRate?: number;
  stats?: TutorStats;
  sessions?: TutorSession[];
  onEditProfile?: () => void;
  onUpdateAvailability?: () => void;
}

const MOCK_SESSIONS: TutorSession[] = [
  {
    id: 1,
    student: 'Kidane Tekle',
    subject: 'Mathematics - Calculus',
    date: '2026-02-15',
    time: '14:00',
    duration: 60,
    status: 'upcoming',
    meetingLink: 'https://meet.jitsi.org/tutor-session-001',
    amount: 500,
  },
  {
    id: 2,
    student: 'Almaz Belay',
    subject: 'Mathematics - Algebra',
    date: '2026-02-14',
    time: '10:00',
    duration: 90,
    status: 'completed',
    studentRating: 5,
    amount: 750,
  },
  {
    id: 3,
    student: 'Yohannes Tadesse',
    subject: 'Mathematics - Geometry',
    date: '2026-02-12',
    time: '16:00',
    duration: 60,
    status: 'completed',
    studentRating: 4,
    amount: 500,
  },
];

const MOCK_STATS: TutorStats = {
  completedSessions: 24,
  totalEarnings: 12000,
  averageRating: 4.8,
  responseRate: 98,
};

export function TutorDashboard({
  tutorName = 'Dr. Abebe',
  photoUrl,
  specialization = 'Mathematics',
  hourlyRate = 500,
  stats = MOCK_STATS,
  sessions = MOCK_SESSIONS,
  onEditProfile,
  onUpdateAvailability,
}: TutorDashboardProps) {
  const [upcomingSessions] = useState(sessions.filter(s => s.status === 'upcoming'));
  const [pastSessions] = useState(sessions.filter(s => s.status !== 'upcoming'));

  const monthlyEarnings = Math.floor(stats.totalEarnings * 0.4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={photoUrl} className="object-cover" />
            <AvatarFallback className="text-lg font-bold">
              {tutorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold text-foreground">{tutorName}</h1>
            <p className="text-muted-foreground mt-2">{specialization} • {hourlyRate} ETB/hour</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/tutor/profile/edit">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
          <Button onClick={onUpdateAvailability} className="gap-2">
            <Calendar className="h-4 w-4" />
            Set Availability
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.completedSessions}</div>
              <span className="text-xs text-muted-foreground">total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.totalEarnings.toLocaleString()}</div>
              <span className="text-xs text-muted-foreground">ETB</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">~{monthlyEarnings.toLocaleString()} ETB/month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.averageRating}</div>
              <Star className="h-5 w-5 fill-accent text-accent" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.responseRate}%</div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Student inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Card */}
      <Card className="border-2 border-border bg-gradient-to-br from-secondary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Specialization
              </p>
              <p className="text-lg font-bold text-foreground mt-2">{specialization}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hourly Rate
              </p>
              <p className="text-lg font-bold text-foreground mt-2">{hourlyRate} ETB</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Students Taught
              </p>
              <p className="text-lg font-bold text-foreground mt-2">12</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Experience
              </p>
              <p className="text-lg font-bold text-foreground mt-2">5+ years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card className="border-2 border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Sessions scheduled for you to teach</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No upcoming sessions</p>
              <p className="text-sm text-muted-foreground mt-1">Your schedule is open—promote your profile to get bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="group border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {session.subject}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{session.student}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent">{session.amount} ETB</p>
                      <Badge className="bg-primary text-primary-foreground text-xs mt-1">
                        Session {index + 1}
                      </Badge>
                    </div>
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
                          <Calendar className="h-4 w-4" />
                          Start Session
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

      {/* Session History */}
      {pastSessions.length > 0 && (
        <Card className="border-2 border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <div>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Your completed sessions and earnings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {pastSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{session.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.student} •{' '}
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-2">
                    <span className="text-sm font-bold text-accent">{session.amount} ETB</span>
                    {session.studentRating && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-foreground">{session.studentRating}</span>
                        <Star className="h-4 w-4 fill-accent text-accent" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
