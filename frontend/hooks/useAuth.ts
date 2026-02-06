import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export function useAuth() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'student' | 'tutor' | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Initialize state from local storage
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            const storedRole = localStorage.getItem('userRole') as 'student' | 'tutor' | null;
            setToken(storedToken);
            setUserRole(storedRole);
            setAuthLoading(false);
        }
    }, []);

    const login = async (role: 'student' | 'tutor', email?: string, password?: string) => {
        if (email && password) {
            // Backend Login
            try {
                const response = await api.post('/auth/login', { email, password });
                const { access_token } = response.data;

                localStorage.setItem('token', access_token);
                localStorage.setItem('userRole', role);

                setToken(access_token);
                setUserRole(role);

                router.push(role === 'tutor' ? '/dashboard' : '/browse');
                return true;
            } catch (error) {
                console.error("Login failed", error);
                throw error;
            }
        } else {
            // Google Login (Legacy/NextAuth)
            localStorage.setItem('userRole', role);
            signIn('google', { callbackUrl: '/onboarding' });
        }
    };

    const register = async (role: 'student' | 'tutor', data: any) => {
        try {
            await api.post('/auth/register', { ...data, role });
            // Optionally auto-login or redirect to login
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setToken(null);
        setUserRole(null);
        signOut({ callbackUrl: '/' });
    };

    return {
        session,
        isAuthenticated: status === "authenticated" || !!token,
        isLoading: status === "loading" || authLoading,
        user: session?.user || { name: 'User' }, // Fallback
        userRole,
        login,
        register,
        logout,
    };
}
