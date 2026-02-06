'use client';

import { AdminPaymentVerification } from '@/components/AdminPaymentVerification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminVerificationPage() {
  const handleVerify = async (orderId: string) => {
    try {
      const response = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          approved: true,
          meetingLink: `https://meet.jitsi.org/session-${orderId}`,
          sessionTime: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log(`Payment ${orderId} approved`);
        // TODO: Refresh payment list
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleReject = async (orderId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          approved: false,
          reason,
        }),
      });

      if (response.ok) {
        console.log(`Payment ${orderId} rejected`);
        // TODO: Refresh payment list
      }
    } catch (error) {
      console.error('Rejection error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage payment verification and student sessions
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <AdminPaymentVerification
              onVerify={handleVerify}
              onReject={handleReject}
            />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Monitor ongoing tutoring sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Session monitoring and management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Earnings</CardTitle>
                <CardDescription>Revenue and transaction analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earnings analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
