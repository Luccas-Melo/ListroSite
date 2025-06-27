import React from 'react';
import logo from '../../../logo-sem-fundo.png'; // ajuste o caminho se necessário
import { useTheme } from '../../context/ThemeContext';

const SkeletonLoader: React.FC<{ height?: string; width?: string }> = ({ height = '100vh', width = '100vw' }) => {
  let theme: string = 'light';
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    theme = useTheme().theme;
  } catch {
    theme = 'light';
  }
  const isDark = theme === 'dark';
  return (
    <div
      className="flex items-center justify-center"
      style={{
        height,
        width,
        background: isDark
          ? 'linear-gradient(90deg, #10141a 25%, #181f2a 50%, #10141a 75%)'
          : 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Efeito shimmer */}
      <div
        className="absolute inset-0 animate-shimmer z-0"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(132,204,22,0) 0%, rgba(132,204,22,0.18) 50%, rgba(132,204,22,0) 100%)'
            : 'linear-gradient(90deg, rgba(132,204,22,0) 0%, rgba(132,204,22,0.12) 50%, rgba(132,204,22,0) 100%)',
          animation: 'shimmer 1.5s infinite',
        }}
      />
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