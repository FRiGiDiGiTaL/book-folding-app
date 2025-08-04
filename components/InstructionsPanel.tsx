
import React from 'react';

const Step: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex gap-4 sm:gap-6">
    <div className="text-2xl pt-1 select-none">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      <div className="text-stone-600 space-y-2 mt-1">{children}</div>
    </div>
  </div>
);

export const InstructionsPanel: React.FC = () => {
  const examplePattern = `PAGE : MEASUREMENTS
1-2        5.7, 6.1
3-4        5.1, 6.8
5-6        4.7, 7.1`;

  return (
    <div className="bg-orange-50 p-6 sm:p-8 rounded-xl shadow-md border border-orange-200">
      <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">How to Create Your Pattern</h2>
      <div className="space-y-6">
        <Step icon="✂️" title="Step 1: Upload Your Design">
          <p>Upload a high-contrast black and white image (JPG or PNG recommended). Simple shapes, silhouettes, or bold words work best.</p>
          <p className="text-sm text-stone-500 pt-1">This 'Measure, Mark, and Cut' (MMC) method is the only one that allows for creating complex, high-detail images like portraits. For best results, use a high-resolution, black and white image.</p>
        </Step>

        <Step icon="📐" title="Step 2: Enter Your Book Info">
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="font-semibold">Book Page Height (in CM)</strong> — measure a page from top to bottom.</li>
            <li><strong className="font-semibold">Total Page Count</strong> — must be an even number. (Every folded sheet = 2 pages)</li>
          </ul>
          <p className="text-sm text-stone-500 pl-5 pt-1">
            <span className="font-semibold">🔎 If your book has 250 numbered pages, enter 250</span> — not the sheet count.
          </p>
        </Step>

        <Step icon="🎨" title="Step 3: (Optional) Set Padding">
          <p>Padding is the vertical margin at the top and bottom of each page that will remain uncut.</p>
        </Step>

        <Step icon="🧾" title="Step 4: Generate Your Pattern & Payment">
           <p>
            First, click the <strong className="font-semibold">“Generate Preview”</strong> button. This analyzes your image and shows you a preview of how it will be processed to fit your book's dimensions.
          </p>
          <p>
            When you're happy with the preview image, click the <strong className="font-semibold">“Generate Cutting Instructions”</strong> button where you can make payment. Payment is only $1.00. This will create the final list of precise cut marks, which can be downloaded as a TXT file. The list will look like this:
          </p>
          <pre className="bg-stone-100 p-3 rounded-md text-sm text-stone-800 font-mono overflow-x-auto mt-2">
            {examplePattern}
          </pre>
        </Step>

        <Step icon="🌀" title="Step 5: Choose Your Folding Style">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-stone-700">▶️ Projected Fold (Pop-Out Effect)</h4>
              <p>Fold the first tab inward and then every other tab. Do this for the entire book. Your design will appear to rise outward from the book’s surface, like embossed lettering or 3D sculpture.</p>
            </div>
            <div>
              <h4 className="font-semibold text-stone-700">🔽 Recessed Fold (Cut-In Effect)</h4>
              <p>Fold the second tab down first then every other tab for the entire book. Your design will appear indented or carved into the book block.</p>
            </div>
          </div>
        </Step>
      </div>
    </div>
  );
};
