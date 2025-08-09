import React, { useCallback } from 'react';
import { PatternResult } from '../types';
import { DownloadIcon, ClipboardIcon, GenerateIcon } from './Icons';

interface ResultsDisplayProps {
  results: PatternResult | null;
  onGenerateInstructions: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onGenerateInstructions }) => {

  const downloadTxtFile = useCallback(() => {
    if (!results || !results.pattern) return;
    const element = document.createElement("a");
    const file = new Blob([results.pattern], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const baseFilename = results.filename.substring(0, results.filename.lastIndexOf('.')) || results.filename;
    element.download = `${baseFilename}-depth-pattern.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [results]);

  const copyToClipboard = useCallback(() => {
    if (!results || !results.pattern) return;
    navigator.clipboard.writeText(results.pattern).then(() => {
        // Could show a temporary success message
        console.log('Pattern copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }, [results]);

  if (!results) {
    return (
      <div className="h-full bg-orange-50 p-6 rounded-xl shadow-md border border-orange-200 flex flex-col items-center justify-center text-center">
        <div className="bg-stone-100 p-5 rounded-full mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082a.75.75 0 01.75.75v5.714c0 .414-.336.75-.75.75H4.5a.75.75 0 01-.75-.75V4.5a.75.75 0 01.75-.75h5.25z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6-6m0 0l-6 6m6-6v12a6 6 0 01-12 0v-3" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-stone-700">Your depth pattern will appear here</h3>
        <p className="text-stone-500 mt-1">Fill in the details on the left and click "Generate Preview".</p>
      </div>
    );
  }

  const getDepthStats = () => {
    if (!results.pageMarks.length) return null;
    
    const depths = results.pageMarks.map(p => p.depth);
    const minDepth = Math.min(...depths);
    const maxDepth = Math.max(...depths);
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    
    return { min: minDepth, max: maxDepth, avg: Math.round(avgDepth * 10) / 10 };
  };

  const depthStats = getDepthStats();

  return (
    <div className="bg-orange-50 p-6 rounded-xl shadow-md border border-orange-200 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-700 mb-2">2. Processed Image & Depth Analysis</h2>
        <p className="text-sm text-stone-500 mb-3">
          Grayscale conversion with depth mapping. Dark areas = deep folds, light areas = shallow folds.
        </p>
        <div className="bg-stone-100 p-2 rounded-lg border">
          <img 
            src={results.processedImage} 
            alt="Processed grayscale pattern" 
            className="w-full h-auto object-contain rounded max-h-48" 
            style={{ imageRendering: 'pixelated' }} 
          />
        </div>
        
        {/* Depth Statistics */}
        {depthStats && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Depth Analysis</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Min Depth:</span>
                <br />
                <span className="text-blue-800 font-semibold">{depthStats.min}mm</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Max Depth:</span>
                <br />
                <span className="text-blue-800 font-semibold">{depthStats.max}mm</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Avg Depth:</span>
                <br />
                <span className="text-blue-800 font-semibold">{depthStats.avg}mm</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div>
        {results.pattern ? (
           <>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-xl font-semibold text-stone-700">3. Depth-Based Cutting Instructions</h2>
                <p className="text-sm text-stone-500">Positions in cm, depths in mm. Follow the depth guidelines for best results.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 transition-colors"
                    title="Copy to Clipboard"
                >
                    <ClipboardIcon />
                </button>
                <button
                    onClick={downloadTxtFile}
                    className="flex items-center gap-2 bg-stone-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition-all duration-200"
                >
                    <DownloadIcon />
                    Download Pattern
                </button>
              </div>
            </div>
            
            <textarea
              readOnly
              value={results.pattern}
              className="w-full h-96 bg-stone-100 border border-orange-300 rounded-md font-mono text-sm p-4 focus:ring-amber-500 focus:border-amber-500"
              aria-label="Generated depth-based cutting instructions"
            />
            
            {/* Quick reference guide */}
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Quick Reference</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-amber-700 font-medium">Light Folds:</span>
                  <br />
                  <span className="text-amber-800">3-15mm depth</span>
                </div>
                <div>
                  <span className="text-amber-700 font-medium">Medium Folds:</span>
                  <br />
                  <span className="text-amber-800">16-30mm depth</span>
                </div>
                <div>
                  <span className="text-amber-700 font-medium">Deep Folds:</span>
                  <br />
                  <span className="text-amber-800">31-40mm depth</span>
                </div>
              </div>
            </div>
          </>
        ) : (
           <div className="border-t border-orange-200 pt-6 text-center">
            <h2 className="text-xl font-semibold text-stone-700 mb-2">3. Generate Depth Instructions</h2>
            <p className="text-sm text-stone-500 mb-4">
              Ready to create your advanced depth-based folding pattern? 
              This will generate precise instructions with variable fold depths.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <div className="flex items-start gap-3">
                <div className="text-green-600 text-2xl">✨</div>
                <div className="text-left">
                  <h4 className="font-semibold text-green-800 mb-1">Advanced Features Include:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Variable depth measurements (3-40mm range)</li>
                    <li>• Precise fold position coordinates</li>
                    <li>• Optimized for realistic shadows and gradients</li>
                    <li>• Compatible with all image types</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
                onClick={onGenerateInstructions}
                className="w-full sm:w-auto flex items-center justify-center gap-2 mx-auto bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-200"
            >
                <GenerateIcon />
                Generate Advanced Instructions
            </button>
           </div>
        )}
      </div>
    </div>
  );
};
