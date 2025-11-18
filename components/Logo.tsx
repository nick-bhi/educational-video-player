'use client';

/**
 * Animated cat logo component - friendly and playful like Duolingo's owl
 */
export default function Logo({ size = 'large' }: { size?: 'small' | 'large' }) {
  const sizeClasses = size === 'large' ? 'w-16 h-16' : 'w-12 h-12';
  const eyeSize = size === 'large' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  
  return (
    <div className={`${sizeClasses} relative`}>
      {/* Animated cat face */}
      <div className="relative w-full h-full">
        {/* Cat head */}
        <div className="absolute inset-0 bg-gradient-to-br from-ka-orange to-ka-yellow rounded-full shadow-lg animate-pulse-slow">
          {/* Cat ears */}
          <div className="absolute -top-2 left-2 w-4 h-4 bg-gradient-to-br from-ka-orange to-ka-yellow transform rotate-[-20deg] rounded-tl-full"></div>
          <div className="absolute -top-2 right-2 w-4 h-4 bg-gradient-to-br from-ka-orange to-ka-yellow transform rotate-[20deg] rounded-tr-full"></div>
          
          {/* Cat eyes - animated blinking */}
          <div className="absolute top-4 left-3 flex items-center justify-center">
            <div className={`${eyeSize} bg-white rounded-full flex items-center justify-center animate-blink`}>
              <div className="w-1.5 h-1.5 bg-ka-blue rounded-full"></div>
            </div>
          </div>
          <div className="absolute top-4 right-3 flex items-center justify-center">
            <div className={`${eyeSize} bg-white rounded-full flex items-center justify-center animate-blink`}>
              <div className="w-1.5 h-1.5 bg-ka-blue rounded-full"></div>
            </div>
          </div>
          
          {/* Cat nose */}
          <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-2 h-1.5 bg-ka-pink rounded-full"></div>
          
          {/* Cat mouth - smile */}
          <div className="absolute top-9 left-1/2 transform -translate-x-1/2">
            <svg className="w-5 h-3 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 10">
              <path d="M5 5 Q10 8 15 5" strokeLinecap="round" />
            </svg>
          </div>
          
          {/* Cat whiskers */}
          <div className="absolute top-6 left-0 w-3 h-0.5 bg-gray-800 transform rotate-12"></div>
          <div className="absolute top-7 left-0 w-3 h-0.5 bg-gray-800 transform -rotate-12"></div>
          <div className="absolute top-6 right-0 w-3 h-0.5 bg-gray-800 transform -rotate-12"></div>
          <div className="absolute top-7 right-0 w-3 h-0.5 bg-gray-800 transform rotate-12"></div>
        </div>
      </div>
    </div>
  );
}

