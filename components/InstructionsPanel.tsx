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
  const examplePattern = `PAGE RANGE   CUT POSITIONS (from top of page)        CUT DEPTH
======================================================================
1-2          5.7→6.1cm, 8.3→9.5cm                     31.5mm
3-4          4.2→7.8cm                                28.9mm
5-6          No cuts needed                           8.2mm`;

  return (
    <div className="bg-orange-50 p-6 sm:p-8 rounded-xl shadow-md border border-orange-200">
      <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">Advanced Depth-Based Book Cutting Art</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">🆕 New Feature: Variable Cut Depth</h3>
        <p className="text-blue-700 text-sm">
          This advanced system creates realistic shadows and gradients by varying cut depths from 3mm (light areas) 
          to 40mm (dark areas). Each page pair gets ONE consistent cut depth based on the image brightness. 
          Perfect for portraits, landscapes, and complex imagery with subtle detail.
        </p>
      </div>
      
      <div className="space-y-6">
        <Step icon="🎨" title="Step 1: Upload Your Design">
          <p>Upload any image - color photos, grayscale images, or black and white designs all work. 
             The system automatically converts to grayscale and calculates optimal cut depths.</p>
          <p className="text-sm text-stone-500 pt-1">
            <strong>Best results:</strong> High-contrast images with clear light and dark areas. 
            Portraits, landscapes, and detailed artwork work excellently with the depth system.
          </p>
        </Step>

        <Step icon="📐" title="Step 2: Enter Your Book Specifications">
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="font-semibold">Book Page Height (in CM)</strong> — measure a single page from top to bottom.</li>
            <li><strong className="font-semibold">Total Page Count</strong> — must be even (every cut sheet = 2 pages).</li>
            <li><strong className="font-semibold">Padding</strong> — uncut margin at top and bottom of each page.</li>
          </ul>
          <p className="text-sm text-stone-500 pl-5 pt-1">
            <span className="font-semibold">💡 Tip:</span> For depth-based cutting, books with 200+ pages work best 
            as they provide more material for the varying cut depths.
          </p>
        </Step>

        <Step icon="🎯" title="Step 3: Preview & Generate">
          <p>Click <strong>"Generate Preview"</strong> to see how your image will be processed. 
             The preview shows depth variations with darker areas indicating deeper cuts.</p>
          <p>When satisfied, click <strong>"Generate Depth-Based Instructions"</strong> for the complete cutting pattern.</p>
        </Step>

        <Step icon="📋" title="Step 4: Understanding Your Cutting Pattern">
          <p>Your generated instructions include precise measurements and cut depth information:</p>
          <pre className="bg-stone-100 p-3 rounded-md text-sm text-stone-800 font-mono overflow-x-auto mt-2">
            {examplePattern}
          </pre>
          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
            <li><strong>Cut Positions:</strong> Start→End measurements in cm from page top</li>
            <li><strong>Cut Depth:</strong> How deep to cut into the page edge (consistent per page pair)</li>
            <li><strong>Single Depth:</strong> Each page pair has ONE cut depth throughout</li>
          </ul>
        </Step>

        <Step icon="✂️" title="Step 5: Creating Your Cuts">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-stone-700">📏 Measuring & Marking</h4>
              <p>Use the position measurements to mark cut lines on the page edges. 
                 Mark lightly with pencil where you'll make your cuts.</p>
            </div>
            <div>
              <h4 className="font-semibold text-stone-700">🔪 Making the Cuts</h4>
              <p>Cut straight into the page edge at the specified depth for each page pair:</p>
              <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                <li><strong>Light cuts (3-15mm):</strong> Shallow cuts into page edge</li>
                <li><strong>Medium cuts (16-30mm):</strong> Standard depth cuts</li>
                <li><strong>Deep cuts (31-40mm):</strong> Maximum depth for dark image areas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-stone-700">🎯 Cut Direction & Technique</h4>
              <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                <li><strong>Cut from page edge:</strong> Cut straight into the page from the outer edge</li>
                <li><strong>Consistent depth:</strong> All cuts on a page pair use the SAME depth</li>
                <li><strong>Clean cuts:</strong> Use sharp craft knife and metal ruler</li>
                <li><strong>Cut through both pages:</strong> Cut the entire 2-page sheet at once</li>
              </ul>
            </div>
          </div>
        </Step>

        <Step icon="💡" title="Step 6: Pro Tips for Best Results">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Sharp blade:</strong> Use a fresh craft knife blade for clean cuts</li>
              <li><strong>Metal ruler:</strong> Essential for straight, accurate cuts</li>
              <li><strong>Cutting mat:</strong> Protect your work surface and get cleaner cuts</li>
              <li><strong>Consistent pressure:</strong> Apply steady pressure for even cut depth</li>
              <li><strong>Work systematically:</strong> Complete all cuts for one page pair before moving on</li>
              <li><strong>Book choice:</strong> Thicker books (400+ pages) allow for more dramatic depth variation</li>
              <li><strong>Test cuts:</strong> Practice on scrap pages first to get the technique right</li>
            </ul>
          </div>
        </Step>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Important Safety Notes</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            <li>Always cut away from your body</li>
            <li>Keep fingers clear of the cutting line</li>
            <li>Use a cutting mat to protect surfaces</li>
            <li>Take breaks to avoid fatigue and maintain accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
