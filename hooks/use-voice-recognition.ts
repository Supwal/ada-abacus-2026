import { useEffect, useState, useCallback } from 'react';

interface VoiceOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useVoiceRecognition(options: VoiceOptions = {}) {
  const {
    language = 'pt-BR',
    continuous = false,
    interimResults = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = continuous;
    recog.interimResults = interimResults;
    recog.language = language;

    recog.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recog.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      setTranscript((prev) => prev + final);
    };

    recog.onerror = (event: any) => {
      setError(`Erro: ${event.error}`);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    setRecognition(recog);

    return () => {
      recog.abort();
    };
  }, [language, continuous, interimResults]);

  const startListening = useCallback(() => {
    if (recognition) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognition.start();
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
