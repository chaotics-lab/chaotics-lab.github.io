import React, { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  angle: number;
  speed: number;
  opacityPhase: number;
  amplitude: number;
  hueBase: number;
  hueWeight: number;
  hueSpeed: number;
}

interface StarGroup {
  angle: number;
  speed: number;
  amplitude: number;
  opacityPhase: number;
  hueBase: number;
  hueWeight: number;
  hueSpeed: number;
  stars: Star[];
}

interface HoverStar {
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
  hue: number;
}

interface PaintedStar {
  baseX: number;
  baseY: number;
  size: number;
  hue: number;
  spawnTime: number;
  opacity: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  opacity: number;
}

interface BlackHole {
  x: number;
  y: number;
  radius: number;
  effectRadius: number;
}

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starGroupsRef = useRef<StarGroup[]>([]);
  const hoverStarsRef = useRef<HoverStar[]>([]);
  const paintedStarsRef = useRef<PaintedStar[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationRef = useRef<number>();
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const mouseDown = useRef<boolean>(false);
  const lastFrameTime = useRef<number>(0);

  const blackHole: BlackHole = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    radius: 150,
    effectRadius: 200,
  };

  const createStarGroups = (width: number, height: number) => {
    const groups: StarGroup[] = [];

    const createGroupedStars = (
      sizeRange: [number, number],
      starCount: number,
      hueWeightRange: [number, number],
      hueSpeedRange: [number, number],
      groupCount: number
    ) => {
      for (let g = 0; g < groupCount; g++) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = 3 - Math.random() * 3;
        const amplitude = 2 + Math.random() * 4;
        const opacityPhase = Math.random() * 2 * Math.PI;
        const hueBase = Math.random() * 60 - 30;
        const hueWeight =
          hueWeightRange[0] +
          Math.random() * (hueWeightRange[1] - hueWeightRange[0]);
        const hueSpeed =
          hueSpeedRange[0] + Math.random() * (hueSpeedRange[1] - hueSpeedRange[0]);

        const stars: Star[] = [];
        const starsPerGroup = Math.floor(starCount / groupCount);

        for (let i = 0; i < starsPerGroup; i++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
            angle,
            speed,
            amplitude,
            opacityPhase,
            hueBase,
            hueWeight,
            hueSpeed,
          });
        }

        groups.push({ angle, speed, amplitude, opacityPhase, hueBase, hueWeight, hueSpeed, stars });
      }
    };

    // Reduced star counts
    createGroupedStars([0.5, 1], 40, [5, 15], [1.5, 2.5], 10);
    createGroupedStars([1, 2.5], 10, [20, 40], [0.2, 0.5], 3);
    createGroupedStars([2.5, 4], 5, [40, 80], [0.05, 0.1], 2);

    return groups;
  };

  const drawBlackHole = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    // Simplified gradient without blur filter
    const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 228, 200, 0.8)');
    gradient.addColorStop(0.15, 'rgba(255, 165, 0, 0.6)');
    gradient.addColorStop(0.6, 'rgba(255, 42, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      starGroupsRef.current = createStarGroups(canvas.width, canvas.height);

      blackHole.x = canvas.width / 2;
      blackHole.y = canvas.height;
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) =>
      (mousePos.current = { x: e.clientX, y: e.clientY });
    const handleMouseLeave = () => (mousePos.current = null);
    const handleMouseDown = () => (mouseDown.current = true);
    const handleMouseUp = () => (mouseDown.current = false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let time = 0;
    let shootTimer = 0;

    const animate = (currentTime: number) => {
      if (!ctx) return;

      // Throttle to ~30fps for low-end devices
      const deltaTime = currentTime - lastFrameTime.current;
      if (deltaTime < 33) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime.current = currentTime;

      time += 0.016;
      shootTimer += 0.016;

      // Fill background once instead of clearRect
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simplified rotation without save/restore
      const rotationAngle = (time * 2 * Math.PI) / 120;
      const cosRot = Math.cos(rotationAngle);
      const sinRot = Math.sin(rotationAngle);

      // Pre-calculate common values
      const bhx = blackHole.x;
      const bhy = blackHole.y;
      const effectRad = blackHole.effectRadius;
      const effectRadSq = effectRad * effectRad;

      // Draw star groups
      starGroupsRef.current.forEach((group) => {
        const dxGroup = Math.cos(group.angle) * group.amplitude * Math.sin(time * group.speed);
        const dyGroup = Math.sin(group.angle) * group.amplitude * Math.sin(time * group.speed);

        group.stars.forEach((star) => {
          let x = star.x + dxGroup;
          let y = star.y + dyGroup;

          // Optimized distance check
          const dxBH = bhx - x;
          const dyBH = bhy - y;
          const distSq = dxBH * dxBH + dyBH * dyBH;
          
          if (distSq < effectRadSq) {
            const dist = Math.sqrt(distSq);
            const pull = ((effectRad - dist) / effectRad) ** 1.5 * 0.08;
            x += dxBH * pull;
            y += dyBH * pull;
          }

          // Apply rotation
          const dx = x - bhx;
          const dy = y - bhy;
          const rotatedX = dx * cosRot - dy * sinRot + bhx;
          const rotatedY = dx * sinRot + dy * cosRot + bhy;

          const opacity = 0.9 + 0.1 * Math.sin(time * 2 + group.opacityPhase);
          const hue = star.hueBase + star.hueWeight * Math.sin(time * star.hueSpeed);

          ctx.fillStyle = `hsla(${hue},20%,97%,${opacity})`;
          ctx.beginPath();
          ctx.arc(rotatedX, rotatedY, star.size, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // Hover stars - reduced spawn rate
      if (mousePos.current && Math.random() < 0.3) {
        hoverStarsRef.current.push({
          x: mousePos.current.x + (Math.random() - 0.5) * 30,
          y: mousePos.current.y + (Math.random() - 0.5) * 30,
          size: Math.random() * 2.5,
          opacity: 0,
          life: 0,
          hue: 45 + Math.random() * 20,
        });
      }

      // Limit hover stars array size
      if (hoverStarsRef.current.length > 50) {
        hoverStarsRef.current = hoverStarsRef.current.slice(-50);
      }

      hoverStarsRef.current.forEach((star, i) => {
        star.life += 0.04;
        star.opacity = star.life < 1 ? star.life : star.opacity - 0.02;

        const dxBH = bhx - star.x;
        const dyBH = bhy - star.y;
        const distSq = dxBH * dxBH + dyBH * dyBH;
        
        if (distSq < effectRadSq) {
          const dist = Math.sqrt(distSq);
          const pull = ((effectRad - dist) / effectRad) ** 1.5 * 0.08;
          star.x += dxBH * pull;
          star.y += dyBH * pull;
        }

        ctx.fillStyle = `hsla(${star.hue},20%,97%,${Math.max(0, star.opacity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();
        
        if (star.opacity <= 0) hoverStarsRef.current.splice(i, 1);
      });

      // Painted stars - reduced spawn rate
      if (mouseDown.current && mousePos.current && Math.random() < 0.3) {
        paintedStarsRef.current.push({
          baseX: mousePos.current.x,
          baseY: mousePos.current.y,
          size: Math.random() * 3.5,
          hue: 45 + Math.random() * 20,
          spawnTime: time,
          opacity: 1,
        });
      }

      // Limit painted stars array size
      if (paintedStarsRef.current.length > 100) {
        paintedStarsRef.current = paintedStarsRef.current.slice(-100);
      }

      paintedStarsRef.current.forEach((star, i) => {
        const life = time - star.spawnTime;
        star.opacity = Math.max(0, 1 - life / 6);

        const dxBH = bhx - star.baseX;
        const dyBH = bhy - star.baseY;
        const distSq = dxBH * dxBH + dyBH * dyBH;
        
        if (distSq < effectRadSq) {
          const dist = Math.sqrt(distSq);
          const pull = ((effectRad - dist) / effectRad) ** 1.5 * 0.03;
          star.baseX += dxBH * pull;
          star.baseY += dyBH * pull;
        }

        const dx = star.baseX - bhx;
        const dy = star.baseY - bhy;
        const rotatedX = dx * cosRot - dy * sinRot + bhx;
        const rotatedY = dx * sinRot + dy * cosRot + bhy;

        ctx.fillStyle = `hsla(${star.hue},20%,97%,${star.opacity})`;
        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, star.size, 0, 2 * Math.PI);
        ctx.fill();

        if (star.opacity <= 0) paintedStarsRef.current.splice(i, 1);
      });

      // Shooting stars - increased spawn interval
      if (shootTimer > 4.0) {
        shootTimer = 0;
        const side = Math.floor(Math.random() * 3);
        let x = 0, y = 0, angleOffset = 0;
        
        switch (side) {
          case 0:
            x = Math.random() * canvas.width;
            y = -10;
            angleOffset = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            break;
          case 1:
            x = -10;
            y = Math.random() * canvas.height;
            angleOffset = 0 + (Math.random() - 0.5) * 0.3;
            break;
          case 2:
            x = canvas.width + 10;
            y = Math.random() * canvas.height;
            angleOffset = Math.PI + (Math.random() - 0.5) * 0.3;
            break;
        }
        
        shootingStarsRef.current.push({
          x, y,
          vx: Math.cos(angleOffset) * 6,
          vy: Math.sin(angleOffset) * 6,
          size: 1 + Math.random() * 2,
          hue: 50 + Math.random() * 20,
          opacity: 1,
        });
      }

      shootingStarsRef.current.forEach((star, i) => {
        star.x += star.vx;
        star.y += star.vy;

        const dxBH = bhx - star.x;
        const dyBH = bhy - star.y;
        const distSq = dxBH * dxBH + dyBH * dyBH;

        if (distSq < effectRadSq) {
          const dist = Math.sqrt(distSq);
          const pull = ((effectRad - dist) / effectRad) ** 1.5 * 0.1;
          star.x += dxBH * pull;
          star.y += dyBH * pull;
          star.opacity -= 0.05;
        }

        ctx.fillStyle = `hsla(${star.hue}, 80%, 90%, ${Math.max(0, star.opacity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();

        if (
          star.opacity <= 0 ||
          star.x < -20 ||
          star.x > canvas.width + 20 ||
          star.y < -20 ||
          star.y > canvas.height + 20
        ) {
          shootingStarsRef.current.splice(i, 1);
        }
      });

      // Draw black hole last
      drawBlackHole(ctx, bhx, bhy, blackHole.radius);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10" />;
};