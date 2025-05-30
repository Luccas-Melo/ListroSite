import React from 'react';
import { listTemplates, ListTemplate } from '../data/listTemplates';
import { useListContext } from '../context/ListContext';
import clsx from 'clsx';

interface ModalTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalTemplateSelector: React.FC<ModalTemplateSelectorProps> = ({ isOpen, onClose }) => {
  const { addListFromTemplate } = useListContext();

  if (!isOpen) return null;

  const handleSelectTemplate = (template: ListTemplate) => {
    addListFromTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Escolha um template de lista</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-3xl font-bold leading-none"
          aria-label="Fechar"
          type="button"
        >
          &times;
        </button>
        <ul className="space-y-3">
          {listTemplates.map((template, idx) => (
            <li
              key={idx}
              className={clsx(
                'cursor-pointer rounded border border-gray-300 dark:border-gray-700 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition',
              )}
              onClick={() => handleSelectTemplate(template)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectTemplate(template);
                }
              }}
              role="button"
              aria-label={`Selecionar template ${template.title}`}
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">{template.title}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{template.items.length} itens</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModalTemplateSelector;
