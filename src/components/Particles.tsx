import { useEffect, useRef, useCallback } from 'react';
import type { Rarity } from '../types';

const RARITY_PARTICLE_COLORS: Record<Rarity, string[]> = {
  common: ['#94a3b8', '#cbd5e1', '#64748b'],
  uncommon: ['#34d399', '#6ee7b7', '#10b981'],
  rare: ['#60a5fa', '#93c5fd', '#3b82f6'],
  epic: ['#a855f7', '#c084fc', '#7c3aed'],
  legendary: ['#fbbf24', '#fcd34d', '#f59e0b', '#ffffff'],
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
}

interface Props {
  rarity?: Rarity;
  mode: 'idle' | 'burst';
  count?: number;
}

export default function Particles({ rarity = 'common', mode, count = 30 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const createBurstParticles = useCallback(
    (cx: number, cy: number) => {
      const colors = RARITY_PARTICLE_COLORS[rarity];
      const particles: Particle[] = [];
      const burstCount = rarity === 'legendary' ? count * 3 : count;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 6;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.01 + Math.random() * 0.02,
          life: 1,
        });
      }
      return particles;
    },
    [rarity, count]
  );

  const createIdleParticles = useCallback(
    (w: number, h: number) => {
      const colors = RARITY_PARTICLE_COLORS[rarity];
      const particles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.3 - Math.random() * 0.5,
          size: 1 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.2 + Math.random() * 0.5,
          decay: 0,
          life: 1,
        });
      }
      return particles;
    },
    [rarity]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    if (mode === 'burst') {
      const cx = canvas.offsetWidth / 2;
      const cy = canvas.offsetHeight / 2;
      particlesRef.current = createBurstParticles(cx, cy);
    } else {
      particlesRef.current = createIdleParticles(
        canvas.offsetWidth,
        canvas.offsetHeight
      );
    }

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (mode === 'idle') {
          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
          p.alpha = 0.2 + Math.sin(Date.now() * 0.003 + p.x) * 0.3;
        } else {
          p.alpha = p.life;
          p.vy += 0.05; // gravity
        }

        if (p.life <= 0 && mode === 'burst') return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, rarity, createBurstParticles, createIdleParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
