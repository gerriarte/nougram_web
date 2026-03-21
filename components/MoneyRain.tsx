import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote } from 'lucide-react';

// Defines a single currency particle
interface Particle {
  id: number;
  x: number; // Percentage 0-100
  size: number; // Icon size in px
  duration: number; // Fall duration in seconds
  delay: number; // Start delay in seconds
  opacity: number;
}

export const MoneyRain: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate an initial burst of particles
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 35; i++) {
        newParticles.push({
          id: Math.random(),
          x: Math.random() * 100, // Random horizontal position
          size: Math.random() * 48 + 50, // Size increased by 200%+ (between 50px and 98px)
          duration: Math.random() * 8 + 6, // Fall duration between 6s and 14s
          delay: Math.random() * 5, // Staggered start
          opacity: Math.random() * 0.15 + 0.05, // Subtle opacity (5% to 20%)
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-brand-500 font-mono font-bold select-none"
          initial={{ 
            y: "-10vh", 
            x: `${p.x}vw`, 
            opacity: 0,
          }}
          animate={{ 
            y: "110vh",
            opacity: [0, p.opacity, p.opacity, 0], // Fade in, hold, fade out
            rotate: [0, 90, 180, 270, 360] // Distinct full rotations as it falls
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
            rotate: {
              duration: p.duration * 1.5,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        >
          <Banknote size={p.size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
};
