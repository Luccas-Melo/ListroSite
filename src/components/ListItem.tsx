import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Edit2, Trash2, Image as ImageIcon, Check, Plus, Star, Star as StarIcon, Info } from 'lucide-react';
import { ListItem as ListItemType } from '../types';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';
import { Checkbox } from './ui/Checkbox';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactDOM from 'react-dom';

interface ListItemProps {
  item: ListItemType;
  listId: string;
  viewMode: 'list' | 'cover';
  activeId?: string | number | null;
  level?: number;
  parentItemId?: string;
  listColor?: string;
  animationDelay?: number;
}

const ListItemComponent: React.FC<ListItemProps> = ({ item, listId, viewMode, activeId, level = 0, parentItemId, listColor, animationDelay = 0 }) => {
  const { theme } = useTheme();
  const { toggleItem, deleteItem, updateItem, addItem, togglePriorityItem } = useListContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [showAddSubitem, setShowAddSubitem] = useState(false);
  const [newSubitemContent, setNewSubitemContent] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [infoPopoverPos, setInfoPopoverPos] = useState<{top: number, left: number}>();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({ id: item.id });

  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node);
    setDroppableNodeRef(node as any);
  };

  const style = useMemo(() => {
    const baseTransition = transition || '';
    const combinedTransition = baseTransition
      ? `${baseTransition}, background-color 150ms ease, border-color 150ms ease, opacity 150ms ease`
      : 'background-color 150ms ease, border-color 150ms ease, opacity 150ms ease';
    return {
    transform: CSS.Transform.toString(transform),
    transition: combinedTransition,
    zIndex: isDragging ? 999 : undefined,
    opacity: isOver ? 0.4 : activeId === item.id ? 0.3 : isDragging ? 0.3 : 1,
    border: isOver ? `2px dashed ${listColor || '#84cc16'}` : undefined,
    backgroundColor: isOver ? (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') : undefined,

  };
  }, [transform, transition, isDragging, isOver, activeId, item.id, theme, listColor]);

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
    setConfirmDelete(true);
  }, []);

  const confirmDeleteItem = () => {
    try {
      deleteItem(listId, item.id, parentItemId);
      toast.success('Item excluído com sucesso!');
    } catch (e) {
      toast.error('Erro ao excluir o item.');
    }
    setConfirmDelete(false);
  };

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(item.content);
  }, [item.content]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    if (editContent.trim()) {
      try {
        updateItem(listId, item.id, editContent, previewImage || undefined, parentItemId);
        toast.success('Item editado com sucesso!');
      } catch (error) {
        toast.error('Erro ao editar o item.');
      }
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
      try {
        addItem(listId, newSubitemContent, undefined, item.id);
        toast.success('Subitem adicionado com sucesso!');
      } catch (error) {
        toast.error('Erro ao adicionar subitem.');
      }
      setNewSubitemContent('');
      setShowAddSubitem(false);
    }
  }, [newSubitemContent, addItem, listId, item.id]);

  return (
    <>
      <motion.div
        ref={combinedRef}
        {...attributes}
        {...listeners}
        initial={viewMode === 'cover' ? { opacity: 0, y: 80 } : { opacity: 0, x: -80 }}
        animate={viewMode === 'cover' ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
        exit={viewMode === 'cover' ? { opacity: 0, y: 80 } : { opacity: 0, x: -80 }}
        transition={{ duration: 0.16, ease: 'easeOut', delay: animationDelay }}
        className={clsx(
          'group transition-all duration-200',
          viewMode === 'list' ? [
            'flex items-center p-3 rounded-lg',
            theme === 'dark' ? [
              'border border-gray-700 bg-gray-900/30 hover:bg-gray-900/50 backdrop-blur-md bg-opacity-80',
              item.completed ? 'bg-gray-900/50' : ''
            ] : [
              'bg-white shadow-md hover:shadow-lg',
              item.completed ? 'bg-gray-50' : ''
            ]
          ] : [
            'group relative rounded-lg overflow-hidden',
            theme === 'dark' ? [
              'bg-gray-900/30 hover:bg-gray-900/50 backdrop-blur-md bg-opacity-80',
              'border border-gray-800/50'
            ] : [
              'bg-white shadow-md hover:shadow-lg',
              'border border-gray-200'
            ]
          ],

        )}
        style={{ ...style, backgroundColor: item.listColor || undefined }}
      >
        {viewMode === 'list' || isEditing ? (
          <>
            <div className="mr-2">
              <Checkbox checked={item.completed} onCheckedChange={handleToggle} color={listColor} />
            </div>
            <span className={clsx(
              'flex-grow flex items-center gap-2',
              level > 0 && 'pl-6',
              item.completed
                ? (
                    level === 0
                      ? (theme === 'dark' ? 'text-gray-400 line-through' : 'text-gray-600 line-through')
                      : (theme === 'dark' ? 'text-gray-500 line-through' : 'text-gray-500 line-through')
                  )
                : (
                    level === 0
                      ? (theme === 'dark' ? 'text-gray-100' : 'text-gray-900')
                      : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')
                  )
            )}>
              {item.content}
              <span
                className="relative inline-block"
                onMouseEnter={e => {
                  if (window.innerWidth > 768) {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setInfoPopoverPos({
                      top: rect.bottom + 8,
                      left: rect.left + rect.width / 2
                    });
                    setShowInfoPopover(true);
                  }
                }}
                onMouseLeave={() => { if (window.innerWidth > 768) setShowInfoPopover(false); }}
                onClick={e => {
                  if (window.innerWidth <= 768) {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setInfoPopoverPos({
                      top: rect.bottom + 8,
                      left: rect.left + rect.width / 2
                    });
                    setShowInfoPopover(v => !v);
                  }
                  e.stopPropagation();
                }}
                tabIndex={0}
                aria-label="Ver detalhes do item"
                style={{ cursor: 'pointer' }}
              >
                <Info size={16} className="text-gray-400 hover:text-brandGreen-500 transition" />
                {showInfoPopover && infoPopoverPos && ReactDOM.createPortal(
                  <div
                    className={clsx(
                      'fixed z-[9999] min-w-[180px] rounded-lg p-3 text-sm shadow-lg',
                      window.innerWidth > 768
                        ? (theme === 'dark' ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200')
                        : (theme === 'dark' ? 'bg-gray-900 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-300')
                    )}
                    style={{
                      top: infoPopoverPos.top,
                      left: infoPopoverPos.left,
                      transform: 'translate(-50%, 0)'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div><b>Detalhes:</b></div>
                    <div>Criado em: 10/07/2024</div>
                    {window.innerWidth <= 768 && (
                      <button className="mt-2 px-3 py-1 rounded bg-brandGreen-500 text-white text-xs" onClick={() => setShowInfoPopover(false)}>Fechar</button>
                    )}
                  </div>,
                  document.body
                )}
              </span>
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
              <Checkbox checked={item.completed} onCheckedChange={handleToggle} color={listColor && listColor !== '#84cc16' ? listColor : undefined} />
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

      </motion.div>
      <AnimatePresence>
        {confirmDelete && (
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
              <h3 className="text-lg font-semibold dark:text-gray-100 text-gray-900 mb-2">Excluir item</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Tem certeza que deseja excluir este item?</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteItem}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {viewMode === 'list' && item.children && item.children.length > 0 && (
        <div className="ml-4 space-y-1">
          {item.children.map((child) => (
            <ListItem
              key={child.id}
              item={child}
              listId={listId}
              viewMode={viewMode}
              activeId={activeId}
              level={level + 1}
              parentItemId={item.id}
              listColor={listColor}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const ListItem = React.memo(ListItemComponent);
