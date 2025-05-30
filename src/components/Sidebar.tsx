import React, { useState, useCallback, useMemo } from 'react';
import { Film, Tv, MapPin, PenTool, Book, Plus, Trash2, Gamepad, Globe, Music, Camera, Star, Star as StarFill, Pin, Pin as PinFill } from 'lucide-react';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

const SortableItem: React.FC<{
  id: string;
  list: any;
  activeListId: string | null;
  theme: string;
  starAnimatingId: string | null;
  pinAnimatingId: string | null;
  toggleFavorite: (id: string) => void;
  togglePinned: (id: string) => void;
  setActiveList: (id: string) => void;
  deleteList: (id: string) => void;
}> = React.memo(({
  id,
  list,
  activeListId,
  theme,
  starAnimatingId,
  pinAnimatingId,
  toggleFavorite,
  togglePinned,
  setActiveList,
  deleteList,
}) => {
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: list.pinned });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: list.pinned ? 'default' : 'grab',
  }), [transform, transition, isDragging, list.pinned]);

  const progress = useMemo(() => {
    if (!list.items || list.items.length === 0) return 0;
    const totalItems = list.items.length;
    const completedItems = list.items.filter((item: any) => item.completed).length;
    return Math.round((completedItems / totalItems) * 100);
  }, [list.items]);

  const isStarAnimating = starAnimatingId === list.id;
  const isPinAnimating = pinAnimatingId === list.id;

  const getIcon = useCallback((iconName?: string, type?: string) => {
    const iconToUse = iconName || type;
    switch (iconToUse) {
      case 'Film': case 'movies': return <Film size={18} />;
      case 'Tv': case 'shows': return <Tv size={18} />;
      case 'MapPin': case 'places': return <MapPin size={18} />;
      case 'PenTool': case 'drawings': return <PenTool size={18} />;
      case 'Book': case 'books': return <Book size={18} />;
      case 'Gamepad': case 'games': return <Gamepad size={18} />;
      case 'Globe': case 'travel': return <Globe size={18} />;
      case 'Music': case 'music': return <Music size={18} />;
      case 'Camera': case 'photography': return <Camera size={18} />;
      case 'Star': return <Star size={18} />;
      case 'Pin': return <Pin size={18} />;
      case 'Plus': return <Plus size={18} />;
      default: return <Book size={18} />;
    }
  }, []);

  return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setActiveList(list.id)}
        className={clsx(
          'relative flex flex-col p-4 pr-4 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md select-none overflow-hidden z-20',
          list.id === activeListId
            ? theme === 'dark'
              ? 'bg-brandGreen-600 text-white shadow-lg shadow-brandGreen-600/40 hover:bg-brandGreen-600'
              : 'bg-brandGreen-600 text-white hover:bg-brandGreen-700'
            : theme === 'dark'
              ? 'text-gray-300 border border-gray-700 bg-gray-800/30 hover:bg-gray-800/40 hover:border-gray-600'
              : 'text-gray-700 border border-gray-200 bg-gray-50 shadow-sm hover:shadow-md hover:bg-gray-100 hover:border-gray-300'
        )}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setActiveList(list.id);
          }
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden pointer-events-auto min-w-0">
          {!list.pinned && (
            <span
              {...attributes}
              {...listeners}
              className="mr-3 cursor-grab select-none z-30 pointer-events-auto flex-shrink-0"
              aria-label="Arrastar lista"
              title="Arrastar lista"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
              </svg>
            </span>
          )}
          {list.avatar && <span className="text-2xl select-none mr-3 pointer-events-auto flex-shrink-0">{list.avatar}</span>}
          <span className="mr-3 pointer-events-auto flex-shrink-0">{getIcon(list.icon, list.type)}</span>
          <span
            className="text-lg font-semibold truncate leading-snug pointer-events-auto min-w-0"
            title={list.title}
          >
            {list.title}
          </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(list.id);
          }}
          className={clsx(
            'p-1 rounded transform transition-transform duration-300 pointer-events-auto',
            list.favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400',
            isStarAnimating ? 'scale-125' : ''
          )}
          aria-label="Favoritar lista"
        >
          {list.favorite ? <StarFill size={18} fill="currentColor" /> : <Star size={18} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePinned(list.id);
          }}
          className={clsx(
            'p-1 rounded transform transition-transform duration-300 pointer-events-auto',
            list.pinned ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400',
            isPinAnimating ? 'scale-125' : ''
          )}
          aria-label="Fixar lista"
        >
          {list.pinned ? <PinFill size={18} fill="currentColor" /> : <Pin size={18} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Tem certeza que deseja excluir esta lista?')) {
              deleteList(list.id);
            }
          }}
          className="p-1 text-gray-400 hover:text-red-500 rounded pointer-events-auto"
          aria-label="Excluir lista"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {showMenuId === list.id && (
        <div
          className="absolute top-10 right-4 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(list.id);
              setShowMenuId(null);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            {list.favorite ? 'Remover Favorito' : 'Favoritar'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinned(list.id);
              setShowMenuId(null);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            {list.pinned ? 'Desfixar' : 'Fixar'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Tem certeza que deseja excluir esta lista?')) {
                deleteList(list.id);
              }
              setShowMenuId(null);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-700"
            role="menuitem"
          >
            Excluir
          </button>
        </div>
      )}

      {list.tags && list.tags.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-3 overflow-visible">
          {list.tags.map((tag: { id: string; name: string }, idx: number) => (
            <span
              key={idx}
              className="text-xs bg-gray-300 dark:bg-gray-700 rounded px-3 py-0.5 select-none"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

    <div className="mt-2 h-2 w-full rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden box-border relative">
      <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 relative z-10',
            theme === 'dark' ? 'bg-brandGreen-500' : 'bg-green-400'
          )}
          style={{ width: `${progress}%` }}
        />
    </div>
    </div>
  );
});

