import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string;
  onTranscript?: (text: string) => void;
  onError?: (errorMessage: string) => void;
}

export function useSpeechRecognition({
  lang = 'fr-FR',
  onTranscript,
  onError
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage('');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          let msg = 'Erreur de reconnaissance vocale.';
          if (event.error === 'not-allowed') {
            msg = 'Veuillez autoriser l’accès au micro dans votre navigateur.';
          } else if (event.error === 'no-speech') {
            msg = 'Aucune voix détectée. Veuillez parler plus près du micro.';
          } else if (event.error === 'network') {
            msg = 'Erreur réseau lors de la reconnaissance vocale.';
          }
          setErrorMessage(msg);
          onErrorRef.current?.(msg);
        };

        recognition.onresult = (event: any) => {
          let transcriptChunk = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcriptChunk += event.results[i][0].transcript;
            }
          }
          if (transcriptChunk) {
            onTranscriptRef.current?.(transcriptChunk);
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Erreur initialisation Web Speech API:', err);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
      setErrorMessage('La reconnaissance vocale n’est pas supportée sur ce navigateur.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    setErrorMessage('');
    if (!isSupported) {
      setErrorMessage('La reconnaissance vocale Web Speech n’est pas disponible sur votre navigateur.');
      return;
    }
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        console.error('Erreur start recognition:', e);
      }
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e: any) {
        console.error('Erreur stop recognition:', e);
      }
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    toggleListening
  };
}
