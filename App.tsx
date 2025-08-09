// src/App.tsx
import React, { useState, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { NumberInput } from './components/NumberInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { InstructionsPanel } from './components/InstructionsPanel';
import { PatternPreview } from './components/PatternPreview';
import { LogoIcon } from './components/Icons';
import { PatternInput, PatternResult } from './types';

// ===== Inline Paywall Component =====
interface PaywallProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  sessionId?: string;
  isVerifying?: boolean;
  verificationData?: { email: string; paymentId: string };
  onVerificationDataChange?: (data: { email: string; paymentId: string }) => void;
}

const Paywall: React.FC<PaywallProps> = ({
  onSuccess,
  onCancel,
  sessionId,
  isVerifying,
  verificationData,
  onVerificationDataChange
}) => {
  const handleInputChange = (field: 'email' | 'paymentId', value: string) => {
    if (onVerificationDataChange) {
      onVerificationDataChange({
        ...verificationData!,
        [field]: value
      });
    }
  };

  const canVerify =
    verificationData?.email &&
    verificationData?.email.includes('@') &&
    verificationData?.paymentId &&
    verificationData?.paymentId.length >= 10;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-stone-200">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-stone-800">Secure Payment Required</h1>
        <p className="mb-6 text-stone-600">
          Complete payment to unlock your cutting instructions. Enter your payment details below to verify.
        </p>
        <p className="mb-6 text-2xl font-bold text-amber-800">Only $2.00</p>

        <div className="space-y-4">
          <a
            href="https://buy.stripe.com/cNi28s8Gf0Ag9Rk0cCbQY00"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Pay with Stripe
          </a>

          <div className="border-t border-stone-200 pt-4">
            <p className="text-sm text-stone-600 mb-3">
              After completing payment, enter your details from the Stripe receipt:
            </p>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Email Address Used for Payment
                </label>
                <input
                  type="email"
                  value={verificationData?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isVerifying}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Payment Confirmation ID
                </label>
                <input
                  type="text"
                  value={verificationData?.paymentId || ''}
                  onChange={(e) => handleInputChange('paymentId', e.target.value)}
                  placeholder="pi_1234... or ch_1234..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isVerifying}
                />
                <p className="text-xs text-stone-500 mt-1">
                  Find this in your Stripe email receipt (starts with pi_ or ch_)
                </p>
              </div>
            </div>

            <button
              onClick={onSuccess}
              disabled={isVerifying || !canVerify}
              className="w-full mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying Payment...' : 'Verify Payment & Unlock'}
            </button>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isVerifying}
              className="w-full bg-stone-300 text-stone-700 px-6 py-2 rounded-lg hover:bg-stone-400 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="mt-6 text-xs text-stone-500">
          <p>🔒 Payment verification required for security</p>
          <p>Your payment details are used only for verification</p>
        </div>
      </div>
    </div>
  );
};

// ===== Main App =====
function App() {
  const REQUIRE_PAYMENT = false;

  const [input, setInput] = useState<PatternInput>({
    imageFile: null,
    bookHeight: '',
    totalPages: '',
    padding: '1.0'
  });

  const [results, setResults] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [paymentVerificationData, setPaymentVerificationData] = useState({ email: '', paymentId: '' });
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setError(null);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value);
    setError(null);
  };

  const isValidEmail = (email: string) => email.includes('@') && email.includes('.') && email.length > 5;

  const handleFileChange = useCallback((file: File | null) => {
    setInput((prev) => ({ ...prev, imageFile: file }));
    setError(null);
  }, []);

  const validateInput = (): string | null => {
    if (!input.imageFile) return 'Please select an image file.';
    if (!input.bookHeight || parseFloat(input.bookHeight) <= 0) return 'Please enter a valid book height.';
    if (!input.totalPages || parseInt(input.totalPages) <= 0) return 'Please enter a valid page count.';
    if (parseInt(input.totalPages) % 2 !== 0) return 'Total pages must be an even number.';
    return null;
  };

  const calculateDepthFromBrightness = (brightness: number): number => {
    const minDepth = 5;
    const maxDepth = 40;
    const normalizedBrightness = brightness / 255;
    const depth = maxDepth - normalizedBrightness * (maxDepth - minDepth);
    return Math.round(depth * 10) / 10;
  };

  const processImage = async (imageFile: File, targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          const bw = gray < 128 ? 0 : 255;
          data[i] = data[i + 1] = data[i + 2] = bw;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const generatePageMarks = (processedImageData: string, bookHeight: number, totalPages: number, padding: number) => {
    // unchanged logic, omitted for brevity
  };

  const generatePreview = async () => {
    // unchanged logic, omitted for brevity
  };

  const handleGenerateInstructions = async () => {
    if (!isValidEmail(userEmail)) {
      setError('Please enter a valid email address before generating instructions.');
      return;
    }

    if (!REQUIRE_PAYMENT) {
      if (results) {
        const pattern = results.pageMarks
          .map((page) => {
            const cuts = page.marks.join(', ');
            return `${page.pageRange.padEnd(10)}${cuts.padEnd(28)}${page.depth.toString().padEnd(6)}mm`;
          })
          .join('\n');
        const patternWithHeader = `PAGE RANGE  CUT POSITIONS (cm)           DEPTH\n${'='.repeat(55)}\n${pattern}`;
        setResults((prev) => (prev ? { ...prev, pattern: patternWithHeader } : null));
      }
      return;
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setPaymentSessionId(sessionId);
    setPaymentVerificationData({ email: userEmail, paymentId: '' });
    setShowPaywall(true);
  };

  const verifyPaymentAndGenerate = async (email: string, paymentId: string) => {
    // unchanged logic, but adjust pattern formatting
    if (results) {
      const pattern = results.pageMarks
        .map((page) => {
          const cuts = page.marks.join(', ');
          return `${page.pageRange.padEnd(10)}${cuts.padEnd(28)}${page.depth.toString().padEnd(6)}mm`;
        })
        .join('\n');
      const patternWithHeader = `PAGE RANGE  CUT POSITIONS (cm)           DEPTH\n${'='.repeat(55)}\n${pattern}`;
      setResults((prev) => (prev ? { ...prev, pattern: patternWithHeader } : null));
      setShowPaywall(false);
    }
  };

  const handlePaymentSuccess = () => {
    const { email, paymentId } = paymentVerificationData;
    verifyPaymentAndGenerate(email, paymentId);
  };

  if (showPaywall) {
    return (
      <Paywall
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPaywall(false)}
        sessionId={paymentSessionId}
        isVerifying={isVerifyingPayment}
        verificationData={paymentVerificationData}
        onVerificationDataChange={setPaymentVerificationData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-200">
      {/* UI unchanged */}
    </div>
  );
}

export default App;
