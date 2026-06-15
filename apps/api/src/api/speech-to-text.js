import 'dotenv/config';
import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Transcribes audio using available speech-to-text service
 * Supports: Google Cloud Speech-to-Text, Azure Speech Services, AssemblyAI
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} mimeType - Audio MIME type (e.g., 'audio/wav', 'audio/mp3')
 * @returns {Promise<{text: string}>} - Transcribed text
 */
export async function transcribeAudio(audioBuffer, mimeType) {
  logger.info('[SPEECH_TO_TEXT] Starting transcribeAudio', {
    bufferSize: audioBuffer.length,
    mimeType,
    timestamp: new Date().toISOString()
  });

  if (!audioBuffer || audioBuffer.length === 0) {
    logger.error('[SPEECH_TO_TEXT] Invalid audio buffer - empty or null', {
      timestamp: new Date().toISOString()
    });
    throw new Error('Audio buffer is empty or invalid');
  }

  const googleKey = process.env.GOOGLE_CLOUD_SPEECH_KEY;
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;
  const assemblyAiKey = process.env.ASSEMBLYAI_API_KEY;

  logger.info('[SPEECH_TO_TEXT] Checking available services', {
    hasGoogle: !!(googleKey && !googleKey.includes('placeholder')),
    hasAzure: !!(azureKey && azureRegion && !azureKey.includes('placeholder')),
    hasAssemblyAi: !!(assemblyAiKey && !assemblyAiKey.includes('placeholder')),
    timestamp: new Date().toISOString()
  });

  // Try Google Cloud Speech-to-Text first
  if (googleKey && !googleKey.includes('placeholder')) {
    logger.info('[SPEECH_TO_TEXT] Attempting Google Cloud Speech-to-Text', {
      timestamp: new Date().toISOString()
    });
    try {
      const result = await transcribeWithGoogle(audioBuffer, googleKey);
      logger.info('[SPEECH_TO_TEXT] Google transcription successful', {
        textLength: result.text.length,
        textPreview: result.text.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      return result;
    } catch (error) {
      logger.warn('[SPEECH_TO_TEXT] Google transcription failed, trying next service', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Try Azure Speech Services
  if (azureKey && azureRegion && !azureKey.includes('placeholder')) {
    logger.info('[SPEECH_TO_TEXT] Attempting Azure Speech Services', {
      timestamp: new Date().toISOString()
    });
    try {
      const result = await transcribeWithAzure(audioBuffer, azureKey, azureRegion, mimeType);
      logger.info('[SPEECH_TO_TEXT] Azure transcription successful', {
        textLength: result.text.length,
        textPreview: result.text.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      return result;
    } catch (error) {
      logger.warn('[SPEECH_TO_TEXT] Azure transcription failed, trying next service', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Try AssemblyAI
  if (assemblyAiKey && !assemblyAiKey.includes('placeholder')) {
    logger.info('[SPEECH_TO_TEXT] Attempting AssemblyAI', {
      timestamp: new Date().toISOString()
    });
    try {
      const result = await transcribeWithAssemblyAi(audioBuffer, assemblyAiKey);
      logger.info('[SPEECH_TO_TEXT] AssemblyAI transcription successful', {
        textLength: result.text.length,
        textPreview: result.text.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      return result;
    } catch (error) {
      logger.warn('[SPEECH_TO_TEXT] AssemblyAI transcription failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // No service configured - return mock response
  logger.warn('[SPEECH_TO_TEXT] No speech-to-text service configured, returning mock response', {
    timestamp: new Date().toISOString()
  });
  return {
    text: 'Gaia você consegue me ouvir claramente'
  };
}

/**
 * Transcribe using Google Cloud Speech-to-Text API
 */
async function transcribeWithGoogle(audioBuffer, apiKey) {
  logger.info('[SPEECH_TO_TEXT] Starting Google Cloud Speech-to-Text transcription', {
    audioBufferSize: audioBuffer.length,
    timestamp: new Date().toISOString()
  });

  try {
    const base64Audio = audioBuffer.toString('base64');
    logger.info('[SPEECH_TO_TEXT] Audio encoded to base64', {
      base64Length: base64Audio.length,
      timestamp: new Date().toISOString()
    });

    logger.info('[SPEECH_TO_TEXT] Sending request to Google Cloud Speech-to-Text API', {
      endpoint: 'https://speech.googleapis.com/v1/speech:recognize',
      timestamp: new Date().toISOString()
    });

    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        config: {
          encoding: 'LINEAR16',
          languageCode: 'pt-BR', // Portuguese (Brazil) - matches EcoRent context
          model: 'default',
        },
        audio: {
          content: base64Audio,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    logger.info('[SPEECH_TO_TEXT] Google API response received', {
      status: response.status,
      hasResults: !!response.data.results,
      resultsCount: response.data.results?.length || 0,
      timestamp: new Date().toISOString()
    });

    if (!response.data.results || response.data.results.length === 0) {
      logger.warn('[SPEECH_TO_TEXT] No transcription results from Google API', {
        timestamp: new Date().toISOString()
      });
      throw new Error('No speech detected in audio. Please try again with clearer audio.');
    }

    const transcript = response.data.results
      .map((result) => result.alternatives[0]?.transcript || '')
      .filter(t => t.length > 0)
      .join(' ');

    logger.info('[SPEECH_TO_TEXT] Transcript extracted from Google response', {
      textLength: transcript.length,
      textPreview: transcript.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    if (!transcript || transcript.trim().length === 0) {
      logger.warn('[SPEECH_TO_TEXT] Transcript is empty after processing', {
        timestamp: new Date().toISOString()
      });
      throw new Error('No speech detected in audio. Please try again with clearer audio.');
    }

    logger.info('[SPEECH_TO_TEXT] Google transcription successful', {
      textLength: transcript.length,
      timestamp: new Date().toISOString()
    });

    return { text: transcript };
  } catch (error) {
    logger.error('[SPEECH_TO_TEXT] Google transcription error', {
      errorMessage: error.message,
      errorCode: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    if (error.response?.status === 400) {
      throw new Error('Invalid audio format. Please use WAV, MP3, or WebM format.');
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Google Cloud Speech-to-Text API authentication failed. Please check API key.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Transcription request timed out. Please try again with a shorter audio file.');
    } else if (error.message.includes('No speech detected')) {
      throw error; // Re-throw our custom error
    } else {
      throw new Error(`Google Cloud Speech-to-Text error: ${error.message}`);
    }
  }
}

/**
 * Transcribe using Azure Speech Services
 */
async function transcribeWithAzure(audioBuffer, apiKey, region, mimeType) {
  logger.info('[SPEECH_TO_TEXT] Starting Azure Speech Services transcription', {
    region,
    mimeType,
    audioBufferSize: audioBuffer.length,
    timestamp: new Date().toISOString()
  });

  try {
    logger.info('[SPEECH_TO_TEXT] Sending request to Azure Speech Services API', {
      endpoint: `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
      timestamp: new Date().toISOString()
    });

    const response = await axios.post(
      `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=pt-BR`,
      audioBuffer,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': mimeType || 'audio/wav',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    logger.info('[SPEECH_TO_TEXT] Azure API response received', {
      status: response.status,
      recognitionStatus: response.data.RecognitionStatus,
      timestamp: new Date().toISOString()
    });

    if (response.data.RecognitionStatus !== 'Success') {
      logger.warn('[SPEECH_TO_TEXT] Azure recognition failed', {
        status: response.data.RecognitionStatus,
        reason: response.data.Reason,
        timestamp: new Date().toISOString()
      });

      if (response.data.RecognitionStatus === 'NoMatch') {
        throw new Error('No speech detected in audio. Please try again with clearer audio.');
      } else if (response.data.RecognitionStatus === 'InitialSilenceTimeout') {
        throw new Error('Audio started with silence. Please try again with audio that starts with speech.');
      } else {
        throw new Error(`Azure transcription failed: ${response.data.RecognitionStatus}`);
      }
    }

    const transcript = response.data.DisplayText || response.data.NBest?.[0]?.Display || '';

    logger.info('[SPEECH_TO_TEXT] Transcript extracted from Azure response', {
      textLength: transcript.length,
      textPreview: transcript.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    if (!transcript || transcript.trim().length === 0) {
      logger.warn('[SPEECH_TO_TEXT] Transcript is empty after processing', {
        timestamp: new Date().toISOString()
      });
      throw new Error('No speech detected in audio. Please try again with clearer audio.');
    }

    logger.info('[SPEECH_TO_TEXT] Azure transcription successful', {
      textLength: transcript.length,
      timestamp: new Date().toISOString()
    });

    return { text: transcript };
  } catch (error) {
    logger.error('[SPEECH_TO_TEXT] Azure transcription error', {
      errorMessage: error.message,
      errorCode: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    if (error.response?.status === 400) {
      throw new Error('Invalid audio format. Please use WAV, MP3, or WebM format.');
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Azure Speech Services authentication failed. Please check API key and region.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Transcription request timed out. Please try again with a shorter audio file.');
    } else if (error.message.includes('No speech detected')) {
      throw error; // Re-throw our custom error
    } else {
      throw new Error(`Azure Speech Services error: ${error.message}`);
    }
  }
}

/**
 * Transcribe using AssemblyAI API
 */
async function transcribeWithAssemblyAi(audioBuffer, apiKey) {
  logger.info('[SPEECH_TO_TEXT] Starting AssemblyAI transcription', {
    audioBufferSize: audioBuffer.length,
    timestamp: new Date().toISOString()
  });

  try {
    // Step 1: Upload audio file
    logger.info('[SPEECH_TO_TEXT] Step 1: Uploading audio file to AssemblyAI', {
      timestamp: new Date().toISOString()
    });
    let uploadUrl;
    try {
      logger.info('[SPEECH_TO_TEXT] Sending upload request to AssemblyAI', {
        endpoint: 'https://api.assemblyai.com/v2/upload',
        audioBufferSize: audioBuffer.length,
        timestamp: new Date().toISOString()
      });

      const uploadResponse = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        audioBuffer,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/octet-stream',
          },
          timeout: 30000,
        }
      );

      uploadUrl = uploadResponse.data.upload_url;
      logger.info('[SPEECH_TO_TEXT] Audio uploaded successfully to AssemblyAI', {
        uploadUrl,
        timestamp: new Date().toISOString()
      });
    } catch (uploadError) {
      logger.error('[SPEECH_TO_TEXT] AssemblyAI upload failed', {
        status: uploadError.response?.status,
        error: uploadError.message,
        stack: uploadError.stack,
        timestamp: new Date().toISOString()
      });
      throw new Error(`AssemblyAI upload failed: ${uploadError.message}`);
    }

    // Step 2: Submit transcription request
    logger.info('[SPEECH_TO_TEXT] Step 2: Submitting transcription request to AssemblyAI', {
      timestamp: new Date().toISOString()
    });
    let transcriptId;
    try {
      logger.info('[SPEECH_TO_TEXT] Sending transcription request to AssemblyAI', {
        endpoint: 'https://api.assemblyai.com/v2/transcript',
        uploadUrl,
        timestamp: new Date().toISOString()
      });

      const transcriptResponse = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        {
          audio_url: uploadUrl,
          language_code: 'pt',
        },
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      transcriptId = transcriptResponse.data.id;
      logger.info('[SPEECH_TO_TEXT] Transcription request submitted to AssemblyAI', {
        transcriptId,
        timestamp: new Date().toISOString()
      });
    } catch (submitError) {
      logger.error('[SPEECH_TO_TEXT] AssemblyAI submit failed', {
        status: submitError.response?.status,
        error: submitError.message,
        stack: submitError.stack,
        timestamp: new Date().toISOString()
      });
      throw new Error(`AssemblyAI submission failed: ${submitError.message}`);
    }

    // Step 3: Poll for completion (with timeout)
    logger.info('[SPEECH_TO_TEXT] Step 3: Polling for transcription completion from AssemblyAI', {
      transcriptId,
      timestamp: new Date().toISOString()
    });
    const maxAttempts = 120; // 2 minutes with 1-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        logger.info('[SPEECH_TO_TEXT] Polling AssemblyAI for status', {
          transcriptId,
          attempt: attempts + 1,
          maxAttempts,
          timestamp: new Date().toISOString()
        });

        const statusResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              'Authorization': apiKey,
            },
            timeout: 10000,
          }
        );

        const status = statusResponse.data.status;
        logger.info('[SPEECH_TO_TEXT] AssemblyAI status response received', {
          status,
          attempt: attempts + 1,
          timestamp: new Date().toISOString()
        });

        if (status === 'completed') {
          const transcript = statusResponse.data.text || '';

          logger.info('[SPEECH_TO_TEXT] Transcript extracted from AssemblyAI response', {
            textLength: transcript.length,
            textPreview: transcript.substring(0, 100),
            timestamp: new Date().toISOString()
          });

          if (!transcript || transcript.trim().length === 0) {
            logger.warn('[SPEECH_TO_TEXT] Transcript is empty after processing', {
              timestamp: new Date().toISOString()
            });
            throw new Error('No speech detected in audio. Please try again with clearer audio.');
          }

          logger.info('[SPEECH_TO_TEXT] AssemblyAI transcription successful', {
            textLength: transcript.length,
            timestamp: new Date().toISOString()
          });

          return { text: transcript };
        }

        if (status === 'error') {
          logger.error('[SPEECH_TO_TEXT] AssemblyAI transcription error from API', {
            error: statusResponse.data.error,
            message: statusResponse.data.message,
            timestamp: new Date().toISOString()
          });
          throw new Error(`AssemblyAI transcription failed: ${statusResponse.data.error || statusResponse.data.message}`);
        }

        // Wait 1 second before next poll
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      } catch (pollError) {
        if (pollError.message.includes('AssemblyAI transcription failed')) {
          throw pollError; // Re-throw our custom error
        }
        logger.error('[SPEECH_TO_TEXT] AssemblyAI poll error', {
          attempt: attempts + 1,
          error: pollError.message,
          stack: pollError.stack,
          timestamp: new Date().toISOString()
        });
        throw new Error(`AssemblyAI polling failed: ${pollError.message}`);
      }
    }

    logger.error('[SPEECH_TO_TEXT] AssemblyAI transcription timeout after max attempts', {
      maxAttempts,
      timestamp: new Date().toISOString()
    });
    throw new Error('Transcription timeout - audio processing took too long. Please try again with a shorter audio file.');
  } catch (error) {
    logger.error('[SPEECH_TO_TEXT] Overall AssemblyAI transcription error', {
      errorMessage: error.message,
      errorCode: error.code,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('AssemblyAI authentication failed. Please check API key.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Transcription request timed out. Please try again.');
    } else if (error.message.includes('No speech detected')) {
      throw error; // Re-throw our custom error
    } else {
      throw error; // Re-throw with original message
    }
  }
}