const Sidebar: React.FC = () => {
  const { state, setActiveList, deleteList, dispatch } = useListContext();
  const { lists, activeListId } = state;
  const { theme } = useTheme();

  const [starAnimatingId, setStarAnimatingId] = useState<string | null>(null);
  const [pinAnimatingId, setPinAnimatingId] = useState<string | null>(null);

  // New state for filter and sort
  const [filterText, setFilterText] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleFavorite = useCallback((id: string) => {
    setStarAnimatingId(id);
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { id } });
    setTimeout(() => setStarAnimatingId(null), 300);
  }, [dispatch]);

  const togglePinned = useCallback((id: string) => {
    setPinAnimatingId(id);
    dispatch({ type: 'TOGGLE_PINNED', payload: { id } });
    setTimeout(() => setPinAnimatingId(null), 300);
  }, [dispatch]);

  // Filter and sort lists
  const filteredLists = useMemo(() => {
    return lists.filter(list => list.title.toLowerCase().includes(filterText.toLowerCase()));
  }, [lists, filterText]);

  const sortedLists = useMemo(() => {
    const pinnedLists = filteredLists.filter(list => list.pinned);
    const nonPinnedLists = filteredLists.filter(list => !list.pinned);

    const sortFunc = (a: typeof lists[0], b: typeof lists[0]) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    };

    pinnedLists.sort(sortFunc);
    nonPinnedLists.sort(sortFunc);

    return [...pinnedLists, ...nonPinnedLists];
  }, [filteredLists, sortOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Increased from 5 for better UX
      },
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Separate pinned and non-pinned lists from the original state
      const pinnedLists = state.lists.filter((list) => list.pinned);
      const nonPinnedLists = state.lists.filter((list) => !list.pinned);

      // Find old and new index in non-pinned lists
      const oldIndex = nonPinnedLists.findIndex((list) => list.id === active.id);
      const newIndex = nonPinnedLists.findIndex((list) => list.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return; // Dragging pinned item or invalid drag
      }

      // Prevent moving non-pinned lists above pinned lists
      if (newIndex < 0 || newIndex < pinnedLists.length) {
        return;
      }

      // Reorder non-pinned lists
      const newNonPinnedOrder = arrayMove(nonPinnedLists, oldIndex, newIndex);

      // Combine pinned lists (fixed) and reordered non-pinned lists
      const newOrder = [...pinnedLists, ...newNonPinnedOrder];

      dispatch({ type: 'REORDER_LISTS', payload: { lists: newOrder } });
    }
  }, [state.lists, dispatch]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div
        className={clsx(
          'h-full p-4 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-[56rem] rounded-lg shadow-lg backdrop-blur overflow-auto',
          theme === 'dark'
            ? 'bg-gray-900/50 border border-gray-700 text-gray-100'
            : 'bg-white border border-gray-300 text-gray-900'
        )}
      >
        <h2
          className={clsx(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          )}
        >
          Suas Listas
        </h2>

        {/* Filter input */}
        <input
          type="text"
          placeholder="Filtrar por nome..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className={clsx(
            'mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brandGreen-500',
            theme === 'dark'
              ? 'bg-gray-800 text-gray-100 border-gray-600 placeholder-gray-400'
              : 'bg-white text-gray-900 placeholder-gray-500'
          )}
        />

        {/* Sort order buttons */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setSortOrder('asc')}
            className={clsx(
              'px-3 py-1 rounded border',
              sortOrder === 'asc'
                ? 'bg-brandGreen-500 text-white border-brandGreen-500'
                : 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100',
              theme === 'dark'
                ? 'text-gray-100 hover:bg-gray-700 border-gray-600'
                : ''
            )}
          >
            A-Z
          </button>
          <button
            onClick={() => setSortOrder('desc')}
            className={clsx(
              'px-3 py-1 rounded border',
              sortOrder === 'desc'
                ? 'bg-brandGreen-500 text-white border-brandGreen-500'
                : 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100',
              theme === 'dark'
                ? 'text-gray-100 hover:bg-gray-700 border-gray-600'
                : ''
            )}
          >
            Z-A
          </button>
        </div>

        <SortableContext items={sortedLists.map((list) => list.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sortedLists.map((list) => (
              <SortableItem
                key={list.id}
                id={list.id}
                list={list}
                activeListId={activeListId}
                theme={theme}
                starAnimatingId={starAnimatingId}
                pinAnimatingId={pinAnimatingId}
                toggleFavorite={toggleFavorite}
                togglePinned={togglePinned}
                setActiveList={setActiveList}
                deleteList={deleteList}
              />
            ))}
          </div>
        </SortableContext>

        <button
          onClick={() => setActiveList(null)}
          className={clsx(
            'mt-6 flex items-center gap-3 p-3 rounded-xl w-full transition-all duration-300 font-semibold',
            theme === 'dark'
              ? ['text-brandGreen-400 hover:text-brandGreen-300 hover:bg-gray-800']
              : ['text-brandGreen-600 hover:text-green-700 hover:bg-green-100']
          )}
        >
          <Plus size={20} />
          <span>Nova Lista</span>
        </button>
      </div>
    </DndContext>
  );
};

export default Sidebar;
