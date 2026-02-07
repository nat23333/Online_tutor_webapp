'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, MapPin, User, DollarSign, MessageSquare } from 'lucide-react';
import { ChatInterface } from '@/components/ChatInterface';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import api from '@/lib/api';

interface Tutor {
  id: string;
  name: string;
  photo: string;
  specialization: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  location: string;
  bio: string;
  qualifications: string[];
  isVerified: boolean;
  responseTime: number; // in minutes
}

interface BrowseTutorsProps {
  onSelectTutor?: (tutorId: string) => void;
  tutors?: Tutor[];
  photoUrl?: string;
  initialQuery?: string;
}

export function BrowseTutors({
  onSelectTutor,
  tutors: initialTutors,
  photoUrl,
  initialQuery = ''
}: BrowseTutorsProps) {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [minRating, setMinRating] = useState(0);

  // Fetch tutors from API
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tutors', {
          params: { query: searchQuery }
        });
        setTutors(response.data);
      } catch (error) {
        console.error("Failed to fetch tutors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [searchQuery]);

  const filteredTutors = tutors.filter(tutor => {
    const matchesFilter = !selectedFilter || tutor.specialization === selectedFilter;
    const matchesRating = tutor.rating >= minRating;
    return matchesFilter && matchesRating;
  });

  const subjects = Array.from(new Set(tutors.map(t => t.specialization)));
  const [selectedTutorForChat, setSelectedTutorForChat] = useState<Tutor | null>(null);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Find Your Tutor</h1>
          <p className="text-muted-foreground mt-1">Browse verified tutors and book sessions</p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Search by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setSelectedFilter('')}
              variant={selectedFilter === '' ? 'default' : 'outline'}
              size="sm"
            >
              All Subjects
            </Button>
            {subjects.map(subject => (
              <Button
                key={subject}
                onClick={() => setSelectedFilter(subject)}
                variant={selectedFilter === subject ? 'default' : 'outline'}
                size="sm"
              >
                {subject}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Minimum Rating:</span>
            <div className="flex gap-2">
              {[0, 3.5, 4.0, 4.5].map(rating => (
                <Button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  variant={minRating === rating ? 'default' : 'outline'}
                  size="sm"
                >
                  {rating === 0 ? 'All' : `${rating}+`}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {filteredTutors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tutors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTutors.map(tutor => (
              <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-16 w-16 border-2 border-border">
                          <AvatarImage src={tutor.photo} className="object-cover" />
                        </Avatar>
                        <CardTitle className="text-lg">{tutor.name}</CardTitle>
                        {tutor.isVerified && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{tutor.specialization}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{tutor.hourlyRate} ETB</p>
                      <p className="text-xs text-muted-foreground">/hour</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(tutor.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{tutor.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({tutor.reviewCount} reviews)
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{tutor.yearsExperience}+ years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{tutor.location}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Responds in ~{tutor.responseTime} min</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Qualifications
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tutor.qualifications.slice(0, 2).map((qual, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                      {tutor.qualifications.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tutor.qualifications.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => onSelectTutor?.(tutor.id)}
                      className="flex-1"
                    >
                      Book Session
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 bg-transparent"
                      onClick={() => setSelectedTutorForChat(tutor)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!selectedTutorForChat} onOpenChange={(open) => !open && setSelectedTutorForChat(null)}>
        <SheetContent className="sm:max-w-md w-full p-0 gap-0">
          <SheetHeader className="px-4 py-2 border-b hidden">
            <SheetTitle>Chat</SheetTitle>
          </SheetHeader>
          {selectedTutorForChat && (
            <ChatInterface
              tutorName={selectedTutorForChat.name}
              tutorId={selectedTutorForChat.id}
              onClose={() => setSelectedTutorForChat(null)}
              onBlock={() => { }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
