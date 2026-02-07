
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, GraduationCap, BookOpen } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [selectedRole, setSelectedRole] = useState<'student' | 'tutor' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    const handleContinue = async () => {
        if (!selectedRole) return;

        setIsSubmitting(true);
        try {
            // Persist role to backend
            await api.patch('/auth/role', { role: selectedRole });

            // Still save to localStorage for immediate UI feedback if needed
            localStorage.setItem('userRole', selectedRole);

            // Simulating a small delay for smooth transition
            await new Promise(resolve => setTimeout(resolve, 500));

            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to save role', error);
            // Fallback to local storage if API fails, but log error
            localStorage.setItem('userRole', selectedRole);
            router.push('/dashboard');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name}!</CardTitle>
                    <CardDescription className="text-lg">
                        How would you like to use this platform?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Student Card */}
                        <div
                            className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:border-primary/50 hover:bg-muted/50 ${selectedRole === 'student' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'}`}
                            onClick={() => setSelectedRole('student')}
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">I want to learn</h3>
                            <p className="text-muted-foreground">
                                Find tutors, book sessions, and master new subjects.
                            </p>
                            {selectedRole === 'student' && (
                                <div className="mt-4 flex justify-end text-primary">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            )}
                        </div>

                        {/* Tutor Card */}
                        <div
                            className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:border-primary/50 hover:bg-muted/50 ${selectedRole === 'tutor' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'}`}
                            onClick={() => setSelectedRole('tutor')}
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">I want to teach</h3>
                            <p className="text-muted-foreground">
                                Share your knowledge, earn money, and help students succeed.
                            </p>
                            {selectedRole === 'tutor' && (
                                <div className="mt-4 flex justify-end text-primary">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            size="lg"
                            disabled={!selectedRole || isSubmitting}
                            onClick={handleContinue}
                            className="w-full md:w-auto"
                        >
                            {isSubmitting ? 'Setting up...' : 'Continue to Dashboard'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
