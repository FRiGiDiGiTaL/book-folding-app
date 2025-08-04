
import React, { useState, useCallback, useMemo } from 'react';
import { PatternInput, PageMark, PatternResult } from './types';
import { FileInput } from './components/FileInput';
import { NumberInput } from './components/NumberInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LogoIcon, GenerateIcon } from './components/Icons';
import { InstructionsPanel } from './components/InstructionsPanel';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<PatternInput>({
    imageFile: null,
    bookHeight: '0',
    totalPages: '0',
    padding: '0',
  });
  const [results, setResults] = useState<PatternResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setInputs(prev => ({ ...prev, imageFile: file }));
  };

  const isFormValid = useMemo(() => {
    const totalPagesInt = parseInt(inputs.totalPages, 10);
    return (
      inputs.imageFile &&
      parseFloat(inputs.bookHeight) > 0 &&
      totalPagesInt > 0 &&
      totalPagesInt % 2 === 0 && // Each sheet has 2 pages, so must be even
      parseFloat(inputs.padding) >= 0 &&
      parseFloat(inputs.bookHeight) - 2 * parseFloat(inputs.padding) > 0
    );
  }, [inputs]);
  
  const handleGeneratePreview = useCallback(async () => {
    if (!isFormValid || !inputs.imageFile) {
      if (inputs.totalPages && parseInt(inputs.totalPages, 10) % 2 !== 0) {
        setError("Total pages must be an even number.");
      } else {
        setError("Please fill all fields with valid values.");
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const bookHeight = parseFloat(inputs.bookHeight);
      const totalPages = parseInt(inputs.totalPages, 10);
      const padding = parseFloat(inputs.padding);
      const usableHeight = bookHeight - 2 * padding;

      if (usableHeight <= 0) {
        throw new Error("Padding cannot be greater than or equal to half the book height.");
      }

      const image = new Image();
      image.src = URL.createObjectURL(inputs.imageFile!);
      
      await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const fixedHeight = 1000; // Use a fixed height for processing precision
      const sheets = totalPages / 2;
      canvas.width = sheets;
      canvas.height = fixedHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error("Could not get canvas context");
      
      ctx.drawImage(image, 0, 0, sheets, fixedHeight);
      
      const imageData = ctx.getImageData(0, 0, sheets, fixedHeight);
      const { data } = imageData;
      const pageMarks: PageMark[] = [];

      for (let x = 0; x < sheets; x++) {
        const marksForPage: number[] = [];
        let isPrevPixelBlack = false;
        
        for (let y = 0; y < fixedHeight; y++) {
          const index = (y * sheets + x) * 4;
          // Using a simple threshold on the red channel for black/white detection
          const isCurrentPixelBlack = data[index] < 128;
          
          if (isCurrentPixelBlack && !isPrevPixelBlack) { // White to Black transition
            const mark = (y / fixedHeight) * usableHeight + padding;
            marksForPage.push(mark);
          } else if (!isCurrentPixelBlack && isPrevPixelBlack) { // Black to White transition
            const mark = (y / fixedHeight) * usableHeight + padding;
            marksForPage.push(mark);
          }
          isPrevPixelBlack = isCurrentPixelBlack;
        }

        if (isPrevPixelBlack) {
            const mark = usableHeight + padding;
            marksForPage.push(mark);
        }

        const startPage = x * 2 + 1;
        const endPage = startPage + 1;
        pageMarks.push({ pageRange: `${startPage}-${endPage}`, marks: marksForPage });
      }

      setResults({
        processedImage: canvas.toDataURL('image/png'),
        filename: inputs.imageFile.name,
        pageMarks,
        bookHeight,
        totalPages,
        padding
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during pattern generation.");
    } finally {
      setIsLoading(false);
    }
  }, [inputs, isFormValid]);
  
  const handleGenerateInstructions = useCallback(() => {
    if (!results || !results.pageMarks) return;

    const patternString = results.pageMarks.map(page => {
        if (page.marks.length === 0) {
          return `${page.pageRange} No marks`;
        }
        
        const roundedMarksAsNumbers = page.marks.map(m => parseFloat(m.toFixed(1)));

        const adjustedMarks: number[] = [];
        const usedMarksOnPage = new Set<string>();

        for (const mark of roundedMarksAsNumbers) {
          let currentMark = mark;
          while (usedMarksOnPage.has(currentMark.toFixed(1))) {
            currentMark += 0.1;
            currentMark = parseFloat(currentMark.toFixed(1));
          }
          adjustedMarks.push(currentMark);
          usedMarksOnPage.add(currentMark.toFixed(1));
        }

        const marksString = adjustedMarks.map(m => m.toFixed(1)).join(', ');
        return `${page.pageRange} ${marksString}`;
      }).join('\n');
    
    setResults(prevResults => prevResults ? { ...prevResults, pattern: patternString } : null);
  }, [results]);

  return (
    <div className="min-h-screen bg-stone-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-2">
            <LogoIcon />
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight">
              Book Folding Pattern Generator <span className="text-lg font-normal tracking-normal">by FRiGiDiGiTaL</span>
            </h1>
          </div>
          <p className="text-md text-stone-600 max-w-2xl mx-auto">
            Create custom "Measure, Mark, and Cut" patterns from any black & white image for your next book art project.
          </p>
        </header>

        <InstructionsPanel />

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="bg-orange-50 p-6 rounded-xl shadow-md border border-orange-200">
              <h2 className="text-xl font-semibold text-stone-700 mb-5 border-b pb-3">1. Project Details</h2>
              <div className="space-y-5">
                <FileInput
                  label="Upload Image"
                  id="imageFile"
                  file={inputs.imageFile}
                  onFileChange={handleFileChange}
                />
                <NumberInput
                  label="Book Height (cm)"
                  name="bookHeight"
                  value={inputs.bookHeight}
                  onChange={handleInputChange}
                  placeholder="e.g., 21.5"
                />
                <NumberInput
                  label="Total Pages (must be even)"
                  name="totalPages"
                  value={inputs.totalPages}
                  onChange={handleInputChange}
                  placeholder="e.g., 400"
                  step="2"
                />
                <NumberInput
                  label="Top/Bottom Padding (cm)"
                  name="padding"
                  value={inputs.padding}
                  onChange={handleInputChange}
                  placeholder="e.g., 1.5"
                />
              </div>
              <div className="mt-8">
                <button
                  onClick={handleGeneratePreview}
                  disabled={!isFormValid || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-amber-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:bg-stone-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <GenerateIcon />
                      Generate Preview
                    </>
                  )}
                </button>
                {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
             <ResultsDisplay results={results} onGenerateInstructions={handleGenerateInstructions} />
          </div>
        </main>
        
         <footer className="text-center mt-12 text-stone-500 text-sm">
            <p>&copy; {new Date().getFullYear()} NovelArt. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
