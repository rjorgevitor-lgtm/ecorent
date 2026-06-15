import React, { createContext, useContext } from 'react';

// File deprecated. Gaia voice assistant has been removed from the platform.
const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  return (
    <VoiceContext.Provider value={{}}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceAccessibility = () => {
  return {};
};