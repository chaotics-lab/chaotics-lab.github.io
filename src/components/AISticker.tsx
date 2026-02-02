interface AIStickerProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
}

export function AISticker({ value, size = 80 }: AIStickerProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Generate colors based on value with smooth transitions
  // 0-30: Blue/Cyan tones (low AI)
  // 31-70: Purple/Pink tones (medium AI)
  // 71-100: Hot pink/Magenta tones (high AI)
  const getColorScheme = (val: number) => {
    // Helper function to interpolate between two hex colors
    const interpolateColor = (color1: string, color2: string, factor: number) => {
      const c1 = parseInt(color1.slice(1), 16);
      const c2 = parseInt(color2.slice(1), 16);
      
      const r1 = (c1 >> 16) & 0xff;
      const g1 = (c1 >> 8) & 0xff;
      const b1 = c1 & 0xff;
      
      const r2 = (c2 >> 16) & 0xff;
      const g2 = (c2 >> 8) & 0xff;
      const b2 = c2 & 0xff;
      
      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);
      
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };

    // Define color stops
    const lowColors = {
      primary: '#5bd661',
      secondary: '#4c914c',
      accent1: '#84ed7d',
      accent2: '#abf5a8',
      accent3: '#75a06c',
    };
    
    const midColors = {
      primary: '#5bbcd6',
      secondary: '#4c6991',
      accent1: '#7dd3ed',
      accent2: '#a8e6f5',
      accent3: '#6c8da0',
    };
    
    const highColors = {
      primary: '#d65b5b',
      secondary: '#914c4c',
      accent1: '#ed7d7d',
      accent2: '#f5a8a8',
      accent3: '#a06c6c',
    };

    // Smooth interpolation between color ranges
    if (val <= 50) {
      // Pure low colors, with slight variation based on position in range
      const factor = val / 50;
      return {
        primary: interpolateColor(lowColors.primary, midColors.primary, factor),
        secondary: interpolateColor(lowColors.secondary, midColors.secondary, factor),
        accent1: interpolateColor(lowColors.accent1, midColors.accent1, factor),
        accent2: interpolateColor(lowColors.accent2, midColors.accent2, factor),
        accent3: interpolateColor(lowColors.accent3, midColors.accent3, factor),
      };
    } else {
      // Transition from low to mid colors
      const factor = (val - 50) / 50; // 0 to 1 as we go from 51 to 100
      return {
        primary: interpolateColor(midColors.primary, highColors.primary, factor),
        secondary: interpolateColor(midColors.secondary, highColors.secondary, factor),
        accent1: interpolateColor(midColors.accent1, highColors.accent1, factor),
        accent2: interpolateColor(midColors.accent2, highColors.accent2, factor),
        accent3: interpolateColor(midColors.accent3, highColors.accent3, factor),
      };
    }
  };

  const colors = getColorScheme(clampedValue);
  const scaleFactor = size / 80; // Base size is 80px

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap");
        
        @keyframes rotateGlow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes rotateGlowReverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .ai-sticker {
          position: relative;
          border-radius: 50%;
        }
        
        .ai-sticker::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            transparent 30%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.3) 70%,
            rgba(255, 255, 255, 0.1) 85%,
            transparent 100%
          );
          mix-blend-mode: soft-light;
          opacity: 0.5;
          animation: rotateGlow 60s linear infinite;
        }
        
        .ai-sticker::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at 30% 30%,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.2) 30%,
            transparent 60%
          ),
          radial-gradient(
            ellipse at 70% 70%,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.15) 30%,
            transparent 60%
          );
          mix-blend-mode: overlay;
          opacity: 0.6;
          animation: rotateGlowReverse 40s linear infinite;
        }
        
        .ai-sticker__inner-ring {
          position: absolute;
          top: 10%;
          left: 10%;
          width: 80%;
          height: 80%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(2px);
          mix-blend-mode: overlay;
        }
        
        .ai-sticker__text {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 900;
          text-align: center;
          color: #000;
          mix-blend-mode: overlay;
          letter-spacing: -0.03em;
          transform-origin: center;
        }
        
        .ai-sticker__percentage {
          line-height: 0.9;
          transform: skewX(-8deg) skewY(2deg) rotate(-3deg);
          font-weight: 900;
        }
        
        .ai-sticker__label {
          line-height: 1;
          transform: skewX(10deg) skewY(-1deg) rotate(2deg);
          font-weight: 900;
          letter-spacing: 0.1em;
        }
        
        .ai-sticker__shimmer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(255, 255, 255, 0.3) 45deg,
            rgba(255, 255, 255, 0.6) 90deg,
            rgba(255, 255, 255, 0.3) 135deg,
            transparent 180deg,
            transparent 360deg
          );
          mix-blend-mode: overlay;
          animation: rotateGlow 80s linear infinite, shimmer 3s ease-in-out infinite;
        }
      `}</style>
      
      <div 
        className="ai-sticker"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(
            circle at 25% 25%,
            ${colors.primary},
            ${colors.secondary},
            ${colors.accent1},
            ${colors.accent2},
            ${colors.accent3}
          )`,
          boxShadow: `0 0 0 ${0.1 * scaleFactor}rem rgba(255, 255, 255, 0.8)`,
        }}
      >
        <div className="ai-sticker__shimmer" />
        <div 
          className="ai-sticker__inner-ring"
          style={{
            border: `${0.4 * scaleFactor}rem solid rgba(0, 0, 0, 0.4)`,
          }}
        >
          <div 
            className="ai-sticker__text ai-sticker__percentage"
            style={{
              fontSize: `${Math.round(size * 0.22)}px`,
              marginBottom: `${Math.round(size * 0.03)}px`,
              textShadow: `
                0 0 ${3 * scaleFactor}px rgba(255, 255, 255, 0.8),
                0 ${1 * scaleFactor}px ${3 * scaleFactor}px rgba(0, 0, 0, 0.3),
                0 0 ${5 * scaleFactor}px rgba(255, 255, 255, 0.4)
              `,
            }}
          >
            {clampedValue}%
          </div>
          <div 
            className="ai-sticker__text ai-sticker__label"
            style={{
              fontSize: `${Math.round(size * 0.15)}px`,
              textShadow: `
                0 0 ${3 * scaleFactor}px rgba(255, 255, 255, 0.8),
                0 ${1 * scaleFactor}px ${3 * scaleFactor}px rgba(0, 0, 0, 0.3),
                0 0 ${5 * scaleFactor}px rgba(255, 255, 255, 0.4)
              `,
            }}
          >
            AI
          </div>
        </div>
      </div>
    </>
  );
}