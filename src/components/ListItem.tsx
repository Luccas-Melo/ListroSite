import React, { useState, useRef, useEffect } from 'react';
import { X, Edit2, Trash2, Image as ImageIcon, Check, Plus } from 'lucide-react';
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
  level?: number;
  parentItemId?: string;
}

const ListItemComponent: React.FC<ListItemProps> = ({ item, listId, viewMode, level = 0, parentItemId }) => {
  const { theme } = useTheme();
  const { toggleItem, deleteItem, updateItem, addItem } = useListContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  // Initialize previewImage only for level 0 items
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  };

  // Update previewImage if item.coverImage changes, only for level 0
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

  const handleToggle = () => {
    toggleItem(listId, item.id, parentItemId);
  };

  const handleDelete = () => {
    deleteItem(listId, item.id, parentItemId);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(item.content);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editContent.trim()) {
      updateItem(listId, item.id, editContent, previewImage || undefined, parentItemId);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (level !== 0) return; // Prevent image upload for subitems
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        updateItem(listId, item.id, editContent, reader.result as string, parentItemId);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (level !== 0) return; // Prevent image removal for subitems
    setPreviewImage(null);
    updateItem(listId, item.id, editContent, undefined, parentItemId);
  };

  const handleAddSubitem = () => {
    if (newSubitemContent.trim()) {
      addItem(listId, newSubitemContent, undefined, item.id);
      setNewSubitemContent('');
      setShowAddSubitem(false);
    }
  };

  return (
    <>
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
            'relative rounded-lg overflow-hidden',
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
        {viewMode === 'list' ? (
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
            {/* Botões de editar, excluir e adicionar subitem no modo lista para todos os níveis */}
            {!isEditing && (
              <div className="ml-2 flex items-center space-x-2">
                {level === 0 && (
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
                )}
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-500"
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
              </div>
            )}
            {/* Formulário para adicionar subitem */}
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
                <div className={clsx(
                  "absolute bottom-0 left-0 w-full bg-black bg-opacity-60 text-white text-sm p-1 truncate"
                )}>
                  {item.content}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={16} className="text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <Checkbox checked={item.completed} onCheckedChange={handleToggle} />
            </div>
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
              </div>
            )}
            {level === 0 && (
              <label className="absolute bottom-2 right-2 p-1 bg-black/50 rounded-lg cursor-pointer" aria-label="Editar capa">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <ImageIcon size={18} className="text-white" />
              </label>
            )}
          </div>
        )}

        {isEditing ? (
          <div className={`flex-grow px-4 ${item.completed ? 'text-gray-500 dark:text-gray-400 line-through' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={clsx(
                'flex-grow p-1 border-b-2 focus:outline-none bg-transparent',
                theme === 'dark' ? [
                  'border-primary-500 text-white placeholder-gray-500'
                ] : [
                  'border-primary-500 text-gray-900 placeholder-gray-400'
                ]
              )}
              placeholder="Editar item..."
            />
            <button
              onClick={handleSave}
              className="ml-2 p-1 text-primary-500 hover:text-primary-700"
              aria-label="Salvar"
            >
              <Check size={18} />
            </button>
            <button
              onClick={handleCancel}
              className="ml-1 p-1 text-gray-400 hover:text-gray-600"
              aria-label="Cancelar"
            >
              <X size={18} />
            </button>
          </div>
        ) : null}

      </div>

      {item.children && item.children.length > 0 && (
        <div className="ml-10 mt-2 space-y-2">
          {item.children.map((child) => (
            <ListItem
              key={child.id}
              item={child}
              listId={listId}
              viewMode={viewMode}
              level={level + 1}
              parentItemId={item.id}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const ListItem = React.memo(ListItemComponent);
