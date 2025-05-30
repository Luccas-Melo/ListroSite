import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ListDetail from './ListDetail';
import CreateListForm from './CreateListForm';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';

const MainLayout: React.FC = () => {
  const { state, setActiveList } = useListContext();
  const { activeListId } = state;
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} />
        
        <div className="flex flex-1">
          {/* Sidebar for desktop */}
          <div className={`hidden md:block flex-shrink-0 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-[32rem] w-full transition-width duration-300 ease-in-out`}>
            <Sidebar />
          </div>

          {/* Sidebar overlay for mobile */}
          {sidebarOpen && (
            <div className={`fixed inset-0 z-40 md:hidden bg-black bg-opacity-50`} onClick={toggleSidebar}>
              <div className={`absolute left-0 top-0 bottom-0 w-64 ${theme === 'dark' ? 'bg-gray-900/90' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                <Sidebar />
              </div>
            </div>
          )}
          
          <main className={`flex-1 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white'} p-6 relative`}>
            {activeListId ? <ListDetail /> : <CreateListForm />}

            {/* Floating add button for mobile */}
            <button
              onClick={() => {
                setActiveList(null);
                if (sidebarOpen) setSidebarOpen(false);
              }}
              className="fixed bottom-6 right-6 md:hidden bg-brandGreen-600 text-white rounded-full p-4 shadow-lg hover:bg-brandGreen-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandGreen-500"
              aria-label="Criar nova lista"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
