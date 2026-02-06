'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, User, DollarSign, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

interface Tutor {
    id: number;
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
    responseTime: number;
}

export default function TutorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const response = await api.get(`/tutors/${params.id}`);
                setTutor(response.data);
            } catch (error) {
                console.error("Failed to fetch tutor details", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchTutor();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="container mx-auto py-12 text-center">
                <p>Loading tutor profile...</p>
            </div>
        );
    }

    if (!tutor) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-2xl font-bold">Tutor not found</h1>
                <Button onClick={() => router.push('/browse')} className="mt-4">
                    Browse Tutors
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Hero / Header Section */}
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="w-32 h-32 md:w-48 md:h-48 rounded-2xl border-4 border-background shadow-xl">
                        <AvatarImage src={tutor.photo} className="object-cover" />
                        <AvatarFallback className="text-4xl">{tutor.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-4 flex-1">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-bold">{tutor.name}</h1>
                                {tutor.isVerified && (
                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-3 py-1">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Verified Tutor
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xl text-muted-foreground mt-1">{tutor.specialization} Expert</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{tutor.rating}</span>
                                <span className="text-muted-foreground">({tutor.reviewCount} reviews)</span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{tutor.location}</span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Responds in ~{tutor.responseTime} min</span>
                            </div>
                        </div>

                        <p className="text-lg leading-relaxed max-w-3xl">{tutor.bio}</p>
                    </div>

                    <div className="w-full md:w-80 space-y-4 shrink-0">
                        <Card className="border-2 border-primary/10 shadow-lg">
                            <CardHeader className="bg-primary/5 pb-4">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted-foreground">Hourly Rate</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-primary">{tutor.hourlyRate}</span>
                                        <span className="text-sm font-semibold text-muted-foreground">ETB</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-3">
                                <Button
                                    className="w-full h-11 text-lg font-semibold shadow-lg shadow-primary/20"
                                    onClick={() => router.push(`/booking?tutorId=${tutor.id}`)}
                                >
                                    Book a Session
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message Tutor
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column (Qualifications & Experience) */}
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Qualifications & Education</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {tutor.qualifications.map((qual, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 text-sm">
                                        {qual}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{tutor.yearsExperience}+ Years of Teaching</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Has successfully taught over {tutor.reviewCount * 5}+ students (estimated)
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Reviews maybe? For now placeholder) */}
                {/* ... */}
            </div>
        </div>
    );
}
