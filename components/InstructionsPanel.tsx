import React from 'react';

interface InstructionsPanelProps {
  useDepthMode: boolean;
}

const Step: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex gap-4 sm:gap-6">
    <div className="text-2xl pt-1 select-none">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      <div className="text-stone-600 space-y-2 mt-1">{children}</div>
    </div>
  </div>
);

export const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ useDepthMode }) => {
  const depthExamplePattern = `CUT DEPTH   PAGE RANGE   CUT POSITIONS (from top of page)
=======================================================================
Mode: Variable Depth
31.5mm      1-2          5.7, 6.1, 8.3, 9.5
28.9mm      3-4          4.2, 7.8
8.2mm       5-6          No cuts needed`;

  const classicExamplePattern = `PAGE RANGE   CUT POSITIONS (from top of page)
================================================
Mode: Uniform Depth (20mm)
1-2          5.7, 6.1, 8.3, 9.5
3-4          4.2, 7.8
5-6          No cuts needed`;

  return (
    <div className="bg-orange-50 p-6 sm:p-8 rounded-xl shadow-md border border-orange-200">
      <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">
        {useDepthMode ? 'Advanced Depth-Based' : 'Classic'} Book Cutting Art
      </h2>
      
      {useDepthMode ? (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">✨ Advanced Feature: Variable Cut Depth</h3>
          <p className="text-blue-700 text-sm">
            This advanced system creates realistic shadows and gradients by varying cut depths from 3mm (light areas) 
            to 40mm (dark areas). Each page pair gets ONE consistent cut depth based on the image brightness. 
            Perfect for portraits, landscapes, and complex imagery with subtle detail.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">🎯 Classic Feature: Uniform Cut Depth</h3>
          <p className="text-green-700 text-sm">
            This classic system uses a simple black & white approach with uniform 20mm cut depth for all cuts. 
            Perfect for high-contrast designs, text, logos, and simple graphics. Easy to follow and consistent results.
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        <Step icon="🎨" title="Step 1: Upload Your Design">
          {useDepthMode ? (
            <>
              <p>Upload any image - color photos, grayscale images, or black and white designs all work. 
                 The system automatically converts to grayscale and calculates optimal cut depths.</p>
              <p className="text-sm text-stone-500 pt-1">
                <strong>Best results:</strong> High-contrast images with clear light and dark areas. 
                Portraits, landscapes, and detailed artwork work excellently with the depth system.
              </p>
            </>
          ) : (
            <>
              <p>Upload any image - it will be converted to pure black and white for cutting. 
                 The system applies a threshold to determine cut vs. no-cut areas.</p>
              <p className="text-sm text-stone-500 pt-1">
                <strong>Best results:</strong> High-contrast images, text, logos, and simple graphics. 
                Images with clear separation between light and dark areas work best.
              </p>
            </>
          )}
        </Step>

        <Step icon="📐" title="Step 2: Enter Your Book Specifications">
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="font-semibold">Book Page Height (in CM)</strong> — measure a single page from top to bottom.</li>
            <li><strong className="font-semibold">Total Page Count</strong> — must be even (every cut sheet = 2 pages).</li>
            <li><strong className="font-semibold">Padding</strong> — uncut margin at top and bottom of each page.</li>
          </ul>
          <p className="text-sm text-stone-500 pl-5 pt-1">
            <span className="font-semibold">💡 Tip:</span> {useDepthMode 
              ? 'For depth-based cutting, books with 200+ pages work best as they provide more material for the varying cut depths.'
              : 'For classic cutting, any book thickness works well. Thinner books (100-300 pages) are often easier to work with.'
            }
          </p>
        </Step>

        <Step icon="🎯" title="Step 3: Choose Your Mode & Generate">
          <p>Select between <strong>Variable Depth Mode</strong> (advanced) or <strong>Classic Mode</strong> (uniform depth):</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800">Variable Depth Mode</h4>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• 3-40mm depth range</li>
                <li>• Realistic gradients</li>
                <li>• Best for photos</li>
                <li>• More complex cutting</li>
              </ul>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800">Classic Mode</h4>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                <li>• Uniform 20mm depth</li>
                <li>• Simple black & white</li>
                <li>• Best for graphics</li>
                <li>• Easy to follow</li>
              </ul>
            </div>
          </div>
          <p className="mt-2">Click <strong>"Generate Preview"</strong> to see the processed image, then <strong>"Generate Instructions"</strong> for the cutting pattern.</p>
        </Step>

        <Step icon="📋" title="Step 4: Understanding Your Cutting Pattern">
          <p>Your generated instructions include precise measurements and cut information:</p>
          <pre className="bg-stone-100 p-3 rounded-md text-sm text-stone-800 font-mono overflow-x-auto mt-2">
            {useDepthMode ? depthExamplePattern : classicExamplePattern}
          </pre>
          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
            <li><strong>Cut Positions:</strong> Individual measurements in cm from page top (start and end positions)</li>
            <li><strong>Cut Depth:</strong> {useDepthMode 
              ? 'How deep to cut into the page edge (varies per page pair from 3.0mm to 40.0mm)'
              : 'Always 20mm deep into the page edge (uniform for all cuts)'
            }</li>
            {useDepthMode && <li><strong>Variable Depth:</strong> Each page pair has ONE cut depth throughout - all cuts on that pair use the same depth</li>}
          </ul>
        </Step>

        <Step icon="✂️" title="Step 5: Creating Your Cuts">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-stone-700">📏 Measuring & Marking</h4>
              <p>Use the position measurements to mark cut lines on the page edges. Each number represents where to start or stop a cut.
                 Mark lightly with pencil at each position listed.</p>
            </div>
            <div>
              <h4 className="font-semibold text-stone-700">🔪 Making the Cuts</h4>
              {useDepthMode ? (
                <>
                  <p>Cut straight into the page edge at the specified depth for each page pair:</p>
                  <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                    <li><strong>Light cuts (3.0-15.0mm):</strong> Shallow cuts into page edge</li>
                    <li><strong>Medium cuts (16.0-30.0mm):</strong> Standard depth cuts</li>
                    <li><strong>Deep cuts (31.0-40.0mm):</strong> Maximum depth for dark image areas</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>Cut straight into the page edge at uniform 20mm depth:</p>
                  <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                    <li><strong>All cuts:</strong> Exactly 20mm deep into page edge</li>
                    <li><strong>Consistent depth:</strong> No need to vary cutting depth</li>
                    <li><strong>Simple approach:</strong> Same technique for every cut</li>
                  </ul>
                </>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-stone-700">🎯 Cut Direction & Technique</h4>
              <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                <li><strong>Cut from page edge:</strong> Cut straight into the page from the outer edge</li>
                <li><strong>Pairs of positions:</strong> Cut between each pair of numbers (e.g., 5.7 to 6.1, then 8.3 to 9.5)</li>
                <li><strong>Consistent depth:</strong> {useDepthMode 
                  ? 'All cuts on a page pair use the SAME depth (shown at start of line)'
                  : 'All cuts use 20mm depth'
                }</li>
                <li><strong>Clean cuts:</strong> Use sharp craft knife and metal ruler</li>
                <li><strong>Cut through both pages:</strong> Cut the entire 2-page sheet at once</li>
              </ul>
            </div>
          </div>
        </Step>

        <Step icon="💡" title="Step 6: Pro Tips for Best Results">
          <div className={`${useDepthMode ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} p-4 rounded-lg border`}>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Sharp blade:</strong> Use a fresh craft knife blade for clean cuts</li>
              <li><strong>Metal ruler:</strong> Essential for straight, accurate cuts</li>
              <li><strong>Cutting mat:</strong> Protect your work surface and get cleaner cuts</li>
              <li><strong>Consistent pressure:</strong> Apply steady pressure for even cut depth</li>
              <li><strong>Work systematically:</strong> Complete all cuts for one page pair before moving on</li>
              {useDepthMode ? (
                <>
                  <li><strong>Book choice:</strong> Thicker books (400+ pages) allow for more dramatic depth variation</li>
                  <li><strong>Depth precision:</strong> Use a depth gauge or ruler to ensure accurate cut depths</li>
                </>
              ) : (
                <>
                  <li><strong>Book choice:</strong> Medium thickness books (150-300 pages) are ideal for 20mm cuts</li>
                  <li><strong>Consistent depth:</strong> Use a depth stop or guide to maintain uniform 20mm cuts</li>
                </>
              )}
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
            {useDepthMode && <li>Be extra careful with deep cuts (30mm+) - use more pressure gradually</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
