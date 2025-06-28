import React, { useState } from 'react';
import { Tag } from '../types';
import { Film, Tv, MapPin, PenTool, Book, Plus, Gamepad, Globe, Music, Camera, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import { ListItem } from './ListItem';
import { Checkbox } from './ui/Checkbox';
import clsx from 'clsx';
import { FilterModal } from './FilterModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ListDetail: React.FC = () => {
  const { viewMode, theme } = useTheme();
  const { 
    state,
    getActiveList, 
    reorderItems, 
    addItem, 
    updateList, 
    toggleItem, 
    deleteItem, 
    updateItem, 
    toggleViewMode 
  } = useListContext();
  const activeList = getActiveList()!;
  const [newItem, setNewItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTags, setEditTags] = useState<Tag[]>(activeList?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [editTitle, setEditTitle] = useState(activeList?.title || '');
  const [editIcon, setEditIcon] = useState<string>(activeList?.icon || 'Plus');
  const [editColor, setEditColor] = useState<string>(activeList?.color || '#84cc16');
  const [activeId, setActiveId] = useState<string | number | null>(null);
  // Filtros e ordenação dos itens
  // "null" indica ordem manual (sem ordenação automática)
  const [itemSortOrder, setItemSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showCompleted, setShowCompleted] = useState<boolean | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Função para filtrar e ordenar os itens da lista
  const filteredAndSortedItems = React.useMemo(() => {
    if (!activeList) return [];
    let items = [...activeList.items];
    if (showCompleted !== null) {
      items = items.filter(item => !!item.completed === showCompleted);
    }
    if (itemSortOrder) {
      items = [...items].sort((a, b) =>
        itemSortOrder === 'asc'
          ? a.content.localeCompare(b.content)
          : b.content.localeCompare(a.content)
      );
    }
    return items;
  }, [activeList, itemSortOrder, showCompleted]);

  if (!activeList) {
    return null;
  }

  const predefinedIcons: { name: string; icon: React.ReactNode }[] = [
    { name: 'Film', icon: <Film size={24} /> },
    { name: 'Tv', icon: <Tv size={24} /> },
    { name: 'MapPin', icon: <MapPin size={24} /> },
    { name: 'PenTool', icon: <PenTool size={24} /> },
    { name: 'Book', icon: <Book size={24} /> },
    { name: 'Gamepad', icon: <Gamepad size={24} /> },
    { name: 'Globe', icon: <Globe size={24} /> },
    { name: 'Music', icon: <Music size={24} /> },
    { name: 'Camera', icon: <Camera size={24} /> },
    { name: 'Plus', icon: <Plus size={24} /> },
  ];

  const getIcon = (type: string, iconName?: string) => {
    if (type === 'custom' && iconName) {
      const found = predefinedIcons.find((i) => i.name === iconName);
      if (found) return found.icon;
    }
    switch (type) {
      case 'movies':
        return <Film size={24} />;
      case 'shows':
        return <Tv size={24} />;
      case 'places':
        return <MapPin size={24} />;
      case 'drawings':
        return <PenTool size={24} />;
      case 'books':
        return <Book size={24} />;
      case 'games':
        return <Gamepad size={24} />;
      case 'travel':
        return <Globe size={24} />;
      case 'music':
        return <Music size={24} />;
      case 'photography':
        return <Camera size={24} />;
      default:
        return <Plus size={24} />;
    }
  };

  const getTypeColor = (type: string, color?: string) => {
    if (color) {
      return {
        backgroundColor: color + '33', // 20% opacity
        color: color,
      };
    }
    switch (type) {
      case 'movies':
        return { backgroundColor: '#bfdbfe', color: '#1e40af' };
      case 'shows':
        return { backgroundColor: '#dcfce7', color: '#15803d' };
      case 'places':
        return { backgroundColor: '#dcfce7', color: '#15803d' };
      case 'drawings':
        return { backgroundColor: '#fef3c7', color: '#b45309' };
      case 'books':
        return { backgroundColor: '#fecdd3', color: '#be123c' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      try {
        addItem(activeList.id, newItem.trim());
        toast.success('Item adicionado com sucesso!');
        setNewItem('');
      } catch (error) {
        toast.error('Erro ao adicionar item.');
      }
    }
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      try {
        updateList(activeList.id, editTitle.trim(), editIcon, undefined, editTags, undefined, undefined, editColor);
        toast.success('Lista editada com sucesso!');
        setIsEditing(false);
      } catch (error) {
        toast.error('Erro ao editar a lista.');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(activeList.title);
    setEditIcon(activeList.icon || 'Plus');
    setEditTags(activeList.tags || []);
    setTagInput('');
    setEditColor(activeList.color || '#84cc16');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id) {
      return;
    }

    try {
      // Reordenar usando o array completo para não perder itens filtrados
      const allItems = [...activeList.items];
      
      // Encontrar os índices nos itens filtrados
      const oldIndex = allItems.findIndex(item => item.id === active.id);
      const newIndex = allItems.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrderedItems = arrayMove(allItems, oldIndex, newIndex);
        reorderItems(activeList.id, newOrderedItems);
        // Após um drag manual, manter ordem manual
        setItemSortOrder(null);
      }
    } catch (error) {
      console.error("Erro ao reordenar itens:", error);
      toast.error('Erro ao reordenar itens. Tente novamente.');
    }
  };

  const isStaggered = activeList.items.length <= 20;

  return (
    <div className="flex-grow p-0 max-w-[670px] mx-auto">
      <div
        className={clsx(
          'rounded-xl overflow-hidden',
          theme === 'dark' ? 'bg-gray-800 shadow-md' : 'bg-white shadow-lg'
        )}
      >
        <div
          className={clsx(
            'p-6 border-b',
            theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
          )}
        >
          <div className="flex items-center mb-4">
            <span
              className="p-2 rounded-lg mr-3"
              style={
                activeList.color && activeList.color !== '#84cc16'
                  ? getTypeColor(activeList.type, activeList.color)
                  : getTypeColor(activeList.type)
              }
            >
              {getIcon(activeList.type, activeList.icon)}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={clsx(
                  'text-2xl font-bold rounded p-1',
                  theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800'
                )}
              />
            ) : (
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                {activeList.title}
              </h2>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={clsx(
                  'ml-4 px-2 py-1 text-sm rounded',
                  {
                    'bg-brandGreen-500 text-white hover:bg-brandGreen-600': !activeList.color || activeList.color === '#84cc16',
                    'text-white': activeList.color && activeList.color !== '#84cc16',
                  }
                )}
                style={activeList.color && activeList.color !== '#84cc16' ? { backgroundColor: activeList.color } : undefined}
              >
                Editar
              </button>
            )}
          </div>

          {isEditing && (
            <div className="mb-4">
              <label className={clsx('block mb-1', theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
                Selecione um ícone
              </label>
              <div className="grid grid-cols-3 gap-3">
                {predefinedIcons.map(({ name, icon }) => (
                  <button
                    key={name}
                    type="button"
                    className={clsx(
                      'p-3 border-2 rounded-md flex items-center justify-center transition-all duration-200',
                      editIcon === name
                        ? (activeList.color && activeList.color !== '#84cc16'
                          ? undefined
                          : theme === 'dark'
                            ? 'border-brandGreen-500 bg-brandGreen-500/10 text-brandGreen-400'
                            : 'border-brandGreen-500 bg-brandGreen-50 text-brandGreen-700')
                        : (theme === 'dark'
                          ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                          : 'border-gray-300 hover:bg-gray-50')
                    )}
                    onClick={() => setEditIcon(name)}
                    style={
                      editIcon === name && activeList.color && activeList.color !== '#84cc16'
                        ? {
                            borderColor: activeList.color,
                            backgroundColor: 'transparent',
                            color: activeList.color,
                          }
                        : undefined
                    }
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <label className={clsx('block mt-4 mb-1', theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editTags.map(tag => (
                  <span key={tag.id} className="flex items-center gap-1 px-2 py-0.5 text-sm bg-gray-300 dark:bg-gray-700 rounded">
                    {tag.name}
                    <button type="button" onClick={() => setEditTags(editTags.filter(t => t.id !== tag.id))} className="text-xs ml-1">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tagInput.trim()) {
                        setEditTags([...editTags, { id: Math.random().toString(36).substring(2,9), name: tagInput.trim() }]);
                        setTagInput('');
                      }
                    }
                  }}
                  placeholder="Nova tag"
                  className={clsx('flex-1 border rounded px-2 py-1', theme==='dark' ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300')}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tagInput.trim()) {
                      setEditTags([...editTags, { id: Math.random().toString(36).substring(2,9), name: tagInput.trim() }]);
                      setTagInput('');
                    }
                  }}
                  className="px-3 py-1 rounded bg-brandGreen-500 text-white text-sm"
                >Adicionar</button>
              </div>

              <label className={clsx('block mt-4 mb-1', theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
                Selecione uma cor
              </label>
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-full h-10 rounded border border-gray-300"
              />

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleSave}
                  className={clsx(
                    'px-4 py-2 rounded',
                    activeList.color && activeList.color !== '#84cc16'
                      ? 'bg-transparent text-white hover:opacity-80'
                      : 'bg-brandGreen-500 text-white hover:bg-brandGreen-600'
                  )}
                  style={activeList.color && activeList.color !== '#84cc16' ? { backgroundColor: activeList.color } : undefined}
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className={clsx(
                    'px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400'
                  )}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Botão para abrir modal de filtros */}
<div className={clsx(
  'mb-6 flex justify-end',
)}>
  {/* Utilitário para escurecer a cor personalizada */}
  {activeList.color && activeList.color !== '#84cc16' && (
    <style>{`
      .btn-filtros-custom {
        background: ${activeList.color} !important;
        border: none !important;
        transition: filter 0.2s;
      }
      .btn-filtros-custom:hover {
        filter: brightness(0.85) !important;
      }
    `}</style>
  )}
  <button
    type="button"
    onClick={() => setShowFilterModal(true)}
    className={clsx(
      'flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold shadow transition',
      activeList.color && activeList.color !== '#84cc16' ? 'btn-filtros-custom' : 'bg-brandGreen-500 hover:bg-brandGreen-600'
    )}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" /></svg>
    Filtros
  </button>
</div>

<FilterModal
  isOpen={showFilterModal}
  onClose={() => setShowFilterModal(false)}
  itemSortOrder={itemSortOrder}
  setItemSortOrder={setItemSortOrder}
  showCompleted={showCompleted}
  setShowCompleted={setShowCompleted}
  filterColor={activeList.color}
/>


<form onSubmit={handleAddItem} className="flex flex-col gap-4">
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newItem.trim()) {
                      e.preventDefault();
                      handleAddItem(e);
                    }
                  }}
                  placeholder="Adicionar novo item..."
                  className={clsx(
                    'flex-1 p-3 rounded-lg border-2 focus:outline-none transition-all duration-200',
                    theme === 'dark' ? [
                      'bg-gray-900/50 border-gray-700/50 text-gray-100',
                      'placeholder-gray-500',
                      'hover:border-gray-600/50'
                    ] : [
                      'bg-white border-gray-200 text-gray-900',
                      'placeholder-gray-400',
                      'hover:border-gray-300'
                    ]
                  )}
                  style={
                    activeList.color && activeList.color !== '#84cc16'
                      ? {
                          borderColor: activeList.color,
                          boxShadow: `0 0 0 1px ${activeList.color}`,
                          outlineColor: activeList.color,
                        }
                      : undefined
                  }
                />
                <button
                  type="submit"
                  disabled={!newItem.trim()}
                  className={clsx(
                    'px-4 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed',
                    theme === 'dark' ? [
                      'text-white border border-transparent bg-brandGreen-600',
                      'hover:shadow-lg',
                      'disabled:hover:shadow-none'
                    ] : [
                      'text-white border border-transparent bg-brandGreen-600',
                      'hover:shadow-md',
                      'disabled:hover:shadow-none'
                    ]
                  )}
                  style={
                    activeList.color && activeList.color !== '#84cc16'
                      ? { backgroundColor: activeList.color }
                      : undefined
                  }
                >
                  Adicionar
                </button>
              </div>
            </div>
          </form>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <SortableContext items={activeList.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {activeList.items.length === 0 ? (
                <div
                  className={clsx(
                    'p-8 text-center',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}
                >
                  Nenhum item ainda. Adicione seu primeiro item acima!
                </div>
              ) : viewMode === 'cover' ? (
                <div className="grid grid-cols-3 gap-4 p-4">
                  {filteredAndSortedItems.map((item, idx) => (
                    <div key={item.id}>
                      <ListItem
                        key={item.id}
                        item={item}
                        listId={activeList.id}
                        viewMode={viewMode}
                        activeId={activeId}
                        listColor={activeList.color}
                        animationDelay={isStaggered ? idx * 0.04 : 0}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAndSortedItems.map((item, idx) => (
                    <div key={item.id}>
                      <ListItem
                        key={item.id}
                        item={item}
                        listId={activeList.id}
                        viewMode={viewMode}
                        activeId={activeId}
                        listColor={activeList.color}
                        animationDelay={isStaggered ? idx * 0.04 : 0}
                      />
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </SortableContext>
          <DragOverlay modifiers={[snapCenterToCursor]}>
            {activeId ? (
              viewMode === 'cover' ? (
                <div className={clsx(
                  'relative w-[200px] h-[300px] rounded-lg shadow-lg select-none',
                  theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                )}>
                  {activeList.items.find(i => i.id === activeId)?.coverImage ? (
                    <>
                      <img
                        src={activeList.items.find(i => i.id === activeId)?.coverImage}
                        alt={activeList.items.find(i => i.id === activeId)?.content}
                        className={clsx(
                          "w-full h-full object-cover rounded-lg opacity-70",
                          activeList.items.find(i => i.id === activeId)?.completed && "opacity-50"
                        )}
                      />
                      <div className={clsx(
                        "absolute bottom-0 left-0 w-full bg-black bg-opacity-60 text-white text-sm p-1 truncate rounded-b-lg"
                      )}>
                        {activeList.items.find(i => i.id === activeId)?.content}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
                      No Image
                    </div>
                  )}
                </div>
              ) : (
                <div className={clsx(
                  'group transition-all duration-200 flex items-center p-3 rounded-lg shadow-lg select-none',
                  theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                )}>
                <Checkbox
                  checked={activeList.items.find(i => i.id === activeId)?.completed}
                  color={activeList.color && activeList.color !== '#84cc16' ? activeList.color : undefined}
                />
                  <span className="ml-3">{activeList.items.find(i => i.id === activeId)?.content}</span>
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default ListDetail;
