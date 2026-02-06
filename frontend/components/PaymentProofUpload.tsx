'use client';

import React from "react"
import api from '@/lib/api';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentProofUploadProps {
  orderId: string;
  paymentMethod: string;
  amount: number;
  onSuccess?: () => void;
}

export function PaymentProofUpload({
  orderId,
  paymentMethod,
  amount,
  onSuccess,
}: PaymentProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a PNG, JPEG, or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('paymentId', orderId); // orderId prop actually contains paymentId
      formData.append('paymentMethod', paymentMethod);

      await api.post('/payments/upload-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setUploaded(true);
      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">Payment Proof Submitted</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your payment receipt has been uploaded successfully
              </p>
            </div>
            <div className="bg-accent p-3 rounded-lg text-sm">
              <p className="font-medium">Order ID: {orderId}</p>
              <p className="text-xs text-muted-foreground">
                Our team will verify your payment within 24 hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Payment Receipt</CardTitle>
        <CardDescription>
          {paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE Mobile Banking'} Payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg flex gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Please upload a clear screenshot or PDF of your payment receipt/confirmation
          </p>
        </div>

        <div className="bg-accent p-3 rounded-lg">
          <p className="text-sm font-medium">Amount Paid:</p>
          <p className="text-xl font-bold">{amount.toFixed(2)} ETB</p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview ? (
            <div className="space-y-3">
              <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-sm">
                <p className="font-medium text-green-600">✓ {file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {((file?.size ?? 0) / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">Click to upload</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPEG or PDF (max 5MB)
              </p>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {file && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              Change File
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Submit Payment Proof'}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Your receipt will be reviewed by our admin team for verification
        </p>
      </CardContent>
    </Card>
  );
}
