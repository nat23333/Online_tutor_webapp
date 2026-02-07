'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BrowseTutors } from '@/components/BrowseTutors';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { Suspense } from 'react';

function BrowsePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || '';

    const handleSelectTutor = (tutorId: string) => {
        router.push(`/booking?tutorId=${tutorId}`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">Tutora</span>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline" className="gap-2 bg-transparent">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BrowseTutors onSelectTutor={handleSelectTutor} initialQuery={initialQuery} />
            </main>
        </div>
    );
}

export default function BrowsePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BrowsePageContent />
        </Suspense>
    );
}
