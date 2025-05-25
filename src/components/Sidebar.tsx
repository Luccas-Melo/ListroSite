import React, { useState } from 'react';
import { Film, Tv, MapPin, PenTool, Book, Plus, Trash2, Gamepad, Globe, Music, Camera, Star, Pin } from 'lucide-react';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const { state, setActiveList, deleteList, dispatch } = useListContext();
  const { lists, activeListId } = state;
  const { theme } = useTheme();

  const [starAnimatingId, setStarAnimatingId] = useState<string | null>(null);
  const [pinAnimatingId, setPinAnimatingId] = useState<string | null>(null);

  const getIcon = (iconName?: string, type?: string) => {
    const iconToUse = iconName || type;
    switch (iconToUse) {
      case 'Film':
      case 'movies':
        return <Film size={18} />;
      case 'Tv':
      case 'shows':
        return <Tv size={18} />;
      case 'MapPin':
      case 'places':
        return <MapPin size={18} />;
      case 'PenTool':
      case 'drawings':
        return <PenTool size={18} />;
      case 'Book':
      case 'books':
        return <Book size={18} />;
      case 'Gamepad':
      case 'games':
        return <Gamepad size={18} />;
      case 'Globe':
      case 'travel':
        return <Globe size={18} />;
      case 'Music':
      case 'music':
        return <Music size={18} />;
      case 'Camera':
      case 'photography':
        return <Camera size={18} />;
      case 'Star':
        return <Star size={18} />;
      case 'Pin':
        return <Pin size={18} />;
      case 'Plus':
        return <Plus size={18} />;
      default:
        return <Book size={18} />;
    }
  };

  // Sort lists: pinned first, then others
  const sortedLists = [...lists].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  if (lists.length === 0) {
    return null;
  }

  const toggleFavorite = (id: string) => {
    setStarAnimatingId(id);
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { id } });
    setTimeout(() => setStarAnimatingId(null), 300);
  };

  const togglePinned = (id: string) => {
    setPinAnimatingId(id);
    dispatch({ type: 'TOGGLE_PINNED', payload: { id } });
    setTimeout(() => setPinAnimatingId(null), 300);
  };

  const calculateProgress = (list: any) => {
    if (!list.items || list.items.length === 0) return 0;
    const totalItems = list.items.length;
    const completedItems = list.items.filter((item: any) => item.completed).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  return (
    <div className={clsx(
      'h-full p-4 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-900 rounded-lg shadow-lg',
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    )}>
      <h2 className={clsx(
        'text-lg font-semibold mb-4',
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      )}>Suas Listas</h2>
      <div className="space-y-3">
        {sortedLists.map((list) => {
          const progress = calculateProgress(list);
          const isStarAnimating = starAnimatingId === list.id;
          const isPinAnimating = pinAnimatingId === list.id;
          return (
            <div
              key={list.id}
              onClick={() => setActiveList(list.id)}
              className={clsx(
                'flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md',
                list.id === activeListId ? 
                  theme === 'dark' ? [
                    'bg-brandGreen-600 text-white shadow-lg shadow-brandGreen-600/40',
                    'hover:bg-brandGreen-700'
                  ] : [
                    'bg-brandGreen-600 text-white',
                    'hover:bg-brandGreen-700'
                  ]
                : 
                  theme === 'dark' ? [
                    'text-gray-300 border border-gray-700 bg-gray-800/60',
                    'hover:bg-gray-800/70 hover:border-gray-600'
                  ] : [
                    'text-gray-700 border border-gray-200 bg-white',
                    'hover:bg-gray-50 hover:border-gray-300'
                  ]
              )}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveList(list.id);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {list.avatar && (
                    <span className="mr-3 text-2xl select-none">{list.avatar}</span>
                  )}
                  <span className="mr-3">{getIcon(list.icon, list.type)}</span>
                  <span className="text-lg font-semibold">{list.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(list.id);
                    }}
                    className={clsx(
                      'ml-2 p-1 rounded transform transition-transform duration-300',
                      list.favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400',
                      isStarAnimating ? 'scale-125' : ''
                    )}
                    aria-label="Favoritar lista"
                  >
                    <Star size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinned(list.id);
                    }}
                    className={clsx(
                      'ml-1 p-1 rounded transform transition-transform duration-300',
                      list.pinned ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400',
                      isPinAnimating ? 'scale-125' : ''
                    )}
                    aria-label="Fixar lista"
                  >
                    <Pin size={18} />
                  </button>
                </div>
                {list.id === activeListId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Tem certeza que deseja excluir esta lista?')) {
                        deleteList(list.id);
                      }
                    }}
                    className="p-2 text-white hover:text-red-300 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Excluir lista"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              {list.tags && list.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {list.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-300 dark:bg-gray-700 rounded px-3 py-0.5 select-none"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 h-2 w-full rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    theme === 'dark' ? 'bg-brandGreen-400' : 'bg-green-300'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setActiveList(null)}
          className={clsx(
          'mt-6 flex items-center gap-3 p-3 rounded-xl w-full transition-all duration-300 font-semibold',
          theme === 'dark' ? [
            'text-brandGreen-400 hover:text-brandGreen-300 hover:bg-gray-800'
          ] : [
            'text-brandGreen-600 hover:text-green-700 hover:bg-green-100'
          ]
        )}
      >
        <Plus size={20} />
        <span>Nova Lista</span>
      </button>
    </div>
  );
};

export default Sidebar;
