// File deprecated and removed. Gaia voice assistant has been removed from the platform.
export const useIntegratedAi = () => {
  return {
    messages: [],
    isLoading: false,
    isLoadingHistory: false,
    error: null,
    statusMessage: '',
    transcribedText: '',
    setTranscribedText: () => {},
    sendMessage: async () => {},
    clearMessages: () => {},
    voiceInputEnabled: false,
    setVoiceInputEnabled: () => {},
    isListening: false,
    isSpeaking: false,
    startVoiceInput: async () => {},
    stopVoiceInput: async () => {},
    cancelRecording: () => {},
    stopSpeaking: () => {},
    readMessageAloud: () => {}
  };
};