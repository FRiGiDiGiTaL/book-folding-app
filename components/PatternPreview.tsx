
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

  // Render at half scale
  const previewWidth = sheets / 2;
  const previewHeight = bookHeight / 2;

  return (
    <div className="w-full overflow-x-auto">
        <svg 
            width={previewWidth}
            height={previewHeight}
            viewBox={`0 0 ${sheets} ${bookHeight}`} 
            aria-label="Visual preview of folded book pattern"
            className="bg-white"
        >
        {/* Book block background */}
        <rect x="0" y="0" width={sheets} height={bookHeight} fill="#e5e7eb" /> 

        {pageMarks.map((page, index) => {
            // Chunk marks into pairs [start, end]
            const markPairs: [number, number][] = [];
            for (let i = 0; i < page.marks.length; i += 2) {
                if (page.marks[i+1] !== undefined) {
                    markPairs.push([page.marks[i], page.marks[i+1]]);
                }
            }

            return (
            <g key={page.pageRange}>
                {markPairs.map((pair, pairIndex) => {
                    // For "Projected Fold", fold the first, third, fifth... tab (even indices)
                    if (pairIndex % 2 === 0) {
                        return (
                            <rect
                                key={`${page.pageRange}-${pairIndex}`}
                                x={index}
                                y={pair[0]}
                                width={1}
                                height={pair[1] - pair[0]}
                                fill="#9ca3af" // Darker gray for folded part
                            />
                        );
                    }
                    return null;
                })}
            </g>
            );
        })}
        </svg>
    </div>
  );
};
