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

  // Render at manageable scale - now correctly oriented vertically like a book
  const previewWidth = Math.max(300, sheets * 8); // Width represents the number of sheets
  const previewHeight = Math.max(400, bookHeight * 20); // Height represents book page height

  // Calculate color intensity based on cut depth
  const getDepthColor = (depth: number): string => {
    // Cut depth range: 3mm (light) to 40mm (dark)
    const minDepth = 3;
    const maxDepth = 40;
    const normalized = Math.max(0, Math.min(1, (depth - minDepth) / (maxDepth - minDepth)));
    
    // Create a color gradient from light gray (shallow cuts) to dark gray (deep cuts)
    const grayValue = Math.floor(220 - (normalized * 120)); // 220 to 100
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  };

  return (
    <div className="w-full overflow-x-auto bg-white p-4">
      <div className="min-w-max">
        <svg 
          width={previewWidth}
          height={previewHeight}
          viewBox={`0 0 ${sheets} ${bookHeight}`} 
          aria-label="Visual preview of depth-based book cutting pattern"
          className="bg-stone-50 border border-stone-200 rounded"
        >
          {/* Book block background */}
          <rect x="0" y="0" width={sheets} height={bookHeight} fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="0.02" />
          
          {/* Horizontal grid lines for height reference */}
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
          
          {/* Vertical grid lines for sheet reference */}
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
                {/* Background color based on page cut depth */}
                <rect
                  x={index}
                  y={0}
                  width={1}
                  height={bookHeight}
                  fill={pageColor}
                  opacity="0.4"
                />
                
                {/* Cut regions - all cuts on this page use the same depth */}
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
                          opacity="0.8"
                        />
                      );
                    }
                  }
                  return cutRegions;
                })()}
                
                {/* Page range label (show every 20th page for readability in vertical layout) */}
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
          
          {/* Cut depth legend - positioned at top right */}
          <g transform={`translate(${Math.max(0, sheets - 12)}, 1)`}>
            <rect x="0" y="0" width="10" height="6" fill="white" stroke="#d6d3d1" strokeWidth="0.02" opacity="0.95" rx="0.2" />
            <text x="1" y="1" fontSize={Math.max(0.4, bookHeight * 0.02)} fill="#78716c" className="font-semibold">Cut Depth</text>
            
            {/* Depth gradient bar */}
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
          </g>
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-stone-600 space-y-1">
        <p><strong>Preview Guide:</strong></p>
        <p>• Each column represents 2 pages (1 sheet to cut)</p>
        <p>• Darker regions = deeper cuts (up to 40mm into page edge)</p>
        <p>• Lighter regions = shallow cuts (minimum 3mm into page edge)</p>
        <p>• Each page pair has ONE consistent cut depth</p>
        <p>• Cut straight into the page edge at marked positions</p>
      </div>
    </div>
  );
};
