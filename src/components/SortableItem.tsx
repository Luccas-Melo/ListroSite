// src/components/SortableItem.tsx

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Star as StarFill, Pin, Pin as PinFill, Trash2 } from 'lucide-react';
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
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'group flex items-center justify-between p-3 rounded-md shadow-sm cursor-pointer transition-colors',
        activeListId === list.id
          ? theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-green-100 text-green-800'
          : theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'
      )}
    >
      <div onClick={() => setActiveList(list.id)} className="flex-1 truncate">
        {list.name}
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
