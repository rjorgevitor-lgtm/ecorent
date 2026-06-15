import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnimatedText } from '@/hooks/use-animated-text';
import { useIntegratedAi } from '@/hooks/use-integrated-ai.jsx';
import { Mic, MicOff, Loader2, Volume2, VolumeX, Send, Paperclip, X, PlayCircle, StopCircle } from 'lucide-react';

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const getImageKey = file => `${file.name}:${file.size}:${file.lastModified}`;

export default function IntegratedAiChat() {
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  
  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    statusMessage,
    transcribedText,
    setTranscribedText,
    sendMessage,
    clearMessages,
    voiceInputEnabled,
    setVoiceInputEnabled,
    isListening,
    isSpeaking,
    startVoiceInput,
    stopVoiceInput,
    cancelRecording,
    stopSpeaking,
    readMessageAloud
  } = useIntegratedAi();
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    console.log(`[IntegratedAiChat] ${new Date().toISOString()} - Component mounted`);
  }, []);

  useEffect(() => {
    if (transcribedText) {
      setInput(transcribedText);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [transcribedText]);

  const imagePreviews = useMemo(() => selectedImages.map(file => ({
    key: getImageKey(file),
    file,
    url: URL.createObjectURL(file),
  })), [selectedImages]);

  useEffect(() => () => {
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
  }, [imagePreviews]);

  const lastMessage = messages[messages.length - 1];
  const isLastMessageStreaming = isLoading && lastMessage?.role === 'assistant';
  const animatedText = useAnimatedText(isLastMessageStreaming ? lastMessage.content : '');

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
    };

    scrollToBottom();
  }, [messages, isLoading, animatedText]);

  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();

    const trimmed = input.trim();

    if ((!trimmed && selectedImages.length === 0) || isLoading || isListening) {
      return;
    }

    console.log(`[IntegratedAiChat] ${new Date().toISOString()} - Message submitted with text: "${trimmed}"`);
    setInput('');
    setTranscribedText('');
    sendMessage(trimmed, selectedImages);
    setSelectedImages([]);
    
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  }, [input, selectedImages, isLoading, isListening, sendMessage, setTranscribedText]);

  const handleImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => VALID_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE);

    setSelectedImages((prev) => {
      const uniqueFilesMap = new Map(prev.map(file => [getImageKey(file), file]));
      validFiles.forEach(file => uniqueFilesMap.set(getImageKey(file), file));
      return Array.from(uniqueFilesMap.values()).slice(0, MAX_IMAGES);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [fileInputRef]);

  const removeImage = useCallback((index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleVoiceInput = useCallback(async () => {
    console.log(`[IntegratedAiChat] ${new Date().toISOString()} - Microphone button clicked`);
    try {
      if (isListening) {
        console.log(`[IntegratedAiChat] ${new Date().toISOString()} - Stopping audio recording`);
        await stopVoiceInput();
      } else {
        console.log(`[IntegratedAiChat] ${new Date().toISOString()} - Starting audio recording`);
        await startVoiceInput();
      }
    } catch (err) {
      console.error(`[IntegratedAiChat] ${new Date().toISOString()} - Voice input error:`, err.message);
    }
  }, [isListening, startVoiceInput, stopVoiceInput]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (isListening) {
        cancelRecording();
      } else if (isSpeaking) {
        stopSpeaking();
      }
    }

    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      handleVoiceInput();
    }
  }, [isListening, isSpeaking, cancelRecording, stopSpeaking, handleVoiceInput]);

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col h-full max-w-2xl mx-auto bg-card rounded-2xl border shadow-sm overflow-hidden"
      role="region"
      aria-label="Gaia chat assistant"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between p-4 border-b bg-secondary/30">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">✨</span>
          Chat com a Gaia
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceInputEnabled(!voiceInputEnabled)}
            className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              voiceInputEnabled
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            aria-label={voiceInputEnabled ? 'Desativar respostas por voz' : 'Ativar respostas por voz'}
            aria-pressed={voiceInputEnabled}
          >
            {voiceInputEnabled ? <Volume2 className="w-5 h-5" aria-hidden="true" /> : <VolumeX className="w-5 h-5" aria-hidden="true" />}
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              disabled={isLoading || isListening}
              className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] px-3 rounded-lg hover:bg-secondary/50"
              aria-label="Limpar histórico de mensagens"
            >
              Limpar Histórico
            </button>
          )}
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        aria-busy={isLoading || isListening}
      >
        <div className="sr-only" aria-live="assertive">
          {statusMessage}
        </div>

        {isLoadingHistory && (
          <div className="text-center text-sm text-muted-foreground py-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Carregando histórico...</span>
          </div>
        )}
        
        {messages.length === 0 && !isLoadingHistory && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center" aria-hidden="true">
              <span className="text-2xl">🌱</span>
            </div>
            <p className="text-lg font-medium text-foreground">Olá! Sou a Gaia.</p>
            <p>Como posso ajudar você hoje?</p>
            {voiceInputEnabled && (
              <p className="text-sm bg-secondary/50 px-4 py-2 rounded-full mt-4">
                Dica: Clique no microfone ou pressione Espaço para falar comigo
              </p>
            )}
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastStreamingMessage = isLoading && i === messages.length - 1 && msg.role === 'assistant';
          const displayContent = isLastStreamingMessage ? animatedText : msg.content;

          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm relative group ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed text-[1rem]">{displayContent}</p>
                
                {msg.images?.map((url, j) => (
                  <img
                    key={j}
                    src={url}
                    alt="Imagem anexada"
                    className="mt-3 rounded-xl max-w-full border border-primary/10"
                  />
                ))}
                
                {msg.role === 'assistant' && isLoading && i === messages.length - 1 && !msg.content && (
                  <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse rounded-full" aria-hidden="true" />
                )}

                {msg.role === 'assistant' && !isLastStreamingMessage && msg.content && (
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : readMessageAloud(msg.content)}
                    className="absolute -right-10 top-2 p-2 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-full hover:bg-secondary"
                    aria-label={isSpeaking ? "Parar leitura" : "Ler mensagem em voz alta"}
                    title={isSpeaking ? "Parar leitura" : "Ler em voz alta"}
                  >
                    {isSpeaking ? <StopCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} tabIndex={-1} />
      </div>

      <div className="p-4 border-t bg-background">
        {error && (
          <div 
            className="mb-3 p-3 bg-destructive/10 text-destructive text-sm rounded-xl flex items-start gap-2 border border-destructive/20"
            role="alert"
            aria-live="assertive"
          >
            <span className="text-lg" aria-hidden="true">⚠️</span>
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {statusMessage && !error && (
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary bg-primary/5 p-2 rounded-lg">
            {isListening && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />}
            {isLoading && !isListening && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {isSpeaking && <Volume2 className="w-4 h-4 animate-pulse" aria-hidden="true" />}
            <span>{statusMessage}</span>
            
            {(isListening || isSpeaking) && (
              <button
                onClick={isListening ? cancelRecording : stopSpeaking}
                className="ml-auto text-xs underline hover:text-primary/80 px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={isListening ? "Cancelar gravação" : "Parar fala"}
              >
                Cancelar
              </button>
            )}
          </div>
        )}
        
        {selectedImages.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap" aria-label="Imagens selecionadas">
            {imagePreviews.map(({ key, file, url }, index) => (
              <div key={key} className="relative group">
                <img
                  src={url}
                  alt={`Pré-visualização de ${file.name}`}
                  className="w-16 h-16 object-cover rounded-xl border shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive"
                  aria-label={`Remover imagem ${file.name}`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept={VALID_IMAGE_TYPES.join(',')}
            multiple
            onChange={handleImageSelect}
            className="sr-only"
            disabled={isLoading || isListening || isLoadingHistory}
            aria-label="Selecionar imagens"
            id="image-upload"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-w-[44px] min-h-[44px] rounded-xl border bg-secondary/50 flex items-center justify-center hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
            disabled={isLoading || isListening || isLoadingHistory || selectedImages.length >= MAX_IMAGES}
            aria-label="Anexar imagem"
            title="Anexar imagem"
          >
            <Paperclip className="w-5 h-5" aria-hidden="true" />
          </button>

          {voiceInputEnabled && (
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`min-w-[44px] min-h-[44px] rounded-xl border transition-all flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg border-red-600'
                  : 'bg-secondary/50 hover:bg-secondary text-foreground'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={(isLoading && !isListening) || isLoadingHistory}
              aria-label={isListening ? 'Parar gravação de voz' : 'Iniciar gravação de voz'}
              aria-pressed={isListening}
              title={isListening ? 'Parar gravação' : 'Falar mensagem'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Mic className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          )}

          <div className="flex-1 relative">
            <label htmlFor="chat-input" className="sr-only">Digite sua mensagem</label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                isListening
                  ? 'Ouvindo...'
                  : isLoading
                  ? 'Processando...'
                  : 'Digite sua mensagem...'
              }
              className="w-full min-h-[44px] rounded-xl border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground text-[1rem]"
              disabled={isLoading || isListening || isLoadingHistory}
              aria-invalid={!!error}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isListening || isLoadingHistory || (!input.trim() && selectedImages.length === 0)}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-primary px-4 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2 focus-visible:ring-offset-2"
            aria-label="Enviar mensagem"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <span className="hidden sm:inline">Enviar</span>
                <Send className="w-5 h-5 sm:hidden" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}