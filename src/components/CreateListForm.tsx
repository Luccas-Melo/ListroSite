import React, { useState } from 'react';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import { Film, Tv, MapPin, PenTool, Book, X, Info } from 'lucide-react';
import clsx from 'clsx';
import { ListType } from '../types';
import ModalTemplateSelector from './ModalTemplateSelector';
import { toast } from 'sonner';

const CreateListForm: React.FC = () => {
  const { addList, addListFromTemplate } = useListContext();
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<string>('custom');
  const [selectedIcon, setSelectedIcon] = useState<string>('X');
  const [avatar, setAvatar] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [selectedColor, setSelectedColor] = React.useState<string>('#84cc16'); // cor padrão verde
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);

  const openTemplateModal = () => setIsTemplateModalOpen(true);
  const closeTemplateModal = () => setIsTemplateModalOpen(false);

  const handleTemplateSelect = (template: any) => {
    addListFromTemplate(template);
    closeTemplateModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        (addList as unknown as (title: string, type: string, icon?: string, avatar?: string, tags?: string[], color?: string, isTemporary?: boolean) => void)(
          title.trim(),
          selectedType,
          selectedType === 'custom' ? selectedIcon : undefined,
          avatar.trim() || undefined,
          tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          selectedColor,
          isTemporary
        );
        toast.success('Lista criada com sucesso!');
        setTitle('');
        setSelectedType('custom');
        setSelectedIcon('X');
        setAvatar('');
        setTags('');
        setSelectedColor('#84cc16');
        setIsTemporary(false);
      } catch (error) {
        toast.error('Erro ao criar lista.');
      }
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

        <button
          type="button"
          onClick={openTemplateModal}
          className={clsx(
            'mb-4 w-full py-2 px-4 font-medium rounded-md transition-transform duration-150 active:scale-95 focus:outline-none',
            theme === 'dark' ? [
              'bg-[#bef264] hover:bg-[#a3e635] text-gray-900',
              'hover:shadow-lg hover:shadow-[#a3e635]/20',
              'focus:ring-4 focus:ring-[#a3e635]/50',
            ] : [
              'bg-[#bef264] hover:bg-[#a3e635] text-gray-900',
              'hover:shadow-md',
              'focus:ring-4 focus:ring-[#a3e635]/50',
            ]
          )}
        >
          Usar Template de Lista
        </button>

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

          <div className="mb-6">
            <label className={clsx(
              'block text-sm font-medium mb-1',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Selecione uma cor personalizada
            </label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-16 h-8 rounded border border-gray-300 cursor-pointer"
              title="Selecionar cor da lista"
            />
          </div>

          <div className="mb-6 flex items-center gap-2">
            <input
              id="temporary"
              type="checkbox"
              checked={isTemporary}
              onChange={(e) => setIsTemporary(e.target.checked)}
              className="w-4 h-4 text-brandGreen-600 bg-gray-100 border-gray-300 rounded focus:ring-brandGreen-500 dark:focus:ring-brandGreen-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="temporary" className={clsx('text-sm font-medium flex items-center gap-1', theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
              Lista temporária
              <span className="relative group">
                <Info size={14} className="cursor-pointer text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" />
                <span className="absolute z-10 hidden group-hover:block w-56 p-2 text-xs leading-tight text-white bg-gray-800 rounded shadow-lg -left-1/2 top-6">
                  Não será salva no navegador. Desaparece ao fechar ou recarregar a página.
                </span>
              </span>
            </label>
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
                {[
                  { name: 'Film', icon: <Film size={20} /> },
                  { name: 'Tv', icon: <Tv size={20} /> },
                  { name: 'MapPin', icon: <MapPin size={20} /> },
                  { name: 'PenTool', icon: <PenTool size={20} /> },
                  { name: 'Book', icon: <Book size={20} /> },
                  { name: 'X', icon: <X size={20} /> },
                ].map(({ name, icon }) => (
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
                'text-gray-900 hover:shadow-lg',
                'focus:ring-4',
                'disabled:hover:shadow-none'
              ] : [
                'text-gray-900 hover:shadow-md',
                'focus:ring-4',
                'disabled:hover:shadow-none'
              ]
            )}
            style={{ backgroundColor: selectedColor }}
          >
            Criar Lista
          </button>
        </form>
      </div>
      <ModalTemplateSelector isOpen={isTemplateModalOpen} onClose={closeTemplateModal} />
    </div>
  );
};

export default CreateListForm;
