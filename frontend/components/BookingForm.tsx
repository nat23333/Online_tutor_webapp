'use client';

import React from "react"
import api from '@/lib/api';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, DollarSign } from 'lucide-react';

interface BookingFormProps {
  tutors?: Array<{ id: string; name: string; hourlyRate: number; specialization: string }>;
  onSuccess?: (order: any) => void;
  initialTutorId?: string;
}

export function BookingForm({ tutors = [], onSuccess, initialTutorId }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(initialTutorId || '');
  const [sessionDate, setSessionDate] = useState('');
  const [duration, setDuration] = useState('60');
  const [subject, setSubject] = useState('');

  const selectedTutorData = tutors.find(t => t.id === selectedTutor);
  const amount = selectedTutorData ? (selectedTutorData.hourlyRate * parseInt(duration)) / 60 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/bookings', {
        tutorId: selectedTutor,
        startTime: new Date(sessionDate).toISOString(),
        durationMins: parseInt(duration),
      });

      const order = response.data;
      onSuccess?.(order); // Order should contain payment info or ID


    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Book a Tutoring Session</CardTitle>
        <CardDescription>Select your tutor and preferred time</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tutor">Select Tutor</Label>
            <Select value={selectedTutor} onValueChange={setSelectedTutor}>
              <SelectTrigger id="tutor">
                <SelectValue placeholder="Choose a tutor" />
              </SelectTrigger>
              <SelectContent>
                {tutors.map((tutor) => (
                  <SelectItem key={tutor.id} value={tutor.id.toString()}>
                    {tutor.name} - {tutor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Session Date</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics, English"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {selectedTutorData && (
            <div className="bg-accent p-3 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Amount:</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold">{amount.toFixed(2)} ETB</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedTutorData.rate} ETB/hour
              </p>
            </div>
          )}

          <Button type="submit" disabled={!selectedTutor || !sessionDate || !subject || loading} className="w-full">
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
