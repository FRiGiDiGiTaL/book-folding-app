import React from 'react';
import { PageMark } from '../types';

interface PatternPreviewProps {
  pageMarks: PageMark[];
  bookHeight: number;
  totalPages: number;
  padding: number;
  useDepthMode: boolean;
}

export const PatternPreview: React.FC<PatternPreviewProps> = ({ pageMarks, bookHeight, totalPages, useDepthMode }) => {
  const sheets = totalPages / 2;

  // Use fixed pixel dimensions that will fill the container
  const previewWidth = 600; // Fixed width for consistent display
  const previewHeight = 400; // Fixed height for consistent display

  // Calculate color intensity based on cut depth or mode
  const getDepthColor = (depth: number): string => {
    if (!useDepthMode) {
      // Classic mode - simple black for cuts, light gray for no cuts
      return depth > 0 ? 'rgb(60, 60, 60)' : 'rgb(220, 220, 220)';
    }
    
    // Depth mode - gradient based on cut depth
    // Cut depth range: 3mm (light) to 40mm (dark)
    const minDepth = 3;
    const maxDepth = 40;
    const normalized = Math.max(0, Math.min(1, (depth - minDepth) / (maxDepth - minDepth)));
    
    // Create a color gradient from light gray (shallow cuts) to dark gray (deep cuts)
    const grayValue = Math.floor(220 - (normalized * 120)); // 220 to 100
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  };

  return (
    <div className="w-full bg-white p-4">
      <div className="w-full h-96"> {/* Fixed height container */}
        <svg 
          width="100%"
          height="100%"
          viewBox={`0 0 ${sheets} ${bookHeight}`} 
          preserveAspectRatio="none"
          aria-label={`Visual preview of ${useDepthMode ? 'depth-based' : 'classic'} book cutting pattern`}
          className="bg-stone-50 border border-stone-200 rounded w-full h-full"
        >
          {/* Book spine background - this represents the side view of the book */}
          <rect x="0" y="0" width={sheets} height={bookHeight} fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="0.02" />
          
          {/* Horizontal grid lines for height reference (these are correct - they show the vertical positions) */}
          {Array.from({ length: Math.floor(bookHeight / 2) + 1 }, (_, i) => i * 2).map(y => (
            <line
              key={`grid-h-${y}`}
              x1={0}
              y1={y}
              x2={sheets}
              y2={y}
              stroke="#e7e5e4"
              strokeWidth="0.01"
              opacity="0.3"
            />
          ))}
          
          {/* Vertical grid lines for sheet reference (these show the book thickness) */}
          {Array.from({ length: Math.floor(sheets / 10) + 1 }, (_, i) => i * 10).map(x => (
            <line
              key={`grid-v-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={bookHeight}
              stroke="#e7e5e4"
              strokeWidth="0.01"
              opacity="0.5"
            />
          ))}

          {pageMarks.map((page, index) => {
            const pageColor = getDepthColor(page.depth);
            
            return (
              <g key={page.pageRange}>
                {/* Background color based on page cut depth or mode */}
                <rect
                  x={index}
                  y={0}
                  width={1}
                  height={bookHeight}
                  fill={pageColor}
                  opacity={useDepthMode ? "0.4" : "0.2"}
                />
                
                {/* Cut regions - these represent the actual cuts into the page edge */}
                {page.marks.length > 0 && (() => {
                  const cutRegions = [];
                  for (let i = 0; i < page.marks.length; i += 2) {
                    if (page.marks[i + 1] !== undefined) {
                      cutRegions.push(
                        <rect
                          key={`${page.pageRange}-cut-${i}`}
                          x={index}
                          y={page.marks[i]}
                          width={1}
                          height={Math.max(0.1, page.marks[i + 1] - page.marks[i])}
                          fill={pageColor}
                          opacity={useDepthMode ? "0.8" : "1.0"}
                        />
                      );
                    }
                  }
                  return cutRegions;
                })()}
                
                {/* Page range label (show every 20th page for readability) */}
                {index % 20 === 0 && (
                  <text
                    x={index + 0.5}
                    y={bookHeight - 0.3}
                    fontSize={Math.max(0.3, bookHeight * 0.02)}
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
          
          {/* Legend - positioned at top right, content varies by mode */}
          <g transform={`translate(${Math.max(0, sheets - 12)}, 1)`}>
            <rect x="0" y="0" width="10" height={useDepthMode ? "6" : "4.5"} fill="white" stroke="#d6d3d1" strokeWidth="0.02" opacity="0.95" rx="0.2" />
            <text x="1" y="1" fontSize={Math.max(0.4, bookHeight * 0.02)} fill="#78716c" className="font-semibold">
              {useDepthMode ? 'Cut Depth' : 'Cut Areas'}
            </text>
            
            {useDepthMode ? (
              // Depth gradient bar for variable depth mode
              <>
                <defs>
                  <linearGradient id="cutDepthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(200,200,200)" />
                    <stop offset="50%" stopColor="rgb(130,130,130)" />
                    <stop offset="100%" stopColor="rgb(60,60,60)" />
                  </linearGradient>
                </defs>
                <rect x="1" y="2" width="8" height="0.8" fill="url(#cutDepthGradient)" />
                <text x="1" y="3.5" fontSize={Math.max(0.3, bookHeight * 0.015)} fill="#78716c">3mm</text>
                <text x="7" y="3.5" fontSize={Math.max(0.3, bookHeight * 0.015)} fill="#78716c">40mm</text>
                <text x="1" y="5" fontSize={Math.max(0.35, bookHeight * 0.018)} fill="#78716c">Light → Deep</text>
              </>
            ) : (
              // Simple legend for classic mode
              <>
                <rect x="1" y="2" width="3" height="0.6" fill="rgb(60,60,60)" />
                <text x="4.5" y="2.4" fontSize={Math.max(0.3, bookHeight * 0.015)} fill="#78716c">Cut areas</text>
                <rect x="1" y="3" width="3" height="0.6" fill="rgb(220,220,220)" />
                <text x="4.5" y="3.4" fontSize={Math.max(0.3, bookHeight * 0.015)} fill="#78716c">No cut</text>
              </>
            )}
          </g>
          
          {/* Orientation labels to make it clear */}
          <g>
            {/* Top label */}
            <text x={sheets/2} y="0.5" fontSize={Math.max(0.4, bookHeight * 0.025)} textAnchor="middle" fill="#78716c" className="font-semibold">
              Top of Pages
            </text>
            
            {/* Bottom label */}
            <text x={sheets/2} y={bookHeight - 0.2} fontSize={Math.max(0.4, bookHeight * 0.025)} textAnchor="middle" fill="#78716c" className="font-semibold">
              Bottom of Pages
            </text>
            
            {/* Left side label (rotated) */}
            <text x="0.2" y={bookHeight/2} fontSize={Math.max(0.3, bookHeight * 0.02)} textAnchor="middle" fill="#78716c" transform={`rotate(-90, 0.2, ${bookHeight/2})`}>
              Book Spine (Page 1)
            </text>
            
            {/* Right side label (rotated) */}
            <text x={sheets - 0.2} y={bookHeight/2} fontSize={Math.max(0.3, bookHeight * 0.02)} textAnchor="middle" fill="#78716c" transform={`rotate(-90, ${sheets - 0.2}, ${bookHeight/2})`}>
              Back Cover (Last Pages)
            </text>
          </g>
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-stone-600 space-y-1">
        <p><strong>Preview Guide (Side View of Book):</strong></p>
        <p>• <strong>Horizontal axis:</strong> Book thickness - each column = 2 pages (1 sheet to cut)</p>
        <p>• <strong>Vertical axis:</strong> Page height - shows where cuts will be made from top to bottom</p>
        {useDepthMode ? (
          <>
            <p>• <strong>Darker regions:</strong> Deeper cuts (up to 40.0mm into page edge)</p>
            <p>• <strong>Lighter regions:</strong> Shallow cuts (minimum 3.0mm into page edge)</p>
            <p>• Each page pair has ONE consistent cut depth throughout</p>
          </>
        ) : (
          <>
            <p>• <strong>Dark regions:</strong> Cut areas (20.0mm into page edge)</p>
            <p>• <strong>Light regions:</strong> No cut areas</p>
            <p>• All cuts use uniform 20.0mm depth</p>
          </>
        )}
        <p>• <strong>This is a side view:</strong> You're looking at the book from the side, seeing the pattern that will emerge</p>
        <p>• <strong>Cut direction:</strong> Cut straight into the page edge at the marked vertical positions</p>
      </div>
    </div>
  );
};
