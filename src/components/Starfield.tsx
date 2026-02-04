import { useRef, useEffect, useState } from 'react';

interface Star {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
}

export const Starfield = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const timeRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Generate stars once
  const starsRef = useRef<Star[]>(
    Array.from({ length: 250 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 25 + Math.random() * 45,
      speed: 0.15 + Math.random() * 0.35,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.5 + Math.random() * 0.5
    }))
  );

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track mouse
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 100,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.005;
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Force re-render every frame
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{
        background: '#0a0a0a'
      }}
    >
      {/* Background gradient - NO ANIMATION */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(80, 120, 200, 0.2) 0%, rgba(40, 70, 120, 0.12) 40%, rgba(20, 30, 60, 0.06) 70%)'
        }}
      />

      {/* Central black hole */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {/* Outer glow - NO ANIMATION, STAYS VISIBLE */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(90vw, 90vh, 1200px)',
            height: 'min(90vw, 90vh, 1200px)',
            background: 'radial-gradient(circle, rgba(120, 170, 255, 0.25) 0%, rgba(100, 140, 220, 0.15) 35%, rgba(80, 120, 200, 0.08) 60%, transparent 80%)',
            filter: 'blur(60px)'
          }}
        />
        
        {/* Middle glow layer - NO ANIMATION */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(70vw, 70vh, 900px)',
            height: 'min(70vw, 70vh, 900px)',
            background: 'radial-gradient(circle, rgba(255, 200, 120, 0.35) 0%, rgba(255, 160, 100, 0.2) 40%, rgba(220, 120, 80, 0.1) 65%, transparent 85%)',
            filter: 'blur(50px)'
          }}
        />
        
        {/* Accretion disk - NO ANIMATION */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(50vw, 50vh, 650px)',
            height: 'min(50vw, 50vh, 650px)',
            background: 'radial-gradient(circle, rgba(255, 220, 150, 0.4) 0%, rgba(255, 180, 120, 0.25) 45%, rgba(255, 140, 80, 0.12) 70%, transparent 90%)',
            filter: 'blur(40px)'
          }}
        />

        {/* Inner bright core - THIS ONE PULSES */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(30vw, 30vh, 400px)',
            height: 'min(30vw, 30vh, 400px)',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 240, 200, 0.3) 35%, rgba(255, 220, 180, 0.15) 60%, transparent 80%)',
            filter: 'blur(30px)',
            animation: 'corePulse 2.5s ease-in-out infinite'
          }}
        />

        {/* Event horizon - SOLID, NO ANIMATION */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
          style={{
            width: 'min(18vw, 18vh, 250px)',
            height: 'min(18vw, 18vh, 250px)',
            boxShadow: '0 0 80px rgba(255, 200, 150, 0.7), 0 0 120px rgba(135, 206, 250, 0.4), inset 0 0 60px #000'
          }}
        />

        {/* Photon ring - THIS PULSES */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(19vw, 19vh, 265px)',
            height: 'min(19vw, 19vh, 265px)',
            border: '4px solid rgba(255, 230, 200, 0.95)',
            animation: 'ringPulseOnly 3s ease-in-out infinite'
          }}
        />

        {/* Secondary photon ring - THIS PULSES */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(22vw, 22vh, 305px)',
            height: 'min(22vw, 22vh, 305px)',
            border: '2px solid rgba(255, 220, 180, 0.6)',
            animation: 'ringPulseOnly2 3s ease-in-out infinite'
          }}
        />
      </div>

      {/* Stars */}
      {starsRef.current.map((star, i) => {
        const currentAngle = star.angle + timeRef.current * star.speed;
        let x = Math.cos(currentAngle) * star.radius;
        let y = Math.sin(currentAngle) * star.radius;

        if (!isMobile) {
          const dx = x - mousePos.x;
          const dy = y - mousePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 25 && distance > 0) {
            const force = (25 - distance) / distance * 3.5;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }

        return (
          <div
            key={i}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              transform: `translate(calc(-50% + ${x}vh), calc(-50% + ${y}vh))`,
              boxShadow: star.size > 2.5 ? `0 0 ${star.size * 2}px rgba(200, 220, 255, 0.7)` : 'none'
            }}
          />
        );
      })}

      <style>{`
        @keyframes corePulse {
          0%, 100% { 
            opacity: 0.8;
          }
          50% { 
            opacity: 1;
          }
        }
        
        @keyframes ringPulseOnly {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(255, 230, 200, 0.8), 0 0 60px rgba(255, 200, 150, 0.6), inset 0 0 25px rgba(255, 230, 200, 0.4);
          }
          50% { 
            box-shadow: 0 0 50px rgba(255, 255, 255, 1), 0 0 100px rgba(255, 230, 200, 1), inset 0 0 40px rgba(255, 255, 255, 0.8);
          }
        }
        
        @keyframes ringPulseOnly2 {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 220, 180, 0.6);
          }
          50% { 
            box-shadow: 0 0 40px rgba(255, 230, 200, 0.9);
          }
        }
      `}</style>
    </div>
  );
};