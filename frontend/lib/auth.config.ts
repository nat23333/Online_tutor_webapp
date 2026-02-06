
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Email & Password",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "you@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });
                    if (!res.ok) return null;
                    const data = await res.json();
                    // Return user object with token
                    return {
                        id: data.userId || data.id || credentials.email,
                        email: credentials.email,
                        accessToken: data.accessToken || data.access_token,
                    };
                } catch (error) {
                    console.error("Login error:", error);
                    return null;
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // 1. Initial sign in logic (works for credentials and fresh OAuth)
            if (account && user) {
                if (account.provider === 'credentials' && (user as any).accessToken) {
                    token.accessToken = (user as any).accessToken;
                    token.userId = user.id;
                }
            }

            // 2. Auto-repair / Refresh logic: 
            // If we have an email but NO accessToken (e.g. session existed before integration),
            // fetch it from the backend now.
            if (!token.accessToken && token.email) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/oauth`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: token.email,
                            name: token.name || '',
                            provider: 'google',
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        token.accessToken = data.accessToken || data.access_token;
                        token.userId = data.userId || token.sub;
                    }
                } catch (error) {
                    console.error('JWT auto-repair error:', error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && token.accessToken) {
                (session as any).accessToken = token.accessToken;
                (session as any).userId = token.userId;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};
