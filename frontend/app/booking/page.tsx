'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookingForm } from '@/components/BookingForm';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { PaymentProofUpload } from '@/components/PaymentProofUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, BookOpen, ChevronRight, Check } from 'lucide-react';

import api from '@/lib/api';

// MOCK_TUTORS removed

type FlowStep = 'booking' | 'payment_method' | 'payment_proof' | 'confirmation';

interface Order {
  orderId: string;
  amount: number;
  tutorId: string;
  sessionId?: string;
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const initialTutorId = searchParams.get('tutorId');

  const [tutors, setTutors] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep>('booking');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await api.get('/tutors');
        setTutors(response.data);
      } catch (error) {
        console.error("Failed to fetch tutors", error);
      }
    }
    fetchTutors();
  }, []);

  const handleBookingSuccess = (order: any) => {
    console.log('Booking Successful. Received order:', order);
    // Backend returns { id, amount, ... }
    setCurrentOrder({
      orderId: order.orderId || order.id,
      amount: order.amount ?? 0,
      tutorId: order.tutorId,
      sessionId: order.id
    });
    setCurrentStep('payment_method');
  };

  const handlePaymentMethodSelected = (method: string, pId: string) => {
    setSelectedPaymentMethod(method);
    setPaymentId(pId);
    setCurrentStep('payment_proof');
  };

  const handlePaymentProofSuccess = () => {
    setCurrentStep('confirmation');
  };

  const getStepNumber = (step: FlowStep) => {
    const steps = {
      booking: 1,
      payment_method: 2,
      payment_proof: 3,
      confirmation: 4,
    };
    return steps[step];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Tutora Booking</span>
          </div>
          {currentStep !== 'booking' && currentOrder && (
            <div className="bg-accent p-3 rounded-lg">
              <p className="text-sm font-medium">Total Amount to Pay:</p>
              <p className="text-2xl font-bold text-primary">{(currentOrder.amount || 0).toFixed(2)} ETB</p>
            </div>
          )}
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 bg-transparent">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { step: 1, label: 'Select Session' },
              { step: 2, label: 'Payment Method' },
              { step: 3, label: 'Payment Proof' },
              { step: 4, label: 'Confirmation' },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${getStepNumber(currentStep) >= item.step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {getStepNumber(currentStep) > item.step ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      item.step
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center max-w-[80px] text-muted-foreground font-medium">
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${getStepNumber(currentStep) > item.step
                      ? 'bg-primary'
                      : 'bg-muted'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'booking' && (
            <BookingForm
              tutors={tutors}
              onSuccess={handleBookingSuccess}
              initialTutorId={initialTutorId || undefined}
            />
          )}

          {currentStep === 'payment_method' && currentOrder && (
            <PaymentMethodSelector
              orderId={currentOrder.orderId}
              amount={currentOrder.amount}
              onPaymentMethodSelected={handlePaymentMethodSelected}
            />
          )}

          {currentStep === 'payment_proof' && currentOrder && (
            <PaymentProofUpload
              orderId={paymentId} // Passing paymentId as orderId since component expects it
              amount={currentOrder.amount}
              paymentMethod={selectedPaymentMethod}
              onSuccess={handlePaymentProofSuccess}
            />
          )}

          {currentStep === 'confirmation' && currentOrder && (
            <Card className="border-2 border-border">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
                <CardDescription>Your session has been booked successfully</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-semibold text-foreground">{currentOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-foreground">{currentOrder.amount} ETB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold text-foreground capitalize">{selectedPaymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-accent">Awaiting Payment Verification</span>
                  </div>
                </div>

                <Card className="border border-accent/20 bg-accent/5">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Your payment proof has been submitted. Our admin team will verify it within 24 hours. You'll receive a notification via Telegram when the session is confirmed.
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Check your Telegram for updates and meeting details!
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3 pt-4">
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep('booking');
                      setCurrentOrder(null);
                      setSelectedPaymentMethod('');
                    }}
                    className="w-full gap-2 bg-transparent"
                  >
                    <BookOpen className="h-4 w-4" />
                    Book Another Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
