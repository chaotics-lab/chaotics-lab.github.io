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
  isNearBlackHole: boolean;
}

interface BlackHole {
  x: number;
  y: number;
  radius: number;
  effectRadius: number;
}

interface GlowStar {
  angle: number;       // orbit angle
  radius: number;      // distance from black hole
  size: number;        // visual size
  hue: number;         // color hue
  speed: number;       // rotation speed
  opacity: number;     // glow opacity
}

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starGroupsRef = useRef<StarGroup[]>([]);
  const hoverStarsRef = useRef<HoverStar[]>([]);
  const paintedStarsRef = useRef<PaintedStar[]>([]);
  const glowStarsRef = useRef<GlowStar[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationRef = useRef<number>();
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const mouseDown = useRef<boolean>(false);

  const blackHole: BlackHole = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    radius: 200,
    effectRadius: 250,
  };

  // Initialize glow stars
const createGlowStars = (count: number, blackHoleRadius: number) => {
  const stars: GlowStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      angle: Math.random() * Math.PI,
      radius: blackHoleRadius + 100 + Math.random() * 250,
      size: 100 + Math.random() * 250,
      hue: Math.random() * 180,
      speed: 0.002 + Math.random() * 0.005,
      opacity: 0.05 - Math.random() * 0.025,
    });
  }
  return stars;
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

    createGroupedStars([0.5, 1], 80, [5, 15], [1.5, 2.5], 20);
    createGroupedStars([1, 2.5], 20, [20, 40], [0.2, 0.5], 5);
    createGroupedStars([2.5, 4], 10, [40, 80], [0.05, 0.1], 3);
    createGroupedStars([4, 6], 5, [40, 120], [0.01, 0.05], 2  );
    return groups;
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
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight; // header height
      starGroupsRef.current = createStarGroups(canvas.width, canvas.height);
      // On resize or init
      glowStarsRef.current = createGlowStars(2, blackHole.radius*2);

      blackHole.x = canvas.width / 2;
      blackHole.y = canvas.height; // bottom-center
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

    const animate = () => {
      if (!ctx) return;
      time += 0.016;
      shootTimer += 0.016;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Rotate starfield around black hole
      ctx.save();
      ctx.translate(blackHole.x, blackHole.y);
      ctx.rotate((time * 2 * Math.PI) / 120);
      ctx.translate(-blackHole.x, -blackHole.y);

      glowStarsRef.current.forEach((star) => {
        star.angle += star.speed;
        const x = blackHole.x + star.radius * Math.cos(star.angle);
        const y = blackHole.y + star.radius * Math.sin(star.angle);

        ctx.save();
        ctx.filter = 'blur(20px)';
        ctx.fillStyle = `hsla(${star.hue},50%,90%,${star.opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw star groups
      starGroupsRef.current.forEach((group) => {
        const dxGroup = Math.cos(group.angle) * group.amplitude * Math.sin(time * group.speed);
        const dyGroup = Math.sin(group.angle) * group.amplitude * Math.sin(time * group.speed);

        group.stars.forEach((star) => {
          let x = star.x + dxGroup;
          let y = star.y + dyGroup;

          const dxBH = blackHole.x - x;
          const dyBH = blackHole.y - y;
          const dist = Math.sqrt(dxBH * dxBH + dyBH * dyBH);
          if (dist < blackHole.effectRadius) {
            const pull = ((blackHole.effectRadius - dist) / blackHole.effectRadius) ** 1.5 * 0.08;
            x += dxBH * pull;
            y += dyBH * pull;
          }

          const opacity = 0.9 + 0.1 * Math.sin(time * 2 + group.opacityPhase);
          const hue = star.hueBase + star.hueWeight * Math.sin(time * star.hueSpeed);

          ctx.fillStyle = `hsla(${hue},20%,97%,${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, star.size, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      ctx.restore();

      // Hover stars
      if (mousePos.current) {
        const spawnCount = Math.random() < 0.5 ? 1 : 2;
        for (let s = 0; s < spawnCount; s++) {
          hoverStarsRef.current.push({
            x: mousePos.current.x + (Math.random() - 0.5) * 30,
            y: mousePos.current.y + (Math.random() - 0.5) * 30,
            size: Math.random() * 2.5,
            opacity: 0,
            life: 0,
            hue: 45 + Math.random() * 20,
          });
        }
      }

      hoverStarsRef.current.forEach((star, i) => {
        star.life += 0.04;
        star.opacity = star.life < 1 ? star.life : star.opacity - 0.02;

        const dxBH = blackHole.x - star.x;
        const dyBH = blackHole.y - star.y;
        const dist = Math.sqrt(dxBH * dxBH + dyBH * dyBH);
        if (dist < blackHole.effectRadius) {
          const pull = ((blackHole.effectRadius - dist) / blackHole.effectRadius) ** 1.5 * 0.08;
          star.x += dxBH * pull;
          star.y += dyBH * pull;
        }

        ctx.fillStyle = `hsla(${star.hue},20%,97%,${Math.max(0, star.opacity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();
        if (star.opacity <= 0) hoverStarsRef.current.splice(i, 1);
      });

      // Painted stars
      if (mouseDown.current && mousePos.current) {
        const spawnCount = Math.random() < 0.5 ? 1 : 2;
        for (let s = 0; s < spawnCount; s++) {
          paintedStarsRef.current.push({
            baseX: mousePos.current.x,
            baseY: mousePos.current.y,
            size:  Math.random() * 3.5,
            hue: 45 + Math.random() * 20,
            spawnTime: time,
            opacity: 1,
          });
        }
      }

      paintedStarsRef.current.forEach((star, i) => {
        const life = time - star.spawnTime;
        star.opacity = Math.max(0, 1 - life / 6); // last longer

        const dxBH = blackHole.x - star.baseX;
        const dyBH = blackHole.y - star.baseY;
        const dist = Math.sqrt(dxBH * dxBH + dyBH * dyBH);
        if (dist < blackHole.effectRadius) {
          const pull = ((blackHole.effectRadius - dist) / blackHole.effectRadius) ** 1.5 * 0.03;
          star.baseX += dxBH * pull;
          star.baseY += dyBH * pull;
        }

        const rotationAngle = (life * 2 * Math.PI) / 120;
        const dx = star.baseX - blackHole.x;
        const dy = star.baseY - blackHole.y;
        const rotatedX = dx * Math.cos(rotationAngle) - dy * Math.sin(rotationAngle) + blackHole.x;
        const rotatedY = dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle) + blackHole.y;

        ctx.fillStyle = `hsla(${star.hue},20%,97%,${star.opacity})`;
        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, star.size, 0, 2 * Math.PI);
        ctx.fill();

        if (star.opacity <= 0) paintedStarsRef.current.splice(i, 1);
      });

      // Shooting stars
      if (shootTimer > 3.0) {
        shootTimer = 0;
        const side = Math.floor(Math.random() * 3);
        let x = 0,
          y = 0,
          angleOffset = 0;
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
          x,
          y,
          vx: Math.cos(angleOffset) * 6,
          vy: Math.sin(angleOffset) * 6,
          size: 1 + Math.random() * 2,
          hue: 50 + Math.random() * 20,
          opacity: 1,
          isNearBlackHole: false,
        });
      }

      shootingStarsRef.current.forEach((star, i) => {
        star.x += star.vx;
        star.y += star.vy;

        const dxBH = blackHole.x - star.x;
        const dyBH = blackHole.y - star.y;
        const dist = Math.sqrt(dxBH * dxBH + dyBH * dyBH);

        if (dist < blackHole.effectRadius) {
          star.isNearBlackHole = true;
          const pull = ((blackHole.effectRadius - dist) / blackHole.effectRadius) ** 1.5 * 0.1;
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

      // Draw black hole last so stars appear behind it
      drawBlackHole(ctx, blackHole.x, blackHole.y, blackHole.radius);

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
