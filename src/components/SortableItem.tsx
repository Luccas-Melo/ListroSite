// src/components/SortableItem.tsx

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Star as StarFill, Pin, Pin as PinFill, Trash2, GripVertical } from 'lucide-react';
import clsx from 'clsx';
import { ListType } from '../types';

interface Props {
  id: string;
  list: ListType;
  activeListId: string | null;
  theme: string;
  starAnimatingId: string | null;
  pinAnimatingId: string | null;
  toggleFavorite: (id: string) => void;
  togglePinned: (id: string) => void;
  setActiveList: (id: string) => void;
  deleteList: (id: string) => void;
}

const SortableItem: React.FC<Props> = ({
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: list.pinned 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const handleItemClick = (e: React.MouseEvent) => {
    // Verificar se o clique não veio de um botão ou handle
    if (
      (e.target as HTMLElement).tagName !== 'BUTTON' &&
      !(e.target as HTMLElement).closest('button') &&
      !(e.target as HTMLElement).closest('[data-drag-handle="true"]')
    ) {
      setActiveList(list.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleItemClick}
      className={clsx(
        'group flex items-center justify-between p-3 rounded-md transition-colors',
        theme === 'dark'
          ? 'shadow-md bg-gray-800/80 text-white'
          : 'shadow-lg bg-white text-gray-900 border border-gray-300',
        activeListId === list.id
          ? theme === 'dark' ? 'ring-2 ring-brandGreen-500' : 'ring-2 ring-brandGreen-500'
          : ''
      )}
    >
      {!list.pinned && (
        <div 
          {...attributes} 
          {...listeners}
          data-drag-handle="true"
          className="mr-2 cursor-grab hover:text-green-500"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      
      <div className="flex-1 truncate">
        {list.title}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => toggleFavorite(list.id)} className="p-1">
          {list.favorite ? (
            <StarFill className={clsx('w-4 h-4', starAnimatingId === list.id && 'animate-ping')} fill="gold" />
          ) : (
            <Star className="w-4 h-4" />
          )}
        </button>

        <button onClick={() => togglePinned(list.id)} className="p-1">
          {list.pinned ? (
            <PinFill className={clsx('w-4 h-4', pinAnimatingId === list.id && 'animate-ping')} />
          ) : (
            <Pin className="w-4 h-4" />
          )}
        </button>

        <button onClick={() => deleteList(list.id)} className="p-1">
          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
        </button>
      </div>
    </div>
  );
};

export default SortableItem;
