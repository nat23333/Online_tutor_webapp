'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, AlertCircle } from 'lucide-react';

interface TimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface TutorAvailabilityEditorProps {
  tutorName?: string;
  specialization?: string;
  hourlyRate?: number;
  qualifications?: string;
  bio?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function TutorAvailabilityEditor({
  tutorName = 'Dr. Abebe',
  specialization = 'Mathematics',
  hourlyRate = 500,
  qualifications = '',
  bio = '',
  onSave,
  onCancel,
}: TutorAvailabilityEditorProps) {
  const [formData, setFormData] = useState({
    name: tutorName,
    specialization,
    rate: hourlyRate,
    qualifications,
    bio,
  });

  const [availability, setAvailability] = useState<TimeSlot[]>(
    DAYS.map(day => ({
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00',
      enabled: day !== 'Sunday',
    }))
  );

  const [saving, setSaving] = useState(false);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (index: number, field: string, value: any) => {
    setAvailability(prev =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // TODO: Send to API
      const payload = {
        ...formData,
        availability: availability.filter(a => a.enabled),
      };
      console.log('Saving tutor data:', payload);
      onSave?.(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your tutor profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => handleFormChange('specialization', e.target.value)}
              placeholder="e.g., Mathematics, English"
            />
          </div>

          <div>
            <Label htmlFor="rate">Hourly Rate (ETB)</Label>
            <Input
              id="rate"
              type="number"
              value={formData.rate}
              onChange={(e) => handleFormChange('rate', Number(e.target.value))}
              placeholder="500"
            />
          </div>

          <div>
            <Label htmlFor="qualifications">Qualifications</Label>
            <Textarea
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => handleFormChange('qualifications', e.target.value)}
              placeholder="B.Sc in Mathematics, 5+ years experience..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleFormChange('bio', e.target.value)}
              placeholder="Tell students about your teaching style and approach..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Availability
          </CardTitle>
          <CardDescription>Set your available teaching hours for each day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Students will only be able to book sessions during your available hours
            </p>
          </div>

          <div className="space-y-3">
            {availability.map((slot, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 space-y-3 ${
                  !slot.enabled ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`day-${index}`}
                    checked={slot.enabled}
                    onCheckedChange={(checked) =>
                      handleAvailabilityChange(index, 'enabled', checked)
                    }
                  />
                  <Label
                    htmlFor={`day-${index}`}
                    className="font-semibold flex-1 cursor-pointer"
                  >
                    {slot.dayOfWeek}
                  </Label>
                </div>

                {slot.enabled && (
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div>
                      <Label htmlFor={`start-${index}`} className="text-xs">
                        Start Time
                      </Label>
                      <Input
                        id={`start-${index}`}
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleAvailabilityChange(index, 'startTime', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`end-${index}`} className="text-xs">
                        End Time
                      </Label>
                      <Input
                        id={`end-${index}`}
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleAvailabilityChange(index, 'endTime', e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
