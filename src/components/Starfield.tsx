import { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const createStars = (width: number, height: number) => {
    const stars: Star[] = [];
    
    // Reduced star count for performance
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 0.8,
        opacity: 0.5 + Math.random() * 0.4,
      });
    }
    
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.2 + Math.random() * 1,
        opacity: 0.7 + Math.random() * 0.3,
      });
    }
    
    for (let i = 0; i < 6; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 2.5 + Math.random() * 1.5,
        opacity: 0.85 + Math.random() * 0.15,
      });
    }
    
    return stars;
  };

  const drawBlackHole = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, time: number) => {
    const pulse = 0.95 + Math.sin(time * 1.2) * 0.05;
    const diskRotation = time * 0.8;
    
    // Outer corona - single layer
    ctx.save();
    ctx.filter = 'blur(40px)';
    const corona = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    corona.addColorStop(0.3, `rgba(135, 206, 250, ${0.12 * pulse})`);
    corona.addColorStop(1, 'rgba(0, 100, 200, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Simplified accretion disk - 2 rings instead of 4
    for (let ring = 0; ring < 2; ring++) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(diskRotation + ring * Math.PI / 2);
      ctx.translate(-x, -y);
      
      const ringRadius = radius * (1.2 + ring * 0.25);
      const ringGrad = ctx.createRadialGradient(x, y, ringRadius * 0.7, x, y, ringRadius);
      const alpha = (0.35 - ring * 0.1) * pulse;
      
      ringGrad.addColorStop(0, 'rgba(255, 220, 180, 0)');
      ringGrad.addColorStop(0.5, `rgba(255, 180, 120, ${alpha})`);
      ringGrad.addColorStop(1, 'rgba(200, 100, 50, 0)');
      
      ctx.filter = 'blur(10px)';
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.ellipse(x, y, ringRadius, ringRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Photon sphere
    ctx.save();
    ctx.filter = 'blur(6px)';
    const photonRing = ctx.createRadialGradient(x, y, radius * 0.9, x, y, radius * 1);
    photonRing.addColorStop(0, `rgba(255, 255, 255, ${0.6 * pulse})`);
    photonRing.addColorStop(1, 'rgba(255, 200, 150, 0)');
    ctx.strokeStyle = photonRing;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Hot inner disk - single layer
    ctx.save();
    ctx.filter = 'blur(20px)';
    const hotDisk = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 0.75);
    hotDisk.addColorStop(0, `rgba(255, 255, 255, ${pulse})`);
    hotDisk.addColorStop(0.5, `rgba(255, 220, 180, ${0.8 * pulse})`);
    hotDisk.addColorStop(1, `rgba(255, 150, 100, ${0.3 * pulse})`);
    ctx.fillStyle = hotDisk;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Event horizon
    ctx.save();
    ctx.shadowColor = `rgba(255, 180, 120, ${0.7 * pulse})`;
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Horizon edge
    ctx.strokeStyle = `rgba(255, 220, 180, ${0.3 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.42, 0, Math.PI * 2);
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let mounted = true;
    let bhX = 0;
    let bhY = 0;
    let bhRadius = 150;

    const resize = () => {
      if (!mounted) return;
      
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 1.5); // Lower cap for performance
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      
      bhRadius = Math.min(rect.width * 0.25, 250);
      starsRef.current = createStars(rect.width, rect.height);
      bhX = rect.width / 2;
      bhY = rect.height;
    };

    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    let frameCount = 0;

    const animate = () => {
      if (!mounted || !ctx) return;

      frameCount++;
      // Skip frames on low-end devices
      if (frameCount % 2 === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      time += 0.032; // Doubled step since we skip frames
      const rect = container.getBoundingClientRect();

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Rotate everything around black hole
      ctx.save();
      ctx.translate(bhX, bhY);
      ctx.rotate(time * 0.15);
      ctx.translate(-bhX, -bhY);

      // Draw stars
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Draw black hole
      drawBlackHole(ctx, bhX, bhY, bhRadius, time);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};