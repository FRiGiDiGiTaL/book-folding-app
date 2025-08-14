import React, { useCallback } from 'react';
import { PatternResult } from '../types';
import { DownloadIcon, ClipboardIcon, GenerateIcon } from './Icons';

interface ResultsDisplayProps {
  results: PatternResult | null;
  onGenerateInstructions: () => void;
  useDepthMode: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onGenerateInstructions, useDepthMode }) => {

  const downloadTxtFile = useCallback(() => {
    if (!results || !results.pattern) return;
    const element = document.createElement("a");
    const file = new Blob([results.pattern], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const baseFilename = results.filename.substring(0, results.filename.lastIndexOf('.')) || results.filename;
    const modePrefix = useDepthMode ? 'depth-based' : 'classic';
    element.download = `${baseFilename}-${modePrefix}-cutting-pattern.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [results, useDepthMode]);

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
        <h3 className="text-xl font-semibold text-stone-700">Your cutting pattern will appear here</h3>
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
        <h2 className="text-xl font-semibold text-stone-700 mb-2">
          2. Processed Image {useDepthMode ? '& Cut Depth Analysis' : '(Black & White)'}
        </h2>
        <p className="text-sm text-stone-500 mb-3">
          {useDepthMode 
            ? 'Grayscale conversion with cut depth mapping. Dark areas = deep cuts, light areas = shallow cuts.'
            : 'Black & white conversion with threshold. Only black areas will be cut at uniform 20mm depth.'
          }
        </p>
        <div className="bg-stone-100 p-2 rounded-lg border">
          <img 
            src={results.processedImage} 
            alt={useDepthMode ? "Processed grayscale pattern" : "Processed black and white pattern"}
            className="w-full h-auto object-contain rounded max-h-48" 
            style={{ imageRendering: 'pixelated' }} 
          />
        </div>
        
        {/* Depth Statistics - only show in depth mode */}
        {useDepthMode && depthStats && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Cut Depth Analysis</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Min Cut Depth:</span>
                <br />
                <span className="text-blue-800 font-semibold">{depthStats.min.toFixed(1)}mm</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Max Cut Depth:</span>
                <br />
                <span className="text-blue-800 font-semibold">{depthStats.max.toFixed(1)}mm</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Avg Cut Depth:</span>
                <br />
                <span className="text-blue-800 font-semibold">{depthStats.avg}mm</span>
              </div>
            </div>
          </div>
        )}

        {/* Classic mode info */}
        {!useDepthMode && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Classic Mode Settings</h4>
            <div className="text-sm text-green-700">
              <p><strong>Cut Depth:</strong> Uniform 20.0mm for all cuts</p>
              <p><strong>Cut Areas:</strong> Only pure black regions in processed image</p>
              <p><strong>Threshold:</strong> Pixels above 50% brightness become white (no cut)</p>
            </div>
          </div>
        )}
      </div>
      
      <div>
        {results.pattern ? (
           <>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-xl font-semibold text-stone-700">
                  3. {useDepthMode ? 'Depth-Based' : 'Classic'} Cutting Instructions
                </h2>
                <p className="text-sm text-stone-500">
                  {useDepthMode 
                    ? 'Cut positions as individual points in cm. Cut depth in mm (one per page pair).'
                    : 'Cut positions as individual points in cm. Uniform 20.0mm depth for all cuts.'
                  }
                </p>
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
              aria-label={`Generated ${useDepthMode ? 'depth-based' : 'classic'} cutting instructions`}
            />
            
            {/* Quick reference guide */}
            <div className={`mt-4 p-3 rounded-lg border ${useDepthMode ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${useDepthMode ? 'text-amber-800' : 'text-green-800'}`}>
                Quick Reference
              </h4>
              
              {useDepthMode ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-amber-700 font-medium">Light Cuts:</span>
                      <br />
                      <span className="text-amber-800">3.0-15.0mm depth</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">Medium Cuts:</span>
                      <br />
                      <span className="text-amber-800">16.0-30.0mm depth</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">Deep Cuts:</span>
                      <br />
                      <span className="text-amber-800">31.0-40.0mm depth</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-amber-700">
                    <strong>Remember:</strong> Cut straight into page edge. Each page pair uses ONE consistent depth. Cut between pairs of positions.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-green-700">
                    <p><strong>Cut Depth:</strong> Always 20.0mm into page edge</p>
                    <p><strong>Cut Method:</strong> Cut between pairs of positions (e.g., 5.7 to 6.1, then 8.3 to 9.5)</p>
                    <p><strong>Cut Areas:</strong> Only where black regions appear</p>
                  </div>
                  <div className="mt-2 text-xs text-green-700">
                    <strong>Remember:</strong> Simple and consistent - all cuts are 20.0mm deep.
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
           <div className="border-t border-orange-200 pt-6 text-center">
            <h2 className="text-xl font-semibold text-stone-700 mb-2">3. Generate Cutting Instructions</h2>
            <p className="text-sm text-stone-500 mb-4">
              {useDepthMode 
                ? 'Ready to create your advanced depth-based cutting pattern? This will generate precise instructions with variable cut depths.'
                : 'Ready to create your classic cutting pattern? This will generate simple instructions with uniform 20.0mm cut depth.'
              }
            </p>
            
            <div className={`${useDepthMode ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} p-4 rounded-lg border mb-4`}>
              <div className="flex items-start gap-3">
                <div className={`${useDepthMode ? 'text-green-600' : 'text-blue-600'} text-2xl`}>
                  {useDepthMode ? '✨' : '🎯'}
                </div>
                <div className="text-left">
                  <h4 className={`font-semibold mb-1 ${useDepthMode ? 'text-green-800' : 'text-blue-800'}`}>
                    {useDepthMode ? 'Advanced Features Include:' : 'Classic Features Include:'}
                  </h4>
                  <ul className={`text-sm space-y-1 ${useDepthMode ? 'text-green-700' : 'text-blue-700'}`}>
                    {useDepthMode ? (
                      <>
                        <li>• Variable cut depth measurements (3.0-40.0mm range)</li>
                        <li>• Precise cut position coordinates as individual points</li>
                        <li>• One consistent depth per page pair</li>
                        <li>• Optimized for realistic shadows and gradients</li>
                        <li>• Compatible with all image types</li>
                      </>
                    ) : (
                      <>
                        <li>• Simple uniform 20.0mm cut depth</li>
                        <li>• Clear black & white processing</li>
                        <li>• Easy-to-follow instructions with individual cut points</li>
                        <li>• Perfect for high-contrast designs</li>
                        <li>• Consistent results every time</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            <button
                onClick={onGenerateInstructions}
                className="w-full sm:w-auto flex items-center justify-center gap-2 mx-auto bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-200"
            >
                <GenerateIcon />
                {useDepthMode ? 'Generate Advanced Instructions' : 'Generate Classic Instructions'}
            </button>
           </div>
        )}
      </div>
    </div>
  );
};
