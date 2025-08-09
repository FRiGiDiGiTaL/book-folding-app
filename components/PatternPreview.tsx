import React from 'react';
import { PageMark } from '../types';

interface PatternPreviewProps {
  pageMarks: PageMark[];
  bookHeight: number;
  totalPages: number;
  padding: number;
}

export const PatternPreview: React.FC<PatternPreviewProps> = ({ pageMarks, bookHeight, totalPages }) => {
  const sheets = totalPages / 2;

  // Render at manageable scale
  const previewWidth = Math.max(400, sheets);
  const previewHeight = Math.max(200, bookHeight * 8);

  // Calculate color intensity based on depth
  const getDepthColor = (depth: number): string => {
    // Depth range: 3mm (light) to 40mm (dark)
    const minDepth = 3;
    const maxDepth = 40;
    const normalized = Math.max(0, Math.min(1, (depth - minDepth) / (maxDepth - minDepth)));
    
    // Create a color gradient from light gray (shallow) to dark gray (deep)
    const grayValue = Math.floor(220 - (normalized * 120)); // 220 to 100
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  };

  // Get region color based on individual region depth
  const getRegionColor = (regionDepth: number): string => {
    const minDepth = 3;
    const maxDepth = 40;
    const normalized = Math.max(0, Math.min(1, (regionDepth - minDepth) / (maxDepth - minDepth)));
    
    // More dramatic color range for individual regions
    const grayValue = Math.floor(200 - (normalized * 140)); // 200 to 60
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  };

  return (
    <div className="w-full overflow-x-auto bg-white p-4">
      <div className="min-w-max">
        <svg 
          width={previewWidth}
          height={previewHeight}
          viewBox={`0 0 ${sheets} ${bookHeight}`} 
          aria-label="Visual preview of depth-based folded book pattern"
          className="bg-stone-50 border border-stone-200 rounded"
        >
          {/* Book block background */}
          <rect x="0" y="0" width={sheets} height={bookHeight} fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="0.1" />
          
          {/* Grid lines for reference */}
          {Array.from({ length: Math.floor(sheets / 10) + 1 }, (_, i) => i * 10).map(x => (
            <line
              key={`grid-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={bookHeight}
              stroke="#e7e5e4"
              strokeWidth="0.05"
              opacity="0.5"
            />
          ))}

          {pageMarks.map((page, index) => {
            const pageColor = getDepthColor(page.depth);
            
            return (
              <g key={page.pageRange}>
                {/* Background color based on overall page depth */}
                <rect
                  x={index}
                  y={0}
                  width={1}
                  height={bookHeight}
                  fill={pageColor}
                  opacity="0.3"
                />
                
                {/* Individual fold regions with their specific depths */}
                {page.regions && page.regions.map((region, regionIndex) => (
                  <rect
                    key={`${page.pageRange}-region-${regionIndex}`}
                    x={index}
                    y={region.start}
                    width={1}
                    height={Math.max(0.1, region.end - region.start)}
                    fill={getRegionColor(region.depth)}
                    opacity="0.8"
                  />
                ))}
                
                {/* Fallback for pages without detailed regions */}
                {(!page.regions || page.regions.length === 0) && page.marks.length > 0 && (
                  <>
                    {(() => {
                      const regions = [];
                      for (let i = 0; i < page.marks.length; i += 2) {
                        if (page.marks[i + 1] !== undefined) {
                          regions.push(
                            <rect
                              key={`${page.pageRange}-mark-${i}`}
                              x={index}
                              y={page.marks[i]}
                              width={1}
                              height={Math.max(0.1, page.marks[i + 1] - page.marks[i])}
                              fill={pageColor}
                              opacity="0.7"
                            />
                          );
                        }
                      }
                      return regions;
                    })()}
                  </>
                )}
                
                {/* Page range label (show every 10th page for readability) */}
                {index % 10 === 0 && (
                  <text
                    x={index + 0.5}
                    y={bookHeight - 0.5}
                    fontSize="0.8"
                    textAnchor="middle"
                    fill="#78716c"
                    className="select-none"
                  >
                    {page.pageRange.split('-')[0]}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Depth legend */}
          <g transform={`translate(${sheets - 15}, 2)`}>
            <rect x="0" y="0" width="12" height="8" fill="white" stroke="#d6d3d1" strokeWidth="0.1" opacity="0.9" rx="0.5" />
            <text x="1" y="1.5" fontSize="0.7" fill="#78716c" className="font-semibold">Depth Guide</text>
            
            {/* Depth gradient bar */}
            <defs>
              <linearGradient id="depthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(200,200,200)" />
                <stop offset="50%" stopColor="rgb(130,130,130)" />
                <stop offset="100%" stopColor="rgb(60,60,60)" />
              </linearGradient>
            </defs>
            <rect x="1" y="2.5" width="10" height="1" fill="url(#depthGradient)" />
            <text x="1" y="4.5" fontSize="0.5" fill="#78716c">3mm</text>
            <text x="8.5" y="4.5" fontSize="0.5" fill="#78716c">40mm</text>
            <text x="1" y="6" fontSize="0.6" fill="#78716c">Light → Deep</text>
          </g>
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-stone-600 space-y-1">
        <p><strong>Preview Guide:</strong></p>
        <p>• Each column represents 2 pages (1 sheet)</p>
        <p>• Darker regions = deeper folds (up to 40mm)</p>
        <p>• Lighter regions = shallow folds (minimum 3mm)</p>
        <p>• Gray background shows overall page depth</p>
      </div>
    </div>
  );
};
