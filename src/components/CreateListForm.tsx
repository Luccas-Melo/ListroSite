import React, { useState } from 'react';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import { Film, Tv, MapPin, PenTool, Book, X } from 'lucide-react';
import clsx from 'clsx';
import { ListType } from '../types';

const CreateListForm: React.FC = () => {
  const { addList } = useListContext();
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<ListType>('custom');
  const [selectedIcon, setSelectedIcon] = useState<string>('X');
  const [avatar, setAvatar] = useState<string>('');
  const [tags, setTags] = useState<string>('');

  const listTypes: { type: ListType; icon: React.ReactNode; label: string; color: string }[] = [
    { type: 'movies', icon: <Film size={20} />, label: 'Filmes', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { type: 'shows', icon: <Tv size={20} />, label: 'Séries', color: 'bg-green-100 text-green-700 border-green-200' },
    { type: 'places', icon: <MapPin size={20} />, label: 'Lugares', color: 'bg-brandGreen-100 text-brandGreen-700 border-brandGreen-200' },
    { type: 'drawings', icon: <PenTool size={20} />, label: 'Desenhos', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { type: 'books', icon: <Book size={20} />, label: 'Livros', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { type: 'custom', icon: <X size={20} />, label: 'Personalizada', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ];

  const predefinedIcons: { name: string; icon: React.ReactNode }[] = [
    { name: 'Film', icon: <Film size={20} /> },
    { name: 'Tv', icon: <Tv size={20} /> },
    { name: 'MapPin', icon: <MapPin size={20} /> },
    { name: 'PenTool', icon: <PenTool size={20} /> },
    { name: 'Book', icon: <Book size={20} /> },
    { name: 'X', icon: <X size={20} /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      // Cast addList to accept 5 arguments
      (addList as (title: string, type: ListType, icon?: string, avatar?: string, tags?: string[]) => void)(
        title.trim(),
        selectedType,
        selectedType === 'custom' ? selectedIcon : undefined,
        avatar.trim() || undefined,
        tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      );
      setTitle('');
      setSelectedType('custom');
      setSelectedIcon('X');
      setAvatar('');
      setTags('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-900 rounded-lg shadow-lg">
      <div className={clsx(
        'p-6 max-w-md mx-auto rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl',
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      )}>
        <h2 className={clsx(
          'text-2xl font-bold mb-6',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>Criar Nova Lista</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className={clsx(
              'block text-sm font-medium mb-1',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Título da Lista
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={clsx(
                'w-full px-3 py-2 border-2 rounded-md focus:outline-none transition-all duration-200 placeholder:text-gray-400',
                theme === 'dark' ? [
                  'bg-gray-900 border-gray-600 text-gray-100',
                  'focus:border-[#a3e635] focus:bg-gray-900',
                  'hover:border-[#a3e635]'
                ] : [
                  'bg-white border-gray-300 text-gray-900',
                  'placeholder:text-gray-400',
                  'focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/50',
                  'hover:border-[#a3e635]'
                ]
              )}
              placeholder="Minha lista incrível..."
              required
            />
          </div>
          
          <div className="mb-6 border-t border-gray-300 dark:border-gray-700 pt-4">
            <h3 className={clsx(
              'text-lg font-semibold mb-3',
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            )}>
              Personalização
            </h3>
            <label className={clsx(
              'block text-sm font-medium mb-1',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Avatar / Emoji
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Ex: 😀, 🚀, 🏆"
              className={clsx(
                'w-full px-3 py-2 border-2 rounded-md focus:outline-none transition-all duration-200 placeholder:text-gray-400',
                theme === 'dark' ? [
                  'bg-gray-800 border-gray-700 text-gray-100',
                  'focus:border-[#a3e635]/50 focus:bg-gray-800/90',
                  'hover:border-[#a3e635]'
                ] : [
                  'bg-white border-gray-300 text-gray-900',
                  'placeholder:text-gray-400',
                  'focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/40',
                  'hover:border-[#a3e635]'
                ]
              )}
            />
          </div>

          <div className="mb-6">
            <label className={clsx(
              'block text-sm font-medium mb-1',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: trabalho, mercado, urgente"
              className={clsx(
                'w-full px-3 py-2 border-2 rounded-md focus:outline-none transition-all duration-200 placeholder:text-gray-400',
                theme === 'dark' ? [
                  'bg-gray-800 border-gray-700 text-gray-100',
                  'focus:border-[#a3e635]/50 focus:bg-gray-800/90',
                  'hover:border-[#a3e635]'
                ] : [
                  'bg-white border-gray-300 text-gray-900',
                  'placeholder:text-gray-400',
                  'focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/40',
                  'hover:border-[#a3e635]'
                ]
              )}
            />
          </div>

          {selectedType === 'custom' && (
            <div className="mb-6">
              <label className={clsx(
                'block text-sm font-medium mb-1',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Selecione um ícone
              </label>
              <div className="grid grid-cols-3 gap-3">
                {predefinedIcons.map(({ name, icon }) => (
                  <button
                    key={name}
                    type="button"
                    className={clsx(
                      'p-3 border-2 rounded-md flex items-center justify-center transition-all duration-200',
                      selectedIcon === name
                        ? (theme === 'dark'
                          ? 'border-brandGreen-500 bg-brandGreen-500/10 text-brandGreen-400 shadow-[0_0_8px_rgba(132,204,22,0.6)] ring-2 ring-brandGreen-500'
                          : 'border-brandGreen-500 bg-brandGreen-50 text-brandGreen-700 shadow-[0_0_8px_rgba(132,204,22,0.6)] ring-2 ring-brandGreen-500')
                        : (theme === 'dark'
                          ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                          : 'border-gray-300 hover:bg-gray-50')
                    )}
                    onClick={() => setSelectedIcon(name)}
                    title={name}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!title.trim()}
              className={clsx(
              'w-full py-2 px-4 font-medium rounded-md transition-transform duration-150 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
              theme === 'dark' ? [
                'bg-[#bef264] hover:bg-[#a3e635] text-gray-900',
                'hover:shadow-lg hover:shadow-[#a3e635]/20',
                'focus:ring-4 focus:ring-[#a3e635]/50',
                'disabled:hover:bg-[#bef264] disabled:hover:shadow-none'
              ] : [
                'bg-[#bef264] hover:bg-[#a3e635] text-gray-900',
                'hover:shadow-md',
                'focus:ring-4 focus:ring-[#a3e635]/50',
                'disabled:hover:bg-[#bef264] disabled:hover:shadow-none'
              ]
            )}
          >
            Criar Lista
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListForm;
