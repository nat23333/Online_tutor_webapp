'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PaymentRecord {
  id: string;
  amount: number;
  provider: string;
  transactionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  booking: {
    student: { fullName: string };
    tutor: { fullName: string };
  };
}

export function AdminPaymentVerification() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/admin/payments');
      setPayments(data);
    } catch (error) {
      console.error('Fetch payments error:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAction = async (id: string, status: boolean) => {
    setVerifyingId(id);
    try {
      await api.patch(`/admin/payments/${id}/verify`, { status });
      toast.success(status ? 'Payment verified' : 'Payment rejected');
      setPayments(payments.filter(p => p.id !== id));
      setExpandedId(null);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Action failed');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Verification</CardTitle>
          <CardDescription>Review and verify student payment proofs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No pending payments</p>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs truncate max-w-[150px]">ID: {payment.id}</h4>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{payment.booking.student.fullName}</p>
                      <p className="text-xs text-muted-foreground">Tutor: {payment.booking.tutor.fullName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{payment.amount} ETB</p>
                      <p className="text-xs text-muted-foreground uppercase">{payment.provider}</p>
                    </div>
                  </div>

                  {expandedId === payment.id && (
                    <div className="space-y-4 border-t pt-4">
                      {payment.transactionId && payment.transactionId.startsWith('uploads/') && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Proof File</h5>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/${payment.transactionId}`}
                            target="_blank"
                            className="text-primary text-sm underline"
                          >
                            View Receipt Photograph
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAction(payment.id, true)}
                          disabled={!!verifyingId}
                          className="flex-1"
                        >
                          {verifyingId === payment.id ? 'Verifying...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleAction(payment.id, false)}
                          disabled={!!verifyingId}
                          variant="destructive"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setExpandedId(expandedId === payment.id ? null : payment.id)}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    {expandedId === payment.id ? 'Hide Details' : 'Review Payment'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
