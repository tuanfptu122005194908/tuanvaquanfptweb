import { useEffect, useState } from 'react';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

const CherryBlossoms = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals: Petal[] = [];
    for (let i = 0; i < 30; i++) {
      newPetals.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 7,
        size: 8 + Math.random() * 12,
        rotation: Math.random() * 360,
      });
    }
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-fall"
          style={{
            left: `${petal.x}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
          }}
        >
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 24 24"
            fill="none"
            className="animate-sway"
            style={{
              transform: `rotate(${petal.rotation}deg)`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <path
              d="M12 2C12 2 8 6 8 10C8 14 12 16 12 16C12 16 16 14 16 10C16 6 12 2 12 2Z"
              fill="rgba(255, 182, 193, 0.7)"
            />
            <path
              d="M12 8C12 8 6 10 6 14C6 18 12 22 12 22C12 22 18 18 18 14C18 10 12 8 12 8Z"
              fill="rgba(255, 192, 203, 0.5)"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default CherryBlossoms;
