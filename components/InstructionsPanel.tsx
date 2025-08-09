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
  const examplePattern = `PAGE RANGE   FOLD POSITIONS & DEPTHS              AVG DEPTH
======================================================================
1-2          5.7→6.1cm(38.2mm), 8.3→9.5cm(25.1mm)     31.5mm
3-4          4.2→7.8cm(35.7mm)                        28.9mm
5-6          No folds needed                          8.2mm`;

  return (
    <div className="bg-orange-50 p-6 sm:p-8 rounded-xl shadow-md border border-orange-200">
      <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">Advanced Depth-Based Book Folding</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">🆕 New Feature: Variable Depth Folding</h3>
        <p className="text-blue-700 text-sm">
          This advanced system creates realistic shadows and gradients by varying fold depths from 3mm (light areas) 
          to 40mm (dark areas). Perfect for portraits, landscapes, and complex imagery with subtle detail.
        </p>
      </div>
      
      <div className="space-y-6">
        <Step icon="🎨" title="Step 1: Upload Your Design">
          <p>Upload any image - color photos, grayscale images, or black and white designs all work. 
             The system automatically converts to grayscale and calculates optimal fold depths.</p>
          <p className="text-sm text-stone-500 pt-1">
            <strong>Best results:</strong> High-contrast images with clear light and dark areas. 
            Portraits, landscapes, and detailed artwork work excellently with the depth system.
          </p>
        </Step>

        <Step icon="📐" title="Step 2: Enter Your Book Specifications">
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="font-semibold">Book Page Height (in CM)</strong> — measure a single page from top to bottom.</li>
            <li><strong className="font-semibold">Total Page Count</strong> — must be even (every folded sheet = 2 pages).</li>
            <li><strong className="font-semibold">Padding</strong> — unfolded margin at top and bottom of each page.</li>
          </ul>
          <p className="text-sm text-stone-500 pl-5 pt-1">
            <span className="font-semibold">💡 Tip:</span> For depth-based folding, books with 200+ pages work best 
            as they provide more material for the varying fold depths.
          </p>
        </Step>

        <Step icon="🎯" title="Step 3: Preview & Generate">
          <p>Click <strong>"Generate Preview"</strong> to see how your image will be processed. 
             The preview shows depth variations with darker areas indicating deeper folds.</p>
          <p>When satisfied, click <strong>"Generate Depth-Based Instructions"</strong> for the complete pattern.</p>
        </Step>

        <Step icon="📋" title="Step 4: Understanding Your Pattern">
          <p>Your generated instructions include precise measurements and depth information:</p>
          <pre className="bg-stone-100 p-3 rounded-md text-sm text-stone-800 font-mono overflow-x-auto mt-2">
            {examplePattern}
          </pre>
          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
            <li><strong>Positions:</strong> Start→End measurements in cm from page top</li>
            <li><strong>Depths:</strong> How deep to fold each region (in mm)</li>
            <li><strong>Average Depth:</strong> Overall fold depth for that page pair</li>
          </ul>
        </Step>

        <Step icon="✂️" title="Step 5: Creating Your Depth Folds">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-stone-700">📏 Measuring & Marking</h4>
              <p>Use the position measurements to mark fold lines on each page. 
                 Mark lightly with pencil on the page edges.</p>
            </div>
            <div>
              <h4 className="font-semibold text-stone-700">🎚️ Variable Depth Folding</h4>
              <p>Unlike traditional folding, adjust your fold depth based on the mm measurements:</p>
              <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                <li><strong>Light folds (3-15mm):</strong> Gentle creases, barely visible</li>
                <li><strong>Medium folds (16-30mm):</strong> Standard book folding depth</li>
                <li><strong>Deep folds (31-40mm):</strong> Dramatic creases for dark areas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-stone-700">🌟 Folding Direction</h4>
              <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                <li><strong>Projected Effect:</strong> Fold toward the spine - design appears raised</li>
                <li><strong>Recessed Effect:</strong> Fold away from spine - design appears carved in</li>
              </ul>
            </div>
          </div>
        </Step>

        <Step icon="💡" title="Step 6: Pro Tips for Best Results">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Consistent pressure:</strong> Use a bone folder for even, precise folds</li>
              <li><strong>Depth gauge:</strong> Create a simple cardboard template to check fold depths</li>
              <li><strong>Work systematically:</strong> Complete all folds for one page pair before moving on</li>
              <li><strong>Patience pays:</strong> Deep fold patterns take time but create stunning results</li>
              <li><strong>Book choice:</strong> Thicker books (400+ pages) allow for more dramatic depth variation</li>
            </ul>
          </div>
        </Step>
      </div>
    </div>
  );
};
