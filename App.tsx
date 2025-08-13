import React, { useState, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { NumberInput } from './components/NumberInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { InstructionsPanel } from './components/InstructionsPanel';
import { PatternPreview } from './components/PatternPreview';
import { LogoIcon } from './components/Icons';
import { PatternInput, PatternResult, PageMark } from './types';

// Inline Paywall component
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

  const canVerify = verificationData?.email && 
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
                  placeholder="pi_1234... or ch_1234... (from email receipt)"
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

function App() {
  // 🎯 PROMOTION TOGGLE: Set to true to require payment
  const REQUIRE_PAYMENT = false; // Change to true for production
  
  const [input, setInput] = useState<PatternInput>({
    imageFile: null,
    bookHeight: '',
    totalPages: '',
    padding: '1.0'
  });

  const [useDepthMode, setUseDepthMode] = useState(true); // New state for depth mode toggle
  const [results, setResults] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [paymentVerificationData, setPaymentVerificationData] = useState({
    email: '',
    paymentId: ''
  });
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
    setError(null);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value);
    setError(null);
  };

  const handleDepthModeChange = (newMode: boolean) => {
    setUseDepthMode(newMode);
    setResults(null); // Clear existing results when mode changes
    setError(null);
  };

  const isValidEmail = (email: string) => {
    return email.includes('@') && email.includes('.') && email.length > 5;
  };

  const handleFileChange = useCallback((file: File | null) => {
    setInput(prev => ({ ...prev, imageFile: file }));
    setResults(null); // Clear existing results when file changes
    setError(null);
  }, []);

  const validateInput = (): string | null => {
    if (!input.imageFile) return 'Please select an image file.';
    if (!input.bookHeight || parseFloat(input.bookHeight) <= 0) return 'Please enter a valid book height.';
    if (!input.totalPages || parseInt(input.totalPages) <= 0) return 'Please enter a valid page count.';
    if (parseInt(input.totalPages) % 2 !== 0) return 'Total pages must be an even number.';
    return null;
  };

  const processImageForDepthMode = async (imageFile: File, targetWidth: number, targetHeight: number): Promise<string> => {
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
        
        // Draw and resize the image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Convert to grayscale for depth mode
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          data[i] = data[i + 1] = data[i + 2] = gray;
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const processImageForBWMode = async (imageFile: File, targetWidth: number, targetHeight: number): Promise<string> => {
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
        
        // Draw and resize the image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Convert to black and white (thresholded)
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          const bw = gray > 127 ? 255 : 0; // Threshold at middle gray
          data[i] = data[i + 1] = data[i + 2] = bw;
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const calculateDepthFromBrightness = (brightness: number): number => {
    // Brightness range: 0-255
    // Cut depth range: 40mm (black) to 3mm (white)
    const minDepth = 3;  // mm for white/light areas
    const maxDepth = 40; // mm for black/dark areas
    
    // Invert brightness (darker = deeper cuts)
    const normalizedBrightness = brightness / 255;
    const curvedBrightness = Math.pow(normalizedBrightness, 1.8);
    const depth = maxDepth - (curvedBrightness * (maxDepth - minDepth));
    
    return Math.round(depth * 10) / 10; // Round to 1 decimal place
  };

  const generatePageMarksDepthMode = (processedImageData: string, bookHeight: number, totalPages: number, padding: number): Promise<PageMark[]> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise<PageMark[]>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          reject(new Error('Could not get image data'));
          return;
        }
        
        const sheets = totalPages / 2;
        const usableHeight = bookHeight - (2 * padding);
        const pageMarks: PageMark[] = [];
        
        for (let sheet = 0; sheet < sheets; sheet++) {
          const pageRange = `${sheet * 2 + 1}-${sheet * 2 + 2}`;
          
          // Sample the column of pixels for this sheet
          const pixelColumn = Math.floor((sheet / sheets) * canvas.width);
          
          // Collect all brightness values for this column
          const columnData: Array<{y: number, brightness: number, position: number}> = [];
          
          for (let y = 0; y < canvas.height; y++) {
            const pixelIndex = (y * canvas.width + pixelColumn) * 4;
            const brightness = imageData.data[pixelIndex]; // Red channel (grayscale)
            const position = (y / canvas.height) * usableHeight + padding;
            
            columnData.push({ y, brightness, position });
          }
          
          // Calculate average brightness for single cut depth per page
          const avgBrightness = columnData.reduce((sum, pixel) => sum + pixel.brightness, 0) / columnData.length;
          const cutDepth = calculateDepthFromBrightness(avgBrightness);
          
          // Generate cut marks based on brightness thresholds
          const marks: number[] = [];
          const cutThreshold = 180; // Pixels darker than this will be cut
          
          let inCutRegion = false;
          let regionStart = 0;
          
          for (let i = 0; i < columnData.length; i++) {
            const pixel = columnData[i];
            const shouldCut = pixel.brightness < cutThreshold;
            
            if (shouldCut && !inCutRegion) {
              // Start new cut region
              regionStart = pixel.position;
              inCutRegion = true;
            } else if (!shouldCut && inCutRegion) {
              // End current cut region
              marks.push(regionStart, pixel.position);
              inCutRegion = false;
            }
          }
          
          // Handle region extending to bottom
          if (inCutRegion) {
            marks.push(regionStart, usableHeight + padding);
          }
          
          // Round all marks to 1 decimal place (10th of a mm precision)
          const roundedMarks = marks.map(mark => parseFloat(mark.toFixed(1)));
          
          pageMarks.push({ 
            pageRange, 
            marks: roundedMarks, 
            depth: cutDepth // Single cut depth for the entire page
          });
        }
        
        resolve(pageMarks);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = processedImageData;
    });
  };

  const generatePageMarksBWMode = (processedImageData: string, bookHeight: number, totalPages: number, padding: number): Promise<PageMark[]> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise<PageMark[]>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          reject(new Error('Could not get image data'));
          return;
        }
        
        const sheets = totalPages / 2;
        const usableHeight = bookHeight - (2 * padding);
        const pageMarks: PageMark[] = [];
        const uniformDepth = 20; // Standard 20mm depth for B&W mode
        
        for (let sheet = 0; sheet < sheets; sheet++) {
          const pageRange = `${sheet * 2 + 1}-${sheet * 2 + 2}`;
          
          // Sample the column of pixels for this sheet
          const pixelColumn = Math.floor((sheet / sheets) * canvas.width);
          
          // Collect all pixel data for this column
          const columnData: Array<{y: number, brightness: number, position: number}> = [];
          
          for (let y = 0; y < canvas.height; y++) {
            const pixelIndex = (y * canvas.width + pixelColumn) * 4;
            const brightness = imageData.data[pixelIndex]; // Red channel (B&W)
            const position = (y / canvas.height) * usableHeight + padding;
            
            columnData.push({ y, brightness, position });
          }
          
          // Generate cut marks - cut only where pixels are black (0) in B&W mode
          const marks: number[] = [];
          let inCutRegion = false;
          let regionStart = 0;
          
          for (let i = 0; i < columnData.length; i++) {
            const pixel = columnData[i];
            const shouldCut = pixel.brightness === 0; // Only pure black pixels
            
            if (shouldCut && !inCutRegion) {
              // Start new cut region
              regionStart = pixel.position;
              inCutRegion = true;
            } else if (!shouldCut && inCutRegion) {
              // End current cut region
              marks.push(regionStart, pixel.position);
              inCutRegion = false;
            }
          }
          
          // Handle region extending to bottom
          if (inCutRegion) {
            marks.push(regionStart, usableHeight + padding);
          }
          
          // Round all marks to 1 decimal place
          const roundedMarks = marks.map(mark => parseFloat(mark.toFixed(1)));
          
          pageMarks.push({ 
            pageRange, 
            marks: roundedMarks, 
            depth: uniformDepth // Uniform depth for B&W mode
          });
        }
        
        resolve(pageMarks);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = processedImageData;
    });
  };

  const generatePreview = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const bookHeight = parseFloat(input.bookHeight);
      const totalPages = parseInt(input.totalPages);
      const padding = parseFloat(input.padding);
      const sheets = totalPages / 2;

      // Process the image based on selected mode
      const processedImage = useDepthMode 
        ? await processImageForDepthMode(input.imageFile!, sheets, Math.floor(bookHeight * 10))
        : await processImageForBWMode(input.imageFile!, sheets, Math.floor(bookHeight * 10));
      
      // Generate page marks based on selected mode
      const pageMarks = useDepthMode
        ? await generatePageMarksDepthMode(processedImage, bookHeight, totalPages, padding)
        : await generatePageMarksBWMode(processedImage, bookHeight, totalPages, padding);

      setResults({
        processedImage,
        filename: input.imageFile!.name,
        pageMarks,
        bookHeight,
        totalPages,
        padding
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the image.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePatternText = (pageMarks: PageMark[]): string => {
    const patternLines = pageMarks.map(page => {
      const depthStr = useDepthMode ? `${page.depth}mm`.padEnd(8) : `${page.depth}mm`.padEnd(8);
      const pageRangeStr = page.pageRange.padEnd(12);
      
      if (page.marks.length === 0) {
        return `${depthStr} ${pageRangeStr} No cuts needed`;
      }
      
      // Group marks into pairs for cut ranges
      const cutRanges: string[] = [];
      
      for (let i = 0; i < page.marks.length; i += 2) {
        if (page.marks[i + 1] !== undefined) {
          cutRanges.push(`${page.marks[i]}→${page.marks[i + 1]}`);
        }
      }
      
      const rangeText = cutRanges.join(', ');
      return `${depthStr} ${pageRangeStr} ${rangeText}`;
    });

    const modeText = useDepthMode ? 'Variable Depth' : 'Uniform Depth (20mm)';
    const header = `CUT DEPTH PAGE RANGE   CUT POSITIONS (cm from top)\n${'='.repeat(65)}\nMode: ${modeText}`;
    
    const instructions = useDepthMode
      ? `Instructions:\n` +
        `- Cut depth varies based on image brightness (3-40mm range)\n` +
        `- Cut depth is consistent for each page pair\n` +
        `- Numbers show cut start→end positions in cm from top of page\n` +
        `- Cut straight into the page at the specified depth\n` +
        `- Deeper cuts = darker areas in original image\n` +
        `- Use a sharp craft knife and metal ruler for clean cuts`
      : `Instructions:\n` +
        `- All cuts use uniform 20mm depth\n` +
        `- Numbers show cut start→end positions in cm from top of page\n` +
        `- Cut straight into the page at 20mm depth\n` +
        `- Cut only where black areas appear in processed image\n` +
        `- Use a sharp craft knife and metal ruler for clean cuts`;

    return `${header}\n${patternLines.join('\n')}\n\n${instructions}`;
  };

  const handleGenerateInstructions = async () => {
    // Validate email first
    if (!isValidEmail(userEmail)) {
      setError('Please enter a valid email address before generating instructions.');
      return;
    }

    // Store email for later use (only attempt if we're in a real environment)
    try {
      const response = await fetch('/api/collect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          sessionId: `session_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
      
      if (response.ok) {
        console.log('Email successfully saved to backend');
      }
    } catch (error) {
      // Don't block the user flow if email collection fails
      console.warn('Email collection not available:', error);
    }
    
    // Check if payment is required
    if (!REQUIRE_PAYMENT) {
      // Free mode - generate instructions immediately
      if (results) {
        const pattern = generatePatternText(results.pageMarks);
        setResults(prev => prev ? { ...prev, pattern } : null);
      }
      return;
    }
    
    // Paid mode - show paywall with pre-filled email
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setPaymentSessionId(sessionId);
    setPaymentVerificationData({ email: userEmail, paymentId: '' });
    setShowPaywall(true);
  };

  const verifyPaymentAndGenerate = async (email: string, paymentId: string) => {
    setIsVerifyingPayment(true);
    
    try {
      // Basic validation
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      
      if (!paymentId || paymentId.length < 10) {
        alert('Please enter a valid payment confirmation (at least 10 characters)');
        return;
      }
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Additional security: Check if payment details look legitimate
      const hasValidFormat = paymentId.includes('pi_') || paymentId.includes('ch_') || paymentId.length >= 15;
      
      if (!hasValidFormat) {
        alert('Payment confirmation format appears invalid. Please check your Stripe receipt.');
        return;
      }
      
      if (results) {
        // Generate cutting instructions after verification
        const pattern = generatePatternText(results.pageMarks);
        setResults(prev => prev ? { ...prev, pattern } : null);
        setShowPaywall(false);
        
        // Clear verification data
        setPaymentVerificationData({ email: '', paymentId: '' });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Unable to verify payment. Please try again or contact support.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    const { email, paymentId } = paymentVerificationData;
    verifyPaymentAndGenerate(email, paymentId);
  };

  const handlePaymentCancel = () => {
    setShowPaywall(false);
  };

  if (showPaywall) {
    return (
      <Paywall 
        onSuccess={handlePaymentSuccess} 
        onCancel={handlePaymentCancel}
        sessionId={paymentSessionId}
        isVerifying={isVerifyingPayment}
        verificationData={paymentVerificationData}
        onVerificationDataChange={setPaymentVerificationData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LogoIcon />
            <h1 className="text-3xl font-bold text-stone-800">
              {useDepthMode ? 'Advanced' : 'Classic'} Book Cutting Pattern Generator
            </h1>
          </div>
          <p className="text-stone-600 max-w-2xl mx-auto">
            {useDepthMode 
              ? 'Create sophisticated depth-based "Measure, Mark, and Cut" patterns from your images. Now with variable cut depth support for realistic shadows and gradients.'
              : 'Create classic black and white "Measure, Mark, and Cut" patterns from your images. Perfect for simple, high-contrast designs with uniform cutting depth.'
            }
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-stone-700 mb-4">1. Upload & Configure</h2>
              
              <div className="space-y-4">
                <FileInput
                  label="Upload Image"
                  id="imageFile"
                  file={input.imageFile}
                  onFileChange={handleFileChange}
                />
                
                {/* Processing Mode Selection - More Prominent */}
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-300">
                  <h3 className="text-base font-semibold text-stone-700 mb-3">Processing Mode</h3>
                  
                  <div className="space-y-3">
                    {/* Variable Depth Mode Option */}
                    <div className="flex items-start space-x-3">
                      <input
                        id="depthModeOn"
                        name="processingMode"
                        type="radio"
                        checked={useDepthMode}
                        onChange={() => setUseDepthMode(true)}
                        className="h-4 w-4 mt-1 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <label htmlFor="depthModeOn" className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-stone-700">
                          🎨 Variable Depth Mode (Advanced)
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          Processes grayscale images with depth variation (3-40mm). Creates realistic shadows and gradients. Best for photos, portraits, and complex images.
                        </div>
                      </label>
                    </div>
                    
                    {/* Classic Mode Option */}
                    <div className="flex items-start space-x-3">
                      <input
                        id="depthModeOff"
                        name="processingMode"
                        type="radio"
                        checked={!useDepthMode}
                        onChange={() => setUseDepthMode(false)}
                        className="h-4 w-4 mt-1 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <label htmlFor="depthModeOff" className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-stone-700">
                          🎯 Classic Mode (Uniform Depth)
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          Processes as black & white with uniform 20mm depth. Simple and consistent. Best for high-contrast designs, text, and logos.
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Mode-specific information */}
                <div className={`${useDepthMode ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} p-3 rounded-md border`}>
                  <p className={`text-sm ${useDepthMode ? 'text-blue-800' : 'text-green-800'}`}>
                    {useDepthMode ? (
                      <>
                        <strong>Advanced Mode:</strong> Variable cut depths create realistic shadows and gradients. 
                        Dark areas cut deeper (up to 40mm), light areas cut shallow (3mm minimum).
                      </>
                    ) : (
                      <>
                        <strong>Classic Mode:</strong> Simple black & white processing with uniform 20mm cut depth. 
                        Only pure black areas will be cut, creating clean, high-contrast results.
                      </>
                    )}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberInput
                    label="Book Page Height (cm)"
                    name="bookHeight"
                    value={input.bookHeight}
                    onChange={handleInputChange}
                    placeholder="e.g. 1.0"
                />

                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-stone-700">
                    Email Address *
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="userEmail"
                      value={userEmail}
                      onChange={handleEmailChange}
                      className="block w-full shadow-sm sm:text-sm border-orange-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Required to generate cutting instructions</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={generatePreview}
                  disabled={isGenerating}
                  className="w-full bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Processing...' : 'Generate Preview'}
                </button>

                {/* Show Generate Instructions button only after preview is generated */}
                {results && (
                  <button
                    onClick={handleGenerateInstructions}
                    disabled={!isValidEmail(userEmail)}
                    className="w-full bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {useDepthMode 
                      ? 'Generate Depth-Based Instructions'
                      : 'Generate Classic Instructions'
                    }
                    {!isValidEmail(userEmail) && (
                      <span className="text-sm block">Enter valid email first</span>
                    )}
                  </button>
                )}
              </div>
            </div>


          </div>

          {/* Right Column - Results */}
          <div>
            <ResultsDisplay 
              results={results} 
              onGenerateInstructions={handleGenerateInstructions}
              useDepthMode={useDepthMode}
            />
          </div>
        </div>

        {/* Instructions */}
        <InstructionsPanel useDepthMode={useDepthMode} />
      </div>
    </div>
  );
}

export default App;g. 19.5"
                  />
                  <NumberInput
                    label="Total Page Count"
                    name="totalPages"
                    value={input.totalPages}
                    onChange={handleInputChange}
                    placeholder="e.g. 200"
                    step="2"
                  />
                </div>
                
                <NumberInput
                  label="Top/Bottom Padding (cm)"
                  name="padding"
                  value={input.padding}
                  onChange={handleInputChange}
                  placeholder="e.
