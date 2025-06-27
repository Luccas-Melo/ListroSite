import React, { useState } from 'react';
import clsx from 'clsx';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemSortOrder: 'asc' | 'desc';
  setItemSortOrder: (v: 'asc' | 'desc') => void;
  showCompleted: boolean | null;
  setShowCompleted: (v: boolean | null) => void;
  filterColor?: string;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  itemSortOrder,
  setItemSortOrder,
  showCompleted,
  setShowCompleted,
  filterColor,
}) => {
  const [selectedNullButton, setSelectedNullButton] = useState<'nenhum' | 'todos' | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {filterColor && filterColor !== '#84cc16' && (
        <style>{`
          .filter-btn-active-custom {
            background: ${filterColor} !important;
            border: none !important;
            color: #fff !important;
            filter: brightness(0.95) !important;
          }
          .filter-btn-active-custom:hover {
            filter: brightness(0.85) !important;
          }
        `}</style>
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className={clsx(
          'bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 min-w-[320px] max-w-full',
          'flex flex-col gap-6'
        )}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold dark:text-gray-100">Filtros</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <span className={clsx('block text-xs font-medium mb-1', 'text-gray-600 dark:text-gray-300')}>Ordenação</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setItemSortOrder('asc')}
                className={clsx(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium transition',
                  itemSortOrder === 'asc'
                    ? filterColor && filterColor !== '#84cc16'
                      ? 'filter-btn-active-custom' : 'bg-brandGreen-500 text-white border-brandGreen-500 shadow'
                    : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100',
                  'dark:text-gray-100 dark:hover:bg-gray-800 dark:border-gray-600',
                  itemSortOrder === 'asc' && filterColor && filterColor !== '#84cc16' && 'filter-btn-active-custom'
                )}
                style={itemSortOrder === 'asc' && filterColor && filterColor !== '#84cc16' ? {
                  background: filterColor,
                  border: 'none',
                  color: '#fff',
                  filter: 'brightness(0.95)',
                } : {}}
                aria-label="Ordenar A-Z"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 17v-6m0 0V7m0 4H8m8 0H8m0 0v6m0-6V7" /></svg>
                A-Z
              </button>
              <button
                type="button"
                onClick={() => setItemSortOrder('desc')}
                className={clsx(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium transition',
                  itemSortOrder === 'desc'
                    ? filterColor && filterColor !== '#84cc16'
                      ? 'filter-btn-active-custom' : 'bg-brandGreen-500 text-white border-brandGreen-500 shadow'
                    : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100',
                  'dark:text-gray-100 dark:hover:bg-gray-800 dark:border-gray-600',
                  itemSortOrder === 'desc' && filterColor && filterColor !== '#84cc16' && 'filter-btn-active-custom'
                )}
                style={itemSortOrder === 'desc' && filterColor && filterColor !== '#84cc16' ? {
                  background: filterColor,
                  border: 'none',
                  color: '#fff',
                  filter: 'brightness(0.95)',
                } : {}}
                aria-label="Ordenar Z-A"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v6m0 0v4m0-4h8m-8 0h8m0 0v-6m0 6v4" /></svg>
                Z-A
              </button>
            </div>
          </div>
          <div>
            <span className={clsx('block text-xs font-medium mb-1', 'text-gray-600 dark:text-gray-300')}>Status</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowCompleted(null); setSelectedNullButton('nenhum'); }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition',
                  showCompleted === null && selectedNullButton === 'nenhum'
                    ? filterColor && filterColor !== '#84cc16'
                      ? 'filter-btn-active-custom' : 'bg-brandGreen-500 text-white border-brandGreen-500 shadow'
                    : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100',
                  'dark:text-gray-100 dark:hover:bg-gray-800 dark:border-gray-600',
                  showCompleted === null && selectedNullButton === 'nenhum' && filterColor && filterColor !== '#84cc16' && 'filter-btn-active-custom'
                )}
                style={showCompleted === null && selectedNullButton === 'nenhum' && filterColor && filterColor !== '#84cc16' ? {
                  background: filterColor,
                  border: 'none',
                  color: '#fff',
                  filter: 'brightness(0.95)',
                } : {}}
              >
                Nenhum
              </button>
              <button
                type="button"
                onClick={() => { setShowCompleted(null); setSelectedNullButton('todos'); }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition',
                  showCompleted === null && selectedNullButton === 'todos'
                    ? filterColor && filterColor !== '#84cc16'
                      ? 'filter-btn-active-custom' : 'bg-brandGreen-500 text-white border-brandGreen-500 shadow'
                    : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100',
                  'dark:text-gray-100 dark:hover:bg-gray-800 dark:border-gray-600',
                  showCompleted === null && selectedNullButton === 'todos' && filterColor && filterColor !== '#84cc16' && 'filter-btn-active-custom'
                )}
                style={showCompleted === null && selectedNullButton === 'todos' && filterColor && filterColor !== '#84cc16' ? {
                  background: filterColor,
                  border: 'none',
                  color: '#fff',
                  filter: 'brightness(0.95)',
                } : {}}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => { setShowCompleted(false); setSelectedNullButton(null); }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition',
                  showCompleted === false
                    ? filterColor && filterColor !== '#84cc16'
                      ? 'filter-btn-active-custom' : 'bg-yellow-500 text-white border-yellow-500 shadow'
                    : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100',
                  'dark:text-gray-100 dark:hover:bg-gray-800 dark:border-gray-600',
                  showCompleted === false && filterColor && filterColor !== '#84cc16' && 'filter-btn-active-custom'
                )}
                style={showCompleted === false && filterColor && filterColor !== '#84cc16' ? {
                  background: filterColor,
                  border: 'none',
                  color: '#fff',
                  filter: 'brightness(0.95)',
                } : {}}
              >
                Não completos
              </button>
              <button
                type="button"
                onClick={() => { setShowCompleted(true); setSelectedNullButton(null); }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition',
                  showCompleted === true
                    ? filterColor && filterColor !== '#84cc16'
                      ? 'filter-btn-active-custom' : 'bg-blue-500 text-white border-blue-500 shadow'
                    : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100',
                  'dark:text-gray-100 dark:hover:bg-gray-800 dark:border-gray-600',
                  showCompleted === true && filterColor && filterColor !== '#84cc16' && 'filter-btn-active-custom'
                )}
                style={showCompleted === true && filterColor && filterColor !== '#84cc16' ? {
                  background: filterColor,
                  border: 'none',
                  color: '#fff',
                  filter: 'brightness(0.95)',
                } : {}}
              >
                Completos
              </button>
            </div>
          </div>
          {/* Adicione mais filtros aqui se quiser */}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            className={clsx(
              'w-full py-2 rounded-lg font-semibold transition',
              filterColor && filterColor !== '#84cc16' ? 'filter-btn-active-custom' : 'bg-brandGreen-500 text-white hover:bg-brandGreen-600'
            )}
            style={filterColor && filterColor !== '#84cc16' ? {
              background: filterColor,
              color: '#fff',
              border: 'none',
              filter: 'brightness(0.95)',
            } : {}}
            onClick={onClose}
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            className="w-full py-2 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={() => {
              setItemSortOrder('asc');
              setShowCompleted(null);
            }}
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
    </>
  );
};
