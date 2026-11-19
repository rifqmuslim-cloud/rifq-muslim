import React from 'react';
import { AppProvider } from './src/store/AppContext';
import Shell from './src/Shell';

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
