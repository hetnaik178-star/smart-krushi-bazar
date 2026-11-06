import { useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const VoiceSearchButton = ({ onSpeechResult, placeholder = '' }) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error(t('voice.unsupported', 'Voice search is not supported in this browser.'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      
      // Set language according to active site language
      if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (language === 'gu') {
        recognition.lang = 'gu-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          if (onSpeechResult) {
            onSpeechResult(transcript.trim());
          }
          toast.success(`🗣️ "${transcript.trim()}"`);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied.');
        } else if (event.error === 'no-speech') {
          toast('No speech detected. Please try again.', { icon: '🎙️' });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleStartListening}
        disabled={isListening}
        className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
          isListening 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse scale-110' 
            : 'text-surface-500 hover:text-brand-700 hover:bg-emerald-50 active:scale-95'
        }`}
        title={isListening ? t('voice.listening', 'Listening...') : t('voice.clickToSpeak', 'Click to voice search')}
        aria-label="Voice Search"
      >
        {isListening ? (
          <FaMicrophone className="text-sm animate-bounce" />
        ) : (
          <FaMicrophone className="text-sm" />
        )}
      </button>

      {/* Floating Active Speech HUD Indicator */}
      {isListening && (
        <div className="absolute right-0 bottom-full mb-2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-scale-in">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>{t('voice.listening', 'Listening... Speak now')}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceSearchButton;
