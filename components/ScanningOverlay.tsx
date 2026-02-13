
import React from 'react';

const ScanningOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-64 h-64 border-2 border-indigo-500/30 rounded-lg overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent"></div>
        {/* Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_2s_linear_infinite]"></div>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Analyzing Features</h2>
      <p className="text-indigo-300 animate-pulse">Cross-referencing global databases...</p>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ScanningOverlay;
