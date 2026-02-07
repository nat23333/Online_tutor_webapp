
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Debug environment variables
if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXTAUTH_SECRET) {
        console.error("CRITICAL ERROR: NEXTAUTH_SECRET is not set in production!");
    }
}

const providers = [];

// Add Google Provider if credentials are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "select_account",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    );
} else {
    console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing. Google Login disabled.");
}

// Add Credentials Provider
providers.push(
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                });
                if (!res.ok) return null;
                const data = await res.json();
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
    })
);

export const authOptions: NextAuthOptions = {
    providers,
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                if (account.provider === 'credentials' && (user as any).accessToken) {
                    token.accessToken = (user as any).accessToken;
                    token.userId = user.id;
                }
            }

            if (!token.accessToken && token.email) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/oauth`, {
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
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // Enable debug in local to see errors
};
