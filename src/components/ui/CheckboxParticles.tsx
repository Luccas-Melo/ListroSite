import React from "react";
import { motion } from "framer-motion";

interface CheckboxParticlesProps {
  isChecked: boolean;
  color?: string;
}

const CheckboxParticles: React.FC<CheckboxParticlesProps> = ({ isChecked, color }) => {
  const particles = React.useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 16;
      const distance = 20 + Math.random() * 10;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: Math.random() * 0.3,
        size: Math.random() * 4 + 2,
          color: color || 'hsl(120, 70%, 60%)',
      };
    });
  }, [color]);

  if (!isChecked) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map(({ id, x, y, delay, size, color }) => (
        <motion.div
          key={id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x, y, scale: 1, opacity: 0 }}
          transition={{
            duration: 0.8,
            delay,
            ease: [0.68, -0.55, 0.27, 1.55],
          }}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.6, opacity: 0.5 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: `2px solid ${color || 'hsl(120, 70%, 60%)'}`,
          boxShadow: `0 0 20px ${color || 'hsl(120, 70%, 60%)'}`,
        }}
      />
    </div>
  );
};

export default CheckboxParticles;
