"use client"
import React from 'react';

const VeraYieldPage = () => {
  const handleRedirect = () => {
    window.open('https://www.verayield.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4" 
         style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23563d7c' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}
    >
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border-t-4 border-indigo-700">
        <h1 className="text-3xl font-bold text-indigo-800 mb-4">VeraYield</h1>
        
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-1 shadow-lg mb-4">
            <div className="relative bg-white rounded-lg overflow-hidden" style={{height: "200px"}}>
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <img 
                  src="/window.svg" 
                  alt="VeraYield" 
                  className="w-20 h-20 text-gray-300 opacity-40"
                />
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            VeraYield specializes in innovative real estate investment solutions
            that deliver consistent returns while minimizing risk exposure.
            Our data-driven approach identifies optimal investment opportunities.
          </p>
          
          <div className="border-l-4 border-purple-500 pl-4 py-2 bg-[#f5f1e8] text-left mb-6">
            <p className="text-gray-800 italic">
              "Modern investing for sustainable growth and reliable yields."
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRedirect}
          className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-4 px-8 rounded-full transition-all hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center mx-auto"
        >
          <span className="mr-2">Explore VeraYield</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <p className="text-gray-500 mt-6 text-sm">
          Advanced analytics and comprehensive market insights for optimal investment decisions
        </p>
      </div>
    </div>
  );
};

export default VeraYieldPage;