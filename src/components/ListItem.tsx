import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Edit2, Trash2, Image as ImageIcon, Check, Plus, Star, Star as StarIcon } from 'lucide-react';
import { ListItem as ListItemType } from '../types';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';
import { Checkbox } from './ui/Checkbox';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ListItemProps {
  item: ListItemType;
  listId: string;
  viewMode: 'list' | 'cover';
  activeId?: string | number | null;
  level?: number;
  parentItemId?: string;
}

const ListItemComponent: React.FC<ListItemProps> = ({ item, listId, viewMode, activeId, level = 0, parentItemId }) => {
  const { theme } = useTheme();
  const { toggleItem, deleteItem, updateItem, addItem, togglePriorityItem } = useListContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [showAddSubitem, setShowAddSubitem] = useState(false);
  const [newSubitemContent, setNewSubitemContent] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
    opacity: activeId === item.id ? 0.5 : isDragging ? 0.5 : 1,
  }), [transform, transition, isDragging, activeId, item.id]);

  useEffect(() => {
    if (level === 0) {
      setPreviewImage(item.coverImage || null);
    } else {
      setPreviewImage(null);
    }
  }, [item.coverImage, level]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggle = useCallback(() => {
    toggleItem(listId, item.id, parentItemId);
  }, [toggleItem, listId, item.id, parentItemId]);

  const handleDelete = useCallback(() => {
    deleteItem(listId, item.id, parentItemId);
  }, [deleteItem, listId, item.id, parentItemId]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(item.content);
  }, [item.content]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    if (editContent.trim()) {
      updateItem(listId, item.id, editContent, previewImage || undefined, parentItemId);
    }
    setIsEditing(false);
  }, [editContent, updateItem, listId, item.id, previewImage, parentItemId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (level !== 0) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        updateItem(listId, item.id, editContent, reader.result as string, parentItemId);
      };
      reader.readAsDataURL(file);
    }
  }, [level, updateItem, listId, item.id, editContent, parentItemId]);

  const handleRemoveImage = useCallback(() => {
    if (level !== 0) return;
    setPreviewImage(null);
    updateItem(listId, item.id, editContent, undefined, parentItemId);
  }, [level, updateItem, listId, item.id, editContent, parentItemId]);

  const handleAddSubitem = useCallback(() => {
    if (newSubitemContent.trim()) {
      addItem(listId, newSubitemContent, undefined, item.id);
      setNewSubitemContent('');
      setShowAddSubitem(false);
    }
  }, [newSubitemContent, addItem, listId, item.id]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={clsx(
        'group transition-all duration-200',
        viewMode === 'list' ? [
          'flex items-center p-3 rounded-lg',
          theme === 'dark' ? [
            'border border-gray-700 bg-gray-900/30 hover:bg-gray-900/50 backdrop-blur-md bg-opacity-80',
            item.completed ? 'bg-gray-900/50' : ''
          ] : [
            'border border-gray-200 bg-white/80 hover:bg-gray-50 backdrop-blur-md bg-opacity-80',
            item.completed ? 'bg-gray-50' : ''
          ]
        ] : [
          'group relative rounded-lg overflow-hidden',
          theme === 'dark' ? [
            'bg-gray-900/30 hover:bg-gray-900/50 backdrop-blur-md bg-opacity-80',
            'border border-gray-800/50'
          ] : [
            'bg-white hover:bg-gray-50 backdrop-blur-md bg-opacity-80',
            'border border-gray-200'
          ]
        ],
        { 'pl-10': level > 0 },
        { [`pl-${level * 10}`]: level > 0 }
      )}
      style={{ ...style, paddingLeft: `${level * 2.5}rem` }}
    >
      {viewMode === 'list' || isEditing ? (
        <>
          <div className="mr-3 ml-1">
            <Checkbox checked={item.completed} onCheckedChange={handleToggle} />
          </div>
          <span
            className={clsx(
              'flex-grow',
              item.completed ? [
                'line-through',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              ] : [
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              ]
            )}
          >
            {item.content}
          </span>
          {isEditing ? (
            <div className="flex items-center space-x-2 flex-grow">
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className={clsx(
                  'flex-grow p-1 border-b-2 focus:outline-none bg-transparent rounded backdrop-blur-md bg-opacity-80',
                  theme === 'dark' ? 'border-primary-500 text-white placeholder-gray-500' : 'border-primary-500 text-gray-900 placeholder-gray-400'
                )}
                autoFocus
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className={clsx(
                  'p-1 text-green-600 hover:text-green-800',
                  theme === 'dark' ? 'text-green-400 hover:text-green-600' : 'text-green-600 hover:text-green-800'
                )}
                aria-label="Salvar alteração"
              >
                <Check size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className={clsx(
                  'p-1 text-red-600 hover:text-red-800',
                  theme === 'dark' ? 'text-red-400 hover:text-red-600' : 'text-red-600 hover:text-red-800'
                )}
                aria-label="Descartar alteração"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {level === 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className={clsx(
                    'p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700',
                    theme === 'dark' ? 'text-gray-400 hover:text-primary-400' : 'text-gray-600 hover:text-primary-600'
                  )}
                  aria-label="Editar item"
                >
                  <Edit2 size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500"
                aria-label="Excluir item"
              >
                <Trash2 size={16} />
              </button>
              {level === 0 && (
                <button
                  onClick={() => setShowAddSubitem(true)}
                  className={clsx(
                    'text-primary-500 hover:text-primary-700 flex items-center justify-center w-6 h-6 rounded-full'
                  )}
                  aria-label="Adicionar subitem"
                >
                  <Plus size={16} />
                </button>
              )}
              {level === 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePriorityItem(listId, item.id);
                  }}
                  className={clsx(
                    'p-1 rounded-md transition-colors',
                    item.priority ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'
                  )}
                  aria-label={item.priority ? 'Remover prioridade' : 'Marcar como prioridade'}
                >
                  <StarIcon size={16} fill={item.priority ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          )}
          {showAddSubitem && (
            <div className="ml-2 flex items-center gap-2">
              <input
                type="text"
                value={newSubitemContent}
                onChange={(e) => setNewSubitemContent(e.target.value)}
                placeholder="Novo subitem"
                className={clsx(
                  'p-1 border-b-2 focus:outline-none bg-transparent rounded backdrop-blur-md bg-opacity-80',
                  theme === 'dark' ? 'border-primary-500 text-white placeholder-gray-500' : 'border-primary-500 text-gray-900 placeholder-gray-400'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubitem();
                  } else if (e.key === 'Escape') {
                    setShowAddSubitem(false);
                    setNewSubitemContent('');
                  }
                }}
              />
              <button
                onClick={handleAddSubitem}
                className="p-1 text-primary-500 hover:text-primary-700"
                aria-label="Confirmar adição"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => {
                  setShowAddSubitem(false);
                  setNewSubitemContent('');
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Cancelar adição"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={clsx(
          "relative w-[200px] h-[300px]",
          item.completed ? "" : ""
        )}>
          {previewImage && level === 0 ? (
            <>
              <img
                src={previewImage}
                alt={item.content}
                className={clsx(
                  "w-full h-full object-cover",
                  item.completed && "opacity-50"
                )}
              />
              {isEditing ? (
                <div
                  className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 backdrop-blur-md rounded-xl p-6 max-w-[95%] mx-auto shadow-lg sm:max-w-md sm:p-8 transition-opacity duration-500"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`edit-item-${item.id}`}
                  tabIndex={-1}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      handleCancel();
                    }
                  }}
                >
                  <input
                    id={`edit-item-${item.id}`}
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSave();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancel();
                      }
                    }}
                    className={clsx(
                      'w-full p-2 rounded text-white placeholder-gray-400 text-xl font-semibold focus:outline-none bg-black bg-opacity-40 border-b-4 border-primary-600',
                      theme === 'dark' ? 'border-primary-600' : 'border-primary-600'
                    )}
                    autoFocus
                  />
                  <div className="mt-4 w-full text-gray-400 text-sm italic truncate">
                    {item.content}
                  </div>
                  <div className="mt-6 w-full flex justify-end space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                      }}
                      className="p-2 text-green-600 hover:text-green-900 rounded-lg border-2 border-green-600 hover:border-green-900 transition flex items-center shadow-md"
                      aria-label="Salvar alteração"
                      type="button"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                      }}
                      className="p-2 text-red-600 hover:text-red-900 rounded-lg border-2 border-red-600 hover:border-red-900 transition flex items-center shadow-md"
                      aria-label="Descartar alteração"
                      type="button"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={clsx(
                    "absolute bottom-0 left-0 w-full bg-black bg-opacity-60 text-white text-sm p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-lg"
                  )}>
                    {item.content}
                  </div>
                  
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900">
              <ImageIcon size={16} className="text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Checkbox checked={item.completed} onCheckedChange={handleToggle} />
          </div>
          {level === 0 && (
            <div className="absolute bottom-2 right-2">
              <label className="cursor-pointer p-1 text-gray-300 hover:text-primary-400 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ImageIcon size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
          {level === 0 && (
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleEdit}
                className={clsx(
                  'p-1',
                  theme === 'dark' ? 'text-gray-400 hover:text-primary-400' : 'text-gray-400 hover:text-primary-600'
                )}
                aria-label="Editar item"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label="Excluir item"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePriorityItem(listId, item.id);
                }}
                className={clsx(
                  'p-1 transition-colors',
                  item.priority ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'
                )}
                aria-label={item.priority ? 'Remover prioridade' : 'Marcar como prioridade'}
              >
                <StarIcon size={16} fill={item.priority ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export const ListItem = React.memo(ListItemComponent);
