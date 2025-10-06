'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function VerificationPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend cooldown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = Array.from({ length: 6 }, (_, i) => pastedData[i] || '');
    setVerificationCode(newCode);
    
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          verificationCode: code,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsVerified(true);
        toast.success('Account verified successfully!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 2000);
      } else {
        setError(data.message || 'Invalid verification code. Please try again.');
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch{
      setError('Something went wrong. Please try again.');
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;
    
    setIsResending(true);
    
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Verification code sent successfully!');
        setTimeLeft(60); // 60 second cooldown
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.message || 'Failed to resend code. Please try again.');
      }
    } catch{
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Account Verified!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your account has been successfully verified. You'll be redirected to login shortly.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/login"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verify Your Account
            </h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit verification code to your email address.
              Enter the code below to verify your account.
            </p>
            <p className="text-sm font-medium text-foreground mt-2">
              @{username}
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="space-y-6">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Verification Code
              </label>
              <div className="flex gap-2 justify-center">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg 
                               bg-background text-foreground
                               focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                               ${error ? 'border-red-500' : 'border-border'}
                               ${digit ? 'border-primary' : ''}
                               transition-colors`}
                    maxLength={1}
                    disabled={isLoading}
                  />
                ))}
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-3 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleVerify(verificationCode.join(''))}
              disabled={isLoading || verificationCode.some(digit => !digit)}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-opacity flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Account'
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={timeLeft > 0 || isResending}
                className="text-primary hover:text-primary/80 font-medium text-sm
                           disabled:text-muted-foreground disabled:cursor-not-allowed
                           transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : timeLeft > 0 ? (
                  `Resend in ${formatTime(timeLeft)}`
                ) : (
                  'Resend verification code'
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Check your spam folder if you don't see the email.
                <br />
                Need help?{' '}
                <Link href="/support" className="text-primary hover:text-primary/80">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
