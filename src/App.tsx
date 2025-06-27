import React, { useState, useEffect } from 'react';
import { ListProvider } from './context/ListContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/MainLayout';
import SkeletonLoader from './components/ui/SkeletonLoader';
import { toast } from 'sonner';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Simula carregamento inicial
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <ThemeProvider>
        <SkeletonLoader />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ListProvider>
        <MainLayout />
       
      </ListProvider>
    </ThemeProvider>
  );
};

export default App;