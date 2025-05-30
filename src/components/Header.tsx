import React from 'react';
import { ListPlus, Sun, Moon, Grid, List } from 'lucide-react';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { state, setActiveList } = useListContext();
  const { theme, toggleTheme, viewMode, setViewMode } = useTheme();

  return (
    <header className={clsx(
      "sticky top-0 z-10",
      theme === 'dark' ? [
        'border-gray-800/50 bg-gray-950/95 text-gray-100',
        'backdrop-blur supports-[backdrop-filter]:bg-gray-950/80'
      ] : [
        'border-gray-200 bg-white/95 text-gray-900',
        'backdrop-blur supports-[backdrop-filter]:bg-white/80'
      ]
    )}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => setActiveList(null)}
        >
          <div className="h-10 w-10 mr-2 overflow-hidden rounded relative flex items-center" style={{ width: '12.5rem' }}>
            {theme === 'dark' ? (
              <img src="/logo-sem-fundo-escuro.png" alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <img src="/logo-sem-fundo.png" alt="Logo" className="h-10 w-auto object-contain" />
            )}
          </div>

        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-1.5 rounded transition-colors',
                viewMode === 'list' ? 'bg-brandGreen-100 dark:bg-brandGreen-900 text-brandGreen-600 dark:text-brandGreen-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              aria-label="Visualização em lista"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('cover')}
              className={clsx(
                'p-1.5 rounded transition-colors',
                viewMode === 'cover' ? 'bg-brandGreen-100 dark:bg-brandGreen-900 text-brandGreen-600 dark:text-brandGreen-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              aria-label="Visualização em grade"
            >
              <Grid size={18} />
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="text-gray-500 dark:text-gray-400" size={20} />
            ) : (
              <Moon className="text-gray-500" size={20} />
            )}
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {state.lists.length} {state.lists.length === 1 ? 'lista' : 'listas'} criadas
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;