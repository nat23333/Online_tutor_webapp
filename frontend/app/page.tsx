'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Zap, Award, TrendingUp, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Tutora</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="outline" className="bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="gap-2">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-semibold text-primary">Welcome to Ethiopia's Premier Tutoring Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Learn From Ethiopia's Best Tutors
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with expert tutors, book sessions at your pace, and pay securely with Ethiopian payment methods. Education made accessible to everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Users className="h-4 w-4" />
                Join as Student
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-transparent">
                <Award className="h-4 w-4" />
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border h-96 flex items-center justify-center">
          <div className="text-center">
            <Globe className="h-16 w-16 text-primary/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Learning Experience Preview</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Tutora?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Easy Booking</h3>
            <p className="text-muted-foreground">
              Browse tutors by subject, schedule sessions at your convenience, and start learning in minutes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Secure Payments</h3>
            <p className="text-muted-foreground">
              Pay securely with Telebirr, CBE Mobile Banking, or other Ethiopian payment methods. Verified by our admin team.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Expert Tutors</h3>
            <p className="text-muted-foreground">
              Learn from verified, experienced tutors. Read reviews, check ratings, and find the perfect match for your needs.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Video Sessions</h3>
            <p className="text-muted-foreground">
              Crystal-clear video conferencing with screen sharing. Learn face-to-face from anywhere in Ethiopia.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your learning journey with session history, tutor ratings, and performance insights on your dashboard.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Flexible Schedule</h3>
            <p className="text-muted-foreground">
              Book sessions whenever it works for you. Tutors set their own availability, and you choose what fits best.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Expert Tutors</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">10K+</div>
              <p className="text-muted-foreground">Active Students</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">50K+</div>
              <p className="text-muted-foreground">Sessions Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 rounded-xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Start Learning?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students achieving their learning goals with Tutora. Sign up today and get matched with your perfect tutor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Zap className="h-4 w-4" />
                Get Started Now
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Tutora</h4>
              <p className="text-sm text-muted-foreground">Ethiopia's premier online tutoring platform.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">For Students</Link></li>
                <li><Link href="#" className="hover:text-primary">For Tutors</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">About</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Tutora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
