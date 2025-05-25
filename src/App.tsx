import React from 'react';
import { ListProvider } from './context/ListContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <ThemeProvider>
      <ListProvider>
        <MainLayout />
      </ListProvider>
    </ThemeProvider>
  );
}

export default App;