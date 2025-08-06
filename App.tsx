import React, { useState, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { NumberInput } from './components/NumberInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { InstructionsPanel } from './components/InstructionsPanel';
import { PatternPreview } from './components/PatternPreview';
import { LogoIcon } from './components/Icons';
import { PatternInput, PatternResult } from './types';
// Inline Paywall component
interface PaywallProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onSuccess, onCancel }) => {
  const handlePaymentSuccess = () => {
    // In a real implementation, you'd verify the payment was successful
    // For now, we'll simulate success after clicking
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-stone-200">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-stone-800">Unlock Full Access</h1>
        <p className="mb-6 text-stone-600">
          Get instant access to generate your custom book folding pattern cutting instructions.
        </p>
        <p className="mb-6 text-2xl font-bold text-amber-800">Only $2.00</p>
        
        <div className="space-y-4">
          <a
            href="https://buy.stripe.com/test_cNi28s8Gf0Ag9Rk0cCbQY00"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
            onClick={handlePaymentSuccess}
          >
            Pay with Stripe
          </a>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full bg-stone-300 text-stone-700 px-6 py-2 rounded-lg hover:bg-stone-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="mt-6 text-xs text-stone-500">
          <p>Secure payment processing by Stripe</p>
          <p>One-time payment • Instant access</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [input, setInput] = useState<PatternInput>({
    imageFile: null,
    bookHeight: '',
    totalPages: '',
    padding: '1.0'
  });

  const [results, setResults] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
    setError(null);
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    setInput(prev => ({ ...prev, imageFile: file }));
    setError(null);
  }, []);

  const validateInput = (): string | null => {
    if (!input.imageFile) return 'Please select an image file.';
    if (!input.bookHeight || parseFloat(input.bookHeight) <= 0) return 'Please enter a valid book height.';
    if (!input.totalPages || parseInt(input.totalPages) <= 0) return 'Please enter a valid page count.';
    if (parseInt(input.totalPages) % 2 !== 0) return 'Total pages must be an even number.';
    return null;
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
        
        // Draw and resize the image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Convert to grayscale and apply threshold
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          const bw = gray < 128 ? 0 : 255; // Threshold to black/white
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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise<any[]>((resolve, reject) => {
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
        const pageMarks = [];
        
        for (let sheet = 0; sheet < sheets; sheet++) {
          const pageRange = `${sheet * 2 + 1}-${sheet * 2 + 2}`;
          const marks: number[] = [];
          
          // Sample the column of pixels for this sheet
          const pixelColumn = Math.floor((sheet / sheets) * canvas.width);
          
          let inBlackRegion = false;
          let regionStart = 0;
          
          for (let y = 0; y < canvas.height; y++) {
            const pixelIndex = (y * canvas.width + pixelColumn) * 4;
            const isBlack = imageData.data[pixelIndex] < 128; // Black pixel
            
            if (isBlack && !inBlackRegion) {
              // Start of black region
              inBlackRegion = true;
              regionStart = (y / canvas.height) * usableHeight + padding;
            } else if (!isBlack && inBlackRegion) {
              // End of black region
              inBlackRegion = false;
              const regionEnd = (y / canvas.height) * usableHeight + padding;
              marks.push(parseFloat(regionStart.toFixed(1)), parseFloat(regionEnd.toFixed(1)));
            }
          }
          
          // Handle case where black region extends to bottom
          if (inBlackRegion) {
            marks.push(parseFloat(regionStart.toFixed(1)), parseFloat((usableHeight + padding).toFixed(1)));
          }
          
          pageMarks.push({ pageRange, marks });
        }
        
        resolve(pageMarks);
      };
      
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

      // Process the image
      const processedImage = await processImage(input.imageFile!, sheets, Math.floor(bookHeight * 10));
      
      // Generate page marks
      const pageMarks = await generatePageMarks(processedImage, bookHeight, totalPages, padding);

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

  const handleGenerateInstructions = () => {
    setShowPaywall(true);
  };

  const handlePaymentSuccess = () => {
    // This would be called after successful payment
    if (results) {
      const pattern = results.pageMarks.map(page => 
        `${page.pageRange.padEnd(10)} ${page.marks.join(', ')}`
      ).join('\n');
      
      setResults(prev => prev ? { ...prev, pattern } : null);
      setShowPaywall(false);
    }
  };

  if (showPaywall) {
    return <Paywall onSuccess={handlePaymentSuccess} onCancel={() => setShowPaywall(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LogoIcon />
            <h1 className="text-3xl font-bold text-stone-800">Book Folding Pattern Generator</h1>
          </div>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Create precise "Measure, Mark, and Cut" patterns from your images. 
            Perfect for book folding art projects and sculptural designs.
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberInput
                    label="Book Page Height (cm)"
                    name="bookHeight"
                    value={input.bookHeight}
                    onChange={handleInputChange}
                    placeholder="e.g. 19.5"
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
                  placeholder="e.g. 1.0"
                />

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
              </div>
            </div>

            {/* Preview */}
            {results && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-stone-700 mb-3">Pattern Preview</h3>
                <div className="border border-stone-300 rounded-lg overflow-hidden">
                  <PatternPreview 
                    pageMarks={results.pageMarks}
                    bookHeight={results.bookHeight}
                    totalPages={results.totalPages}
                    padding={results.padding}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div>
            <ResultsDisplay 
              results={results} 
              onGenerateInstructions={handleGenerateInstructions}
            />
          </div>
        </div>

        {/* Instructions */}
        <InstructionsPanel />
      </div>
    </div>
  );
}

export default App;
