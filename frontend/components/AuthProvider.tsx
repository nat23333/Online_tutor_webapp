'use client';

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}

// We can export a hook if needed, but usually useSession is used directly in components.
// For backwards compatibility or easier migration, we could wrap useSession here if strictly necessary,
// but standard NextAuth pattern is to use useSession in components.
