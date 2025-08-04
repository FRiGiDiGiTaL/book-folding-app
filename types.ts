
export interface PatternInput {
  imageFile: File | null;
  bookHeight: string;
  totalPages: string;
  padding: string;
}

export interface PageMark {
  pageRange: string;
  marks: number[];
}

export interface PatternResult {
  pattern?: string;
  processedImage: string;
  filename: string;
  pageMarks: PageMark[];
  bookHeight: number;
  totalPages: number;
  padding: number;
}
