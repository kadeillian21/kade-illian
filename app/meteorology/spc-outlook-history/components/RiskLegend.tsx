import { useState } from 'react';

const RiskLegend = () => {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <>
      {/* Legend Toggle */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center"
        >
          {showLegend ? 'Hide Legend' : 'Show Legend'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d={showLegend 
              ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" 
              : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"} 
              clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* SPC Risk Level Legend */}
      {showLegend && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">SPC Risk Level Legend</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-200 mr-3"></div>
                <span className="text-sm text-gray-700">Thunderstorm Risk</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm text-gray-700">Marginal Risk (1)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-yellow-300 mr-3"></div>
                <span className="text-sm text-gray-700">Slight Risk (2)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-orange-400 mr-3"></div>
                <span className="text-sm text-gray-700">Enhanced Risk (3)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-red-500 mr-3"></div>
                <span className="text-sm text-gray-700">Moderate Risk (4)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-purple-500 mr-3"></div>
                <span className="text-sm text-gray-700">High Risk (5)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RiskLegend;
