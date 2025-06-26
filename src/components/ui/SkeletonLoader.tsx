import React from 'react';
import logo from '../../../logo-sem-fundo.png'; // ajuste o caminho se necessário

const SkeletonLoader: React.FC<{ height?: string; width?: string }> = ({ height = '100vh', width = '100vw' }) => {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height, width, background: 'linear-gradient(90deg, #222 25%, #333 50%, #222 75%)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Efeito shimmer */}
      <div className="absolute inset-0 animate-shimmer z-0" style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)',
        animation: 'shimmer 1.5s infinite',
      }} />
      <img
        src={logo}
        alt="Logo"
        className="z-10"
        style={{ width: 120, height: 120, objectFit: 'contain', filter: 'drop-shadow(0 2px 16px #84cc16)' }}
      />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default SkeletonLoader; 