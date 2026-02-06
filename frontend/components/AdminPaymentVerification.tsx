'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface PaymentRecord {
  id: number;
  orderId: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  proofUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  tutor: string;
}

// Mock data
const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 1,
    orderId: 'ORD-2026-001',
    studentName: 'Kidane Tekle',
    amount: 500,
    paymentMethod: 'Telebirr',
    proofUrl: '/proof1.png',
    status: 'pending',
    uploadedAt: '2026-02-04T10:30:00Z',
    tutor: 'Dr. Abebe - Mathematics',
  },
  {
    id: 2,
    orderId: 'ORD-2026-002',
    studentName: 'Almaz Belay',
    amount: 450,
    paymentMethod: 'CBE Mobile',
    proofUrl: '/proof2.pdf',
    status: 'pending',
    uploadedAt: '2026-02-04T09:15:00Z',
    tutor: 'Marta - English',
  },
  {
    id: 3,
    orderId: 'ORD-2026-003',
    studentName: 'Yohannes Tadesse',
    amount: 600,
    paymentMethod: 'Telebirr',
    proofUrl: '/proof3.png',
    status: 'verified',
    uploadedAt: '2026-02-03T14:20:00Z',
    tutor: 'Yonas - Physics',
  },
];

interface AdminPaymentVerificationProps {
  onVerify?: (orderId: string) => void;
  onReject?: (orderId: string, reason: string) => void;
}

export function AdminPaymentVerification({
  onVerify,
  onReject,
}: AdminPaymentVerificationProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const handleVerify = async (id: number) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    try {
      // TODO: Call API to verify payment
      setPayments(
        payments.map(p =>
          p.id === id ? { ...p, status: 'verified' as const } : p
        )
      );
      onVerify?.(payment.orderId);
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleReject = async (id: number) => {
    const payment = payments.find(p => p.id === id);
    if (!payment || !rejectionReason) return;

    try {
      // TODO: Call API to reject payment
      setPayments(
        payments.map(p =>
          p.id === id ? { ...p, status: 'rejected' as const } : p
        )
      );
      onReject?.(payment.orderId, rejectionReason);
      setRejectingId(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Rejection error:', error);
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const verifiedPayments = payments.filter(p => p.status === 'verified');

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedPayments.length}</div>
            <p className="text-xs text-muted-foreground">Confirmed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifiedPayments.reduce((sum, p) => sum + p.amount, 0)} ETB
            </div>
            <p className="text-xs text-muted-foreground">From verified payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Records */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Verification</CardTitle>
          <CardDescription>Review and verify student payment proofs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                {/* Main Info */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{payment.orderId}</h4>
                      <Badge
                        variant={
                          payment.status === 'pending'
                            ? 'secondary'
                            : payment.status === 'verified'
                              ? 'default'
                              : 'destructive'
                        }
                      >
                        {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {payment.status === 'verified' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {payment.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{payment.studentName}</p>
                    <p className="text-sm text-muted-foreground">{payment.tutor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{payment.amount} ETB</p>
                    <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
                  </div>
                </div>

                {/* Expanded View */}
                {expandedId === payment.id && (
                  <div className="space-y-4 border-t pt-4">
                    {/* Proof Preview */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Payment Proof</h5>
                      <div className="bg-muted rounded-lg p-4 text-center text-sm text-muted-foreground">
                        [Proof Preview: {payment.proofUrl}]
                      </div>
                    </div>

                    {/* Actions */}
                    {payment.status === 'pending' && (
                      <div className="space-y-3">
                        {rejectingId === payment.id ? (
                          <div className="space-y-2">
                            <textarea
                              placeholder="Reason for rejection (e.g., invalid receipt, amount mismatch)"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="w-full p-2 border rounded-lg text-sm"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReject(payment.id)}
                                disabled={!rejectionReason}
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                              >
                                Confirm Rejection
                              </Button>
                              <Button
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectionReason('');
                                }}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleVerify(payment.id)}
                              className="flex-1"
                            >
                              Approve Payment
                            </Button>
                            <Button
                              onClick={() => setRejectingId(payment.id)}
                              variant="destructive"
                              className="flex-1"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Expand Button */}
                {payment.status === 'pending' && (
                  <Button
                    onClick={() =>
                      setExpandedId(expandedId === payment.id ? null : payment.id)
                    }
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    {expandedId === payment.id ? 'Hide Details' : 'Review Payment'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
