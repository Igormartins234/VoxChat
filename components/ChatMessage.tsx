import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { base64ToWav } from '../services/audioUtils';

interface ChatMessageProps {
  message: Message;
  accentColor: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, accentColor }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = '';
      }
    };
  }, [audioInstance]);

  const toggleAudio = () => {
    if (!message.audioUrl) return;

    if (audioInstance) {
      // Audio object already exists
      if (isPlaying) {
        audioInstance.pause();
        setIsPlaying(false);
      } else {
        audioInstance.play().catch(e => console.error("Resume failed:", e));
        setIsPlaying(true);
      }
    } else {
      // Initialize Audio object first time
      try {
        const blob = base64ToWav(message.audioUrl);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        audio.onended = () => {
          setIsPlaying(false);
        };

        audio.onpause = () => {
          setIsPlaying(false);
        };
        
        audio.onplay = () => {
          setIsPlaying(true);
        };

        setAudioInstance(audio);
        audio.play().catch(e => console.error("Play failed:", e));
        setIsPlaying(true);
      } catch (e) {
        console.error("Audio init failed", e);
      }
    }
  };

  const handleDownloadAudio = () => {
    if (!message.audioUrl) return;
    try {
      const blob = base64ToWav(message.audioUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voxchat-audio-${message.id}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          max-w-[80%] md:max-w-[60%] rounded-2xl p-4 transition-all
          ${isUser 
            ? 'bg-blue-600 text-white rounded-br-sm shadow-md' 
            : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700 shadow-sm'}
        `}
      >
        {/* Render Image if available */}
        {message.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
            <img 
              src={message.imageUrl} 
              alt="Uploaded content" 
              className="w-full h-auto object-cover max-h-[300px]"
            />
          </div>
        )}

        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
        
        {!isUser && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">VoxChat AI</span>
              {isPlaying && (
                <div className="flex items-center gap-0.5 h-3">
                   <div className="w-0.5 h-full bg-green-400 animate-[pulse_0.6s_ease-in-out_infinite]" />
                   <div className="w-0.5 h-2/3 bg-green-400 animate-[pulse_0.8s_ease-in-out_infinite]" />
                   <div className="w-0.5 h-full bg-green-400 animate-[pulse_1.0s_ease-in-out_infinite]" />
                </div>
              )}
            </div>
            
            {message.isAudioLoading ? (
               <div className="flex items-center gap-2 text-xs text-slate-400">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                 Gerando áudio...
               </div>
            ) : message.audioUrl ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleAudio}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${isPlaying 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : `hover:bg-slate-700 text-[${accentColor}] border border-transparent`}
                  `}
                  style={{ color: !isPlaying ? accentColor : undefined }}
                  title={isPlaying ? "Pausar" : "Ouvir"}
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      Pausar
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      {audioInstance ? 'Continuar' : 'Ouvir'}
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadAudio}
                  className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Baixar Áudio"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;