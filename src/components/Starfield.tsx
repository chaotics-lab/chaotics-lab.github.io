import React, { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  hue: number;
}

interface BlackHole {
  x: number;
  y: number;
  radius: number;
}

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  const blackHole: BlackHole = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    radius: 200,
  };

  const createStars = (width: number, height: number) => {
    const stars: Star[] = [];
    
    // Small stars
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 0.5,
        opacity: 0.7 + Math.random() * 0.3,
        hue: Math.random() * 60 - 30,
      });
    }
    
    // Medium stars
    for (let i = 0; i < 15; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 1.5,
        opacity: 0.8 + Math.random() * 0.2,
        hue: Math.random() * 60 - 30,
      });
    }
    
    // Large stars
    for (let i = 0; i < 5; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 2.5 + Math.random() * 1.5,
        opacity: 0.9 + Math.random() * 0.1,
        hue: Math.random() * 60 - 30,
      });
    }
    
    return stars;
  };

  const drawBlackHole = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 228, 200, 1)');
    gradient.addColorStop(0.15, 'rgba(255, 165, 0, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 42, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.filter = 'blur(25px) brightness(2.8)';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      starsRef.current = createStars(canvas.width, canvas.height);

      blackHole.x = canvas.width / 2;
      blackHole.y = canvas.height;
    };

    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const animate = () => {
      if (!ctx) return;
      time += 0.016;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rotate starfield around black hole
      ctx.save();
      ctx.translate(blackHole.x, blackHole.y);
      ctx.rotate((time * 2 * Math.PI) / 120);
      ctx.translate(-blackHole.x, -blackHole.y);

      // Draw stars
      starsRef.current.forEach((star) => {
        ctx.fillStyle = `hsla(${star.hue},20%,97%,${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();
      });

      ctx.restore();

      // Draw black hole last
      drawBlackHole(ctx, blackHole.x, blackHole.y, blackHole.radius);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10" />;
};

export default Starfield;