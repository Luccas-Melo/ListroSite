import React, { useState } from 'react';
import { Film, Tv, MapPin, PenTool, Book, Plus, Gamepad, Globe, Music, Camera } from 'lucide-react';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import ListItem from './ListItem';
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
} from '@dnd-kit/sortable';

const ListDetail: React.FC = () => {
  const { getActiveList, addItem, updateList, reorderItems } = useListContext();
  const { viewMode, theme } = useTheme();
  const activeList = getActiveList();
  const [newItem, setNewItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(activeList?.title || '');
  const [editIcon, setEditIcon] = useState<string>(activeList?.icon || 'Plus');
  const [editAvatar, setEditAvatar] = useState<string>(activeList?.avatar || '');
  const [editTags, setEditTags] = useState<string>(activeList?.tags ? activeList.tags.join(', ') : '');

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'movies':
        return 'bg-blue-100 text-blue-700';
      case 'shows':
        return 'bg-brandGreen-100 text-brandGreen-700';
      case 'places':
        return 'bg-brandGreen-100 text-brandGreen-700';
      case 'drawings':
        return 'bg-amber-100 text-amber-700';
      case 'books':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      addItem(activeList.id, newItem.trim());
      setNewItem('');
    }
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      updateList(activeList.id, editTitle.trim(), editIcon);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(activeList.title);
    setEditIcon(activeList.icon || 'Plus');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeList.items.findIndex(item => item.id === active.id);
      const newIndex = activeList.items.findIndex(item => item.id === over.id);
      const newItems = arrayMove(activeList.items, oldIndex, newIndex);
      reorderItems(activeList.id, newItems);
    }
  };

  return (
    <div className="flex-grow p-4 md:p-6 max-w-3xl mx-auto">
      <div
        className={clsx(
          'rounded-xl shadow-sm overflow-hidden',
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )}
      >
        <div
          className={clsx(
            'p-6 border-b',
            theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
          )}
        >
          <div className="flex items-center mb-4">
            <span className={`p-2 rounded-lg mr-3 ${getTypeColor(activeList.type)}`}>
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
            {activeList.type === 'custom' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={clsx(
                  'ml-4 px-2 py-1 text-sm rounded bg-brandGreen-500 text-white hover:bg-brandGreen-600'
                )}
              >
                Editar
              </button>
            )}
          </div>
            {isEditing && activeList.type === 'custom' && (
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
                          ? (theme === 'dark'
                            ? 'border-brandGreen-500 bg-brandGreen-500/10 text-brandGreen-400'
                            : 'border-brandGreen-500 bg-brandGreen-50 text-brandGreen-700')
                          : (theme === 'dark'
                            ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                            : 'border-gray-300 hover:bg-gray-50')
                      )}
                      onClick={() => setEditIcon(name)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className={clsx('block mb-1', theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
                    Avatar / Emoji
                  </label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="Ex: 😀, 🚀, 🏆"
                    className={clsx(
                      'w-full px-3 py-2 border-2 rounded-md focus:outline-none transition-all duration-200',
                      theme === 'dark' ? [
                        'bg-gray-800 border-gray-700 text-gray-100',
                        'placeholder-gray-500',
                        'focus:border-brandGreen-500/50 focus:bg-gray-800/90',
                        'hover:border-gray-600'
                      ] : [
                        'bg-white border-gray-300 text-gray-900',
                        'placeholder-gray-400',
                        'focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-500/20',
                        'hover:border-gray-400'
                      ]
                    )}
                  />
                </div>

                <div className="mb-4">
                  <label className={clsx('block mb-1', theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Ex: trabalho, mercado, urgente"
                    className={clsx(
                      'w-full px-3 py-2 border-2 rounded-md focus:outline-none transition-all duration-200',
                      theme === 'dark' ? [
                        'bg-gray-800 border-gray-700 text-gray-100',
                        'placeholder-gray-500',
                        'focus:border-brandGreen-500/50 focus:bg-gray-800/90',
                        'hover:border-gray-600'
                      ] : [
                        'bg-white border-gray-300 text-gray-900',
                        'placeholder-gray-400',
                        'focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-500/20',
                        'hover:border-gray-400'
                      ]
                    )}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleSave}
                    className={clsx(
                      'px-4 py-2 rounded bg-brandGreen-500 text-white hover:bg-brandGreen-600'
                    )}
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
                      'focus:border-brandGreen-500/50 focus:bg-gray-900/70',
                      'hover:border-gray-600/50'
                    ] : [
                      'bg-white border-gray-200 text-gray-900',
                      'placeholder-gray-400',
                      'focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-500/20',
                      'hover:border-gray-300'
                    ]
                  )}
                />
                <button
                  type="submit"
                  disabled={!newItem.trim()}
                  className={clsx(
                    'px-4 py-2 rounded-lg transition-all duration-200 font-medium',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                      theme === 'dark' ? [
                      'bg-brandGreen-500 text-white',
                      'hover:bg-brandGreen-600 hover:shadow-lg hover:shadow-brandGreen-500/20',
                      'disabled:hover:bg-brandGreen-500 disabled:hover:shadow-none'
                    ] : [
                      'bg-brandGreen-600 text-white border border-brandGreen-700',
                      'hover:bg-brandGreen-700 hover:shadow-md',
                      'disabled:hover:bg-brandGreen-600 disabled:hover:shadow-none'
                    ]
                  )}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </form>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={activeList.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
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
    {activeList.items.map((item) => (
      <ListItem key={item.id} item={item} listId={activeList.id} viewMode={viewMode} />
    ))}
  </div>
) : (
  <div className="divide-y">
    {activeList.items.map((item) => (
      <ListItem key={item.id} item={item} listId={activeList.id} viewMode={viewMode} />
    ))}
  </div>
)}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default ListDetail;
