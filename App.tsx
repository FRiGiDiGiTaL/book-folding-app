import React, { useState, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { NumberInput } from './components/NumberInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { InstructionsPanel } from './components/InstructionsPanel';
import { PatternPreview } from './components/PatternPreview';
import { LogoIcon } from './components/Icons';
import { PatternInput, PatternResult } from './types';

function App() {
  const [input, setInput] = useState<PatternInput>({
    imageFile: null,
    bookHeight: '',
    totalPages: '',
    padding: '0.5'
  });

  const [results, setResults] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDepthMode, setUseDepthMode] = useState(true);

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
    if (!input.bookHeight || parseFloat(input.bookHeight) <= 0) return 'Invalid book height.';
    if (!input.totalPages || parseInt(input.totalPages) <= 0) return 'Invalid page count.';
    if (parseInt(input.totalPages) % 2 !== 0) return 'Total pages must be even.';
    return null;
  };

  /* ---------------------------------------------------------
     IMAGE PROCESSING
     --------------------------------------------------------- */
  const processImage = async (
    imageFile: File,
    targetHeight: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return reject(new Error('Canvas unavailable'));

      img.onload = () => {
        const scale = targetHeight / img.height;
        const targetWidth = Math.ceil(img.width * scale);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const bw = gray < 128 ? 0 : 255;
          data[i] = data[i + 1] = data[i + 2] = bw;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(imageFile);
    });
  };

  /* ---------------------------------------------------------
     PAGE MARK GENERATION
     --------------------------------------------------------- */
  const generatePageMarks = async (
    processedImageData: string,
    bookHeight: number,
    totalPages: number,
    padding: number,
    useDepthMode: boolean
  ) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise<any[]>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) return reject(new Error('No image data'));

        const sheets = totalPages / 2;
        const usableHeight = bookHeight - 2 * padding;
        const pageMarks = [];

        for (let sheet = 0; sheet < sheets; sheet++) {

          // CENTER SAMPLING ACROSS ENTIRE IMAGE WIDTH
          const x = Math.floor(((sheet + 0.5) / sheets) * canvas.width);

          const pageRange = `${sheet * 2 + 1}-${sheet * 2 + 2}`;
          const marks: number[] = [];

          let inBlack = false;
          let regionStart = 0;

          for (let y = 0; y < canvas.height; y++) {
            const idx = (y * canvas.width + x) * 4;
            const value = imageData.data[idx];
            const isBlack = value < 128;

            const mappedY = (y / canvas.height) * usableHeight + padding;

            if (isBlack && !inBlack) {
              inBlack = true;
              regionStart = mappedY;
            } 
            else if (!isBlack && inBlack) {
              inBlack = false;
              marks.push(
                parseFloat(regionStart.toFixed(1)),
                parseFloat(mappedY.toFixed(1))
              );
            }
          }

          if (inBlack) {
            marks.push(
              parseFloat(regionStart.toFixed(1)),
              parseFloat((bookHeight - padding).toFixed(1))
            );
          }

          let depth = 20;

          if (useDepthMode) {
            depth = Math.round((3 + Math.random() * 37) * 10) / 10;
          }

          pageMarks.push({
            pageRange,
            marks,
            depth
          });
        }

        resolve(pageMarks);
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = processedImageData;
    });
  };

  /* ---------------------------------------------------------
     GENERATE INSTRUCTIONS TEXT
     --------------------------------------------------------- */
  const generateInstructions = useCallback(() => {
    if (!results) return;

    const lines: string[] = [];

    if (useDepthMode) {
      lines.push('BOOK FOLDING PATTERN - DEPTH-BASED CUTTING');
      lines.push('=' .repeat(70));
      lines.push('');
      lines.push('CUT DEPTH (mm)   PAGE RANGE   CUT POSITIONS (from top of page in cm)');
      lines.push('-' .repeat(70));
    } 
    else {
      lines.push('BOOK FOLDING PATTERN - CLASSIC CUTTING');
      lines.push('=' .repeat(70));
      lines.push('');
      lines.push('PAGE RANGE   CUT POSITIONS (from top of page in cm)');
      lines.push('-' .repeat(70));
    }

    results.pageMarks.forEach(page => {

      const marksStr = page.marks.length > 0
        ? page.marks.map(m => m.toFixed(1)).join(', ')
        : 'No cuts needed';

      if (useDepthMode) {
        lines.push(`${page.depth.toFixed(1)}mm          ${page.pageRange.padEnd(12)} ${marksStr}`);
      } 
      else {
        lines.push(`${page.pageRange.padEnd(12)} ${marksStr}`);
      }
    });

    lines.push('');
    lines.push('-' .repeat(70));
    lines.push('INSTRUCTIONS:');
    lines.push('1. Measure from top of page using the Cut Positions');
    lines.push('2. Mark each position lightly with pencil');
    lines.push('3. Cut straight into page edge at marked positions');

    if (useDepthMode) {
      lines.push('4. Cut to specified depth for each page pair');
      lines.push('5. All cuts on a page pair use the same depth');
    } 
    else {
      lines.push('4. Cut to uniform 20.0mm depth for all cuts');
    }

    lines.push('6. Cut through both pages of each sheet simultaneously');
    lines.push('');
    lines.push('Book Specifications:');
    lines.push(`- Page Height: ${results.bookHeight}cm`);
    lines.push(`- Total Pages: ${results.totalPages}`);
    lines.push(`- Top/Bottom Margin: ${results.padding}cm`);
    lines.push(`- Total Sheets: ${results.totalPages / 2}`);

    const pattern = lines.join('\n');

    setResults(prev => prev ? { ...prev, pattern } : null);

  }, [results, useDepthMode]);

  /* ---------------------------------------------------------
     PREVIEW GENERATION
     --------------------------------------------------------- */
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

      const usableHeight = bookHeight - 2 * padding;

      const processedImage = await processImage(
        input.imageFile!,
        Math.floor(usableHeight * 20)
      );

      const pageMarks = await generatePageMarks(
        processedImage,
        bookHeight,
        totalPages,
        padding,
        useDepthMode
      );

      setResults({
        processedImage,
        filename: input.imageFile!.name,
        pageMarks,
        bookHeight,
        totalPages,
        padding
      });

    } 
    catch (err) {

      setError(err instanceof Error ? err.message : 'Processing failed');

    } 
    finally {

      setIsGenerating(false);

    }
  };

  return (
    <div className="min-h-screen bg-stone-200">

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="text-center mb-8">

          <div className="flex justify-center items-center gap-3 mb-4">

            <LogoIcon />

            <h1 className="text-3xl font-bold">
              Book Folding Pattern Generator
            </h1>

          </div>

        </div>

        <div className="grid xl:grid-cols-2 gap-8">

          <div className="space-y-6 bg-white p-6 rounded-xl shadow">

            <FileInput
              label="Upload Image"
              id="imageFile"
              file={input.imageFile}
              onFileChange={handleFileChange}
            />

            <NumberInput
              label="Book Page Height (cm)"
              name="bookHeight"
              value={input.bookHeight}
              onChange={handleInputChange}
            />

            <NumberInput
              label="Total Page Count"
              name="totalPages"
              value={input.totalPages}
              onChange={handleInputChange}
            />

            <NumberInput
              label="Top / Bottom Buffer (cm)"
              name="padding"
              value={input.padding}
              onChange={handleInputChange}
            />

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={useDepthMode}
                onChange={e => setUseDepthMode(e.target.checked)}
              />

              Include cut depth

            </label>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={generatePreview}
              disabled={isGenerating}
              className="w-full bg-amber-800 text-white py-3 rounded-lg"
            >

              {isGenerating ? 'Processing…' : 'Generate Preview'}

            </button>

          </div>

          <ResultsDisplay
            results={results}
            onGenerateInstructions={generateInstructions}
            useDepthMode={useDepthMode}
          />

        </div>

        {results && (

          <div className="mt-8 bg-white p-6 rounded-xl shadow">

            <PatternPreview
              pageMarks={results.pageMarks}
              bookHeight={results.bookHeight}
              totalPages={results.totalPages}
              padding={results.padding}
              useDepthMode={useDepthMode}
            />

          </div>

        )}

        <InstructionsPanel useDepthMode={useDepthMode} />

      </div>

    </div>
  );
}

export default App;
