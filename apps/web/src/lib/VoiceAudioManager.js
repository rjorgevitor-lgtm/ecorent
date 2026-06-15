import apiServerClient from '@/lib/apiServerClient';

export async function requestMicrophonePermission() {
  const timestamp = new Date().toISOString();
  console.log(`[VoiceAudioManager] ${timestamp} - Requesting microphone permission...`);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    console.log(`[VoiceAudioManager] ${new Date().toISOString()} - Microphone permission granted`);
    return true;
  } catch (error) {
    console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Microphone permission denied:`, error.message);
    return false;
  }
}

export async function startAudioCapture() {
  const timestamp = new Date().toISOString();
  console.log(`[VoiceAudioManager] ${timestamp} - Starting audio capture...`);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    }
    
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.start();
    console.log(`[VoiceAudioManager] ${new Date().toISOString()} - Audio capture started successfully`, { mimeType });

    return { mediaRecorder, chunks, stream };
  } catch (error) {
    console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Failed to start audio capture:`, error.message);
    throw new Error(`Could not access microphone: ${error.message}`);
  }
}

export async function stopAudioCapture(recorder) {
  const timestamp = new Date().toISOString();
  console.log(`[VoiceAudioManager] ${timestamp} - Stopping audio capture...`);
  return new Promise((resolve, reject) => {
    try {
      recorder.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(recorder.chunks, { type: recorder.mediaRecorder.mimeType });
          console.log(`[VoiceAudioManager] ${new Date().toISOString()} - Audio blob created`, { size: blob.size, type: blob.type });
          recorder.stream.getTracks().forEach(track => track.stop());
          resolve(blob);
        } catch (error) {
          console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Failed to create audio blob:`, error.message);
          reject(new Error(`Failed to create audio blob: ${error.message}`));
        }
      };
      recorder.mediaRecorder.stop();
    } catch (error) {
      console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Failed to stop recording:`, error.message);
      reject(new Error(`Failed to stop recording: ${error.message}`));
    }
  });
}

export async function audioToText(audioBlob) {
  const timestamp = new Date().toISOString();
  console.log(`[VoiceAudioManager] ${timestamp} - Sending audio to text transcription...`, { blobSize: audioBlob.size, blobType: audioBlob.type });
  try {
    const formData = new FormData();
    const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
    formData.append('audio', audioBlob, `recording.${extension}`);

    const response = await apiServerClient.fetch('/integrated-ai/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Transcription request failed:`, errorData);
      throw new Error(errorData.error || `Transcription failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[VoiceAudioManager] ${new Date().toISOString()} - Transcription response received:`, data);
    
    if (!data.text || !data.text.trim()) {
      throw new Error('No speech detected in the recording');
    }
    
    return data.text;
  } catch (error) {
    console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Audio to text error:`, error.message);
    throw error;
  }
}

export function textToSpeech(text, options = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[VoiceAudioManager] ${timestamp} - textToSpeech called with text length: ${text?.length || 0}`);
  
  if (!window.speechSynthesis) {
    console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Text-to-speech not supported in this browser`);
    return Promise.reject(new Error('Text-to-speech not supported in this browser'));
  }

  return new Promise((resolve, reject) => {
    try {
      console.log(`[VoiceAudioManager] ${new Date().toISOString()} - Web Speech API is available`);
      window.speechSynthesis.cancel();

      const cleanText = text.replace(/[*_~`#]/g, '').trim();
      if (!cleanText) {
        console.log(`[VoiceAudioManager] ${new Date().toISOString()} - Empty text after cleaning, skipping TTS`);
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = options.lang || 'pt-BR';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR');
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('pt'));
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        console.log(`[VoiceAudioManager] ${new Date().toISOString()} - Speech synthesis started`);
      };

      utterance.onend = () => {
        console.log(`[VoiceAudioManager] ${new Date().toISOString()} - Speech synthesis completed`);
        resolve();
      };
      
      utterance.onerror = (e) => {
        console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Speech synthesis error:`, e.error);
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          reject(new Error(`Speech synthesis error: ${e.error}`));
        } else {
          resolve();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error(`[VoiceAudioManager] ${new Date().toISOString()} - Text-to-speech failed:`, error.message);
      reject(new Error(`Text-to-speech failed: ${error.message}`));
    }
  });
}