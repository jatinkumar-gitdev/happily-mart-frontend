import React from 'react';

export default function AdminLoader() {
  // Define keyframe animations as CSS variables
  const keyframes = `
    @keyframes square-1 {
      0% { transform: translate(-50px, -50px) rotate(0deg); }
      25% { transform: translate(50px, -50px) rotate(90deg); }
      50% { transform: translate(50px, 50px) rotate(180deg); }
      75% { transform: translate(-50px, 50px) rotate(270deg); }
      100% { transform: translate(-50px, -50px) rotate(360deg); }
    }
    
    @keyframes square-2 {
      0% { transform: translate(50px, -50px) rotate(0deg); }
      25% { transform: translate(50px, 50px) rotate(90deg); }
      50% { transform: translate(-50px, 50px) rotate(180deg); }
      75% { transform: translate(-50px, -50px) rotate(270deg); }
      100% { transform: translate(50px, -50px) rotate(360deg); }
    }
    
    @keyframes square-3 {
      0% { transform: translate(-50px, 50px) rotate(0deg); }
      25% { transform: translate(-50px, -50px) rotate(90deg); }
      50% { transform: translate(50px, -50px) rotate(180deg); }
      75% { transform: translate(50px, 50px) rotate(270deg); }
      100% { transform: translate(-50px, 50px) rotate(360deg); }
    }
    
    @keyframes square-4 {
      0% { transform: translate(50px, 50px) rotate(0deg); }
      25% { transform: translate(-50px, 50px) rotate(90deg); }
      50% { transform: translate(-50px, -50px) rotate(180deg); }
      75% { transform: translate(50px, -50px) rotate(270deg); }
      100% { transform: translate(50px, 50px) rotate(360deg); }
    }
    
    @keyframes pulse-gentle {
      0%, 100% { opacity: 0.8; transform: scale(1) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.3) rotate(45deg); }
    }
    
    @keyframes fade {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    
    @keyframes dot {
      0%, 20% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <style>{keyframes}</style>
      <div className="relative w-24 h-24">
        {/* Rotating squares forming a geometric pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Square 1 - Top Left */}
          <div 
            className="absolute w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg"
            style={{
              transformOrigin: 'center',
              animation: 'square-1 4s ease-in-out infinite'
            }}
          />
          
          {/* Square 2 - Top Right */}
          <div 
            className="absolute w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg"
            style={{
              transformOrigin: 'center',
              animation: 'square-2 4s ease-in-out infinite'
            }}
          />
          
          {/* Square 3 - Bottom Left */}
          <div 
            className="absolute w-14 h-14 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg shadow-lg"
            style={{
              transformOrigin: 'center',
              animation: 'square-3 4s ease-in-out infinite'
            }}
          />
          
          {/* Square 4 - Bottom Right */}
          <div 
            className="absolute w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg"
            style={{
              transformOrigin: 'center',
              animation: 'square-4 4s ease-in-out infinite'
            }}
          />
          
          {/* Center white diamond */}
          <div 
            className="absolute w-4 h-4 bg-white rounded-sm shadow-md z-10"
            style={{
              animation: 'pulse-gentle 2s ease-in-out infinite'
            }}
          />
        </div>

        {/* Loading text */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p 
            className="text-slate-600 text-sm font-medium tracking-wide"
            style={{
              animation: 'fade 2s ease-in-out infinite'
            }}
          >
            Loading
            <span 
              className="inline-block"
              style={{
                animation: 'dot 1.5s ease-in-out infinite',
                animationDelay: '0s'
              }}
            >.</span>
            <span 
              className="inline-block"
              style={{
                animation: 'dot 1.5s ease-in-out infinite',
                animationDelay: '0.3s'
              }}
            >.</span>
            <span 
              className="inline-block"
              style={{
                animation: 'dot 1.5s ease-in-out infinite',
                animationDelay: '0.6s'
              }}
            >.</span>
          </p>
        </div>
      </div>
    </div>
  );
}