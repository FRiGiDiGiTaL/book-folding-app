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
