"use client"
import React from 'react';

const FirstfruitPage = () => {
  const handleRedirect = () => {
    // Using window.open for better user experience than location.href
    window.open('https://firstfruit-real-estate-website.vercel.app', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex flex-col items-center justify-center p-4" 
         style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2320805e' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}
    >
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border-t-4 border-blue-700">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Firstfruit Real Estate</h1>
        
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-1 shadow-lg mb-4">
            <div className="relative bg-white rounded-lg overflow-hidden" style={{height: "200px"}}>
              {/* Replaced iframe with image for better security and performance */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <img 
                  src="/window.svg" 
                  alt="Firstfruit Real Estate" 
                  className="w-20 h-20 text-gray-300 opacity-40"
                />
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Discover high-yield real estate investment opportunities with Firstfruit Real Estate.
            Our platform connects investors with thoroughly vetted residential and commercial properties.
          </p>
          
          <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 text-left mb-6">
            <p className="text-gray-800 italic">
              "Planting seeds today for tomorrow's harvest."
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRedirect}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-full transition-all hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center mx-auto"
        >
          <span className="mr-2">Visit Firstfruit Real Estate</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <p className="text-gray-500 mt-6 text-sm">
          Find exceptional investment opportunities with professional market analysis
        </p>
      </div>
    </div>
  );
};

export default FirstfruitPage;