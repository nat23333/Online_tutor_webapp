'use client';

import { Suspense } from 'react';
import { TutorProfileEditor } from '@/components/TutorProfileEditor';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditProfilePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Simple Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 mb-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <span className="font-semibold">Back to Dashboard</span>
                </div>
            </header>

            <main className="px-4">
                <Suspense fallback={<div>Loading profile editor...</div>}>
                    <TutorProfileEditor />
                </Suspense>
            </main>
        </div>
    );
}
