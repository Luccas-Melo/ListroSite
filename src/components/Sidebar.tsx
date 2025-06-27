import React, { useState, useCallback, useMemo } from 'react';
import { Film, Tv, MapPin, PenTool, Book, Plus, Trash2, Gamepad, Globe, Music, Camera, Star, Star as StarFill, Pin, Pin as PinFill } from 'lucide-react';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  MeasuringStrategy,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

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
  setConfirmDeleteId: (id: string) => void;
  isDragging?: boolean;
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
  setConfirmDeleteId,
  isDragging,
}) => {
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingSort
  } = useSortable({ 
    id,
    disabled: list.pinned,
  });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition: isDraggingSort ? undefined : 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    cursor: list.pinned ? 'default' : 'grab',
    boxShadow: isDragging 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
      : 'none',
    touchAction: 'none',
    transformOrigin: '50% 50%',
    zIndex: isDragging ? 999 : 'auto',
  }), [transform, isDragging, isDraggingSort, list.pinned]);

  const progress = useMemo(() => {
    if (!list.items || list.items.length === 0) return 0;
    const totalItems = list.items.length;
    const completedItems = list.items.filter((item: any) => item.completed).length;
    return Math.round((completedItems / totalItems) * 100);
  }, [list.items]);

  const isStarAnimating = starAnimatingId === list.id;
  const isPinAnimating = pinAnimatingId === list.id;

  const getIcon = React.useCallback((iconName?: string, type?: string) => {
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
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.3 }}
      className={clsx(
        'relative flex flex-col p-4 pr-4 rounded-xl select-none overflow-hidden z-20',
        isDragging && '-translate-x-1/2',
        isDragging && 'opacity-80 shadow-2xl',
        list.id === activeListId
          ? theme === 'dark'
            ? 'bg-brandGreen-600 text-white shadow-lg shadow-brandGreen-600/40 hover:bg-brandGreen-600'
            : 'bg-brandGreen-600 text-white shadow-lg hover:bg-brandGreen-700'
          : theme === 'dark'
            ? 'text-gray-300 border border-gray-700 bg-gray-800/30 hover:bg-gray-800/40 hover:border-gray-600'
            : 'text-gray-700 bg-white shadow-md hover:shadow-lg'
      )}
      tabIndex={0}
      role="button"
      onClick={() => setActiveList(list.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setActiveList(list.id);
        }
      }}
    >
      <div className="flex items-center gap-3 overflow-hidden pointer-events-auto min-w-0">
        {!list.pinned && (
          <div
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
          </div>
        )}
        {list.avatar && <span className="text-2xl select-none mr-3 pointer-events-auto flex-shrink-0">{list.avatar}</span>}
        <span className="mr-3 pointer-events-auto flex-shrink-0">{getIcon(list.icon, list.type)}</span>
        <span
          className="text-lg font-semibold truncate leading-snug pointer-events-auto min-w-0"
          title={list.title}
        >
          {list.title}
        </span>
        <div className="flex items-center gap-2 ml-auto">
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
              setConfirmDeleteId(list.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500 rounded pointer-events-auto"
            aria-label="Excluir lista"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

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
    </motion.div>
  );
});

const Sidebar: React.FC = () => {
  const { state, setActiveList, deleteList, dispatch } = useListContext();
  const { lists, activeListId } = state;
  const { theme } = useTheme();

  const [starAnimatingId, setStarAnimatingId] = useState<string | null>(null);
  const [pinAnimatingId, setPinAnimatingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // New state for filter and sort
  const [filterText, setFilterText] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  // Filtro simples, sem ordenação
  const filteredLists = useMemo(() => {
    return lists.filter(list => list.title.toLowerCase().includes(filterText.toLowerCase()));
  }, [lists, filterText]);

  // Ordenação visual, usada apenas para exibição quando não está arrastando
  const visuallySortedLists = useMemo(() => {
    if (activeId) return filteredLists; // Se estiver arrastando, não ordena
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
  }, [filteredLists, sortOrder, activeId]);

  const pinnedLists = useMemo(() => {
    if (activeId) return filteredLists.filter(list => list.pinned);
    return visuallySortedLists.filter(list => list.pinned);
  }, [filteredLists, visuallySortedLists, activeId]);

  const nonPinnedLists = useMemo(() => {
    if (activeId) return filteredLists.filter(list => !list.pinned);
    return visuallySortedLists.filter(list => !list.pinned);
  }, [filteredLists, visuallySortedLists, activeId]);

  // Configuração mais simples para o sensor
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  }, []);

  // Implementação completamente nova do handleDragEnd
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    // Se não houver um item "over" ou se for o mesmo item, não fazer nada
    if (!over || active.id === over.id) {
      return;
    }

    // Verificar se ambos os itens não são fixados
    const activeItem = lists.find(item => item.id === active.id);
    const overItem = lists.find(item => item.id === over.id);
    
    if (!activeItem || !overItem || activeItem.pinned || overItem.pinned) {
      return;
    }
    
    // Criar uma cópia das listas e separar fixadas e não fixadas
    const pinnedItems = lists.filter(item => item.pinned);
    const nonPinnedItems = lists.filter(item => !item.pinned);
    
    // Encontrar os índices dos itens não fixados
    const oldIndex = nonPinnedItems.findIndex(item => item.id === active.id);
    const newIndex = nonPinnedItems.findIndex(item => item.id === over.id);
    
    // Reordenar os itens não fixados
    const reorderedNonPinned = arrayMove(nonPinnedItems, oldIndex, newIndex);
    
    // Combinar os itens fixados e não fixados
    const newLists = [...pinnedItems, ...reorderedNonPinned];
    
    // Atualizar o estado
    dispatch({ type: 'REORDER_LISTS', payload: { lists: newLists } });
    
    // Forçar atualização do localStorage
    localStorage.setItem('listApp', JSON.stringify({ ...state, lists: newLists }));
  }, [lists, dispatch, state]);

  const handleDeleteList = (id: string) => {
    try {
      deleteList(id);
      toast.success('Lista excluída com sucesso!');
    } catch (e) {
      toast.error('Erro ao excluir a lista.');
    }
    setConfirmDeleteId(null);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always
        }
      }}
    >
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

        {/* Render pinned lists first */}
        <div className="space-y-3">
          {lists.filter(list => list.pinned).map((list) => (
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
              setConfirmDeleteId={setConfirmDeleteId}
              isDragging={activeId === list.id}
            />
          ))}
        </div>

        {/* Render non-pinned lists in a sortable context */}
        <SortableContext items={lists.filter(list => !list.pinned).map(list => list.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 mt-3">
            {lists.filter(list => !list.pinned).map((list) => (
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
                setConfirmDeleteId={setConfirmDeleteId}
                isDragging={activeId === list.id}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}
          modifiers={[snapCenterToCursor]}
        >
          {activeId ? (
            <SortableItem
              id={activeId}
              list={lists.find(list => list.id === activeId)!}
              activeListId={activeListId}
              theme={theme}
              starAnimatingId={starAnimatingId}
              pinAnimatingId={pinAnimatingId}
              toggleFavorite={toggleFavorite}
              togglePinned={togglePinned}
              setActiveList={setActiveList}
              deleteList={deleteList}
              setConfirmDeleteId={setConfirmDeleteId}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>

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
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 min-w-[320px] max-w-full flex flex-col gap-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold dark:text-gray-100 text-gray-900 mb-2">Excluir lista</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Tem certeza que deseja excluir esta lista?</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteList(confirmDeleteId)}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DndContext>
  );
};

export default Sidebar;
