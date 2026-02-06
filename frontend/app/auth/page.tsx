'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap, School } from 'lucide-react';
import Link from 'next/link';

function AuthPageContent() {
  const { login, register } = useAuth();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role');

  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialRole === 'tutor') {
      setRole('tutor');
    }
  }, [initialRole]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Check if it's signup (has first name)
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    try {
      if (firstName && lastName) {
        // Sign Up
        await register(role, {
          email,
          password,
          firstName,
          lastName
        });
        // Auto login after register or show success message?
        // For now assume register returns or we try login immediately
        await login(role, email, password);
      } else {
        // Sign In
        await login(role, email, password);
      }
    } catch (err) {
      console.error("Auth error", err);
      // Show error (could add error state)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary mb-6 hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">Tutora</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your account type and enter your details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div
                className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:bg-muted/50 ${role === 'student' ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => setRole('student')}
              >
                <GraduationCap className={`h-8 w-8 mx-auto mb-2 ${role === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className={`font-semibold ${role === 'student' ? 'text-primary' : 'text-foreground'}`}>Student</div>
              </div>
              <div
                className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:bg-muted/50 ${role === 'tutor' ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => setRole('tutor')}
              >
                <School className={`h-8 w-8 mx-auto mb-2 ${role === 'tutor' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className={`font-semibold ${role === 'tutor' ? 'text-primary' : 'text-foreground'}`}>Tutor</div>
              </div>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" placeholder="name@example.com" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : `Sign in as ${role === 'student' ? 'Student' : 'Tutor'}`}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" name="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" name="lastName" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" name="email" placeholder="name@example.com" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" name="password" type="password" required />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : `Create ${role === 'student' ? 'Student' : 'Tutor'} Account`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
