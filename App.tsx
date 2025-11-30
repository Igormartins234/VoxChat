import React, { useState, useRef, useEffect } from 'react';
import { CHARACTERS } from './constants';
import { Character, Message, AppMode } from './types';
import CharacterCard from './components/CharacterCard';
import ChatMessage from './components/ChatMessage';
import { generateChatResponse, generateSpeech } from './services/geminiService';
import { playAudioFromBase64 } from './services/audioUtils';

// --- Landing Page Component ---
const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-3xl space-y-8">
        <div className="space-y-2">
          <h2 className="text-blue-400 font-semibold tracking-wider uppercase text-sm">Bem-vindo ao VoxChat AI</h2>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Seu Narrador com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Inteligência Artificial</span>
          </h1>
        </div>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Uma plataforma interativa onde você escreve e a IA ganha vida. 
          Converse com personagens únicos ou transforme suas frases em narrativas faladas instantaneamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-all flex items-center gap-2 shadow-xl shadow-white/10"
          >
            Começar a Conversar
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16 border-t border-slate-800 pt-12">
          <div className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Vozes Realistas</h3>
            <p className="text-sm text-slate-400">Tecnologia avançada de síntese de voz que traz emoção para o texto.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
             <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Múltiplos Personagens</h3>
            <p className="text-sm text-slate-400">Escolha entre personas amigáveis, sábias, cínicas ou neutras.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
             <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 text-green-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Chat Inteligente</h3>
            <p className="text-sm text-slate-400">Converse naturalmente e obtenha respostas geradas por IA em tempo real.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ file: File, preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCharacterChange = (character: Character) => {
    setSelectedCharacter(character);
    setMessages([]); // Clear chat on character switch
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage({
            file,
            preview: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userText = inputText;
    const userImage = selectedImage;
    
    // Reset inputs
    setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setIsLoading(true);

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      imageUrl: userImage?.preview,
      timestamp: new Date()
    };
    
    // Optimistic update for chat
    setMessages(prev => [...prev, userMsg]);

    try {
      if (mode === AppMode.TTS) {
        // TTS Mode Logic: User writes, AI repeats it (Parrot mode)
        await processTTS(userText);
      } else {
        // Chat Mode Logic
        await processChat(userText, userImage, userMsg);
      }
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro. Verifique sua chave de API ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const processTTS = async (text: string) => {
    if (!text) return; 

    const aiMsgId = (Date.now() + 1).toString();
    
    // Add pending AI message
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'model',
      text: text, // AI repeats text
      timestamp: new Date(),
      isAudioLoading: true
    };
    
    setMessages(prev => [...prev, aiMsg]);

    try {
      // Generate Audio
      const audioData = await generateSpeech(text, selectedCharacter.voice);
      
      // Update message with audio URL
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId 
          ? { ...m, audioUrl: audioData, isAudioLoading: false } 
          : m
      ));
      
      await playAudioFromBase64(audioData);
    } catch (err) {
      console.error("TTS failed", err);
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId 
          ? { ...m, isAudioLoading: false } 
          : m
      ));
    }
  };

  const processChat = async (userText: string, userImage: { file: File, preview: string } | null, userMsg: Message) => {
    const aiMsgId = (Date.now() + 1).toString();
    
    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Prepare Image data for API if exists
    let apiImageData = null;
    if (userImage) {
        const matches = userImage.preview.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            apiImageData = {
                mimeType: matches[1],
                data: matches[2]
            };
        }
    }

    // Include User Name in instructions if available
    let personalizedInstruction = selectedCharacter.systemInstruction;
    if (userName.trim()) {
      personalizedInstruction += ` O nome do usuário é ${userName}.`;
    }

    // 2. Get Text Response
    const aiText = await generateChatResponse(userText, apiImageData, history, personalizedInstruction);

    // 3. Update UI with text immediately
    const aiMsgWithText: Message = {
      id: aiMsgId,
      role: 'model',
      text: aiText,
      timestamp: new Date(),
      isAudioLoading: true 
    };

    setMessages(prev => [...prev, aiMsgWithText]);

    // 4. Get Audio for the response
    try {
      const audioData = await generateSpeech(aiText, selectedCharacter.voice);
      
      // Update message with audio URL
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId 
          ? { ...m, audioUrl: audioData, isAudioLoading: false } 
          : m
      ));

      // Auto-play audio upon receipt (uses the deprecated simple player, but ChatMessage handles re-plays better)
      await playAudioFromBase64(audioData);

    } catch (audioErr) {
      console.error("Audio generation failed but text succeeded", audioErr);
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId 
          ? { ...m, isAudioLoading: false } 
          : m
      ));
    }
  };

  const handleDownloadConversation = () => {
    if (messages.length === 0) return;

    const conversationText = messages.map(m => {
      const roleName = m.role === 'user' ? (userName || 'Você') : selectedCharacter.name;
      const time = m.timestamp.toLocaleTimeString();
      const content = m.text + (m.imageUrl ? '\n[Imagem Enviada]' : '');
      return `[${time}] ${roleName}:\n${content}\n`;
    }).join('\n-------------------\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversa-${selectedCharacter.name.split(' ')[0]}-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    if (confirm("Tem certeza que deseja limpar toda a conversa?")) {
      setMessages([]);
    }
  };

  const handleExit = () => {
    setHasStarted(false);
    setMessages([]);
    setSelectedCharacter(CHARACTERS[0]);
    setUserName('');
  };

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden text-slate-200">
      
      {/* Sidebar - Character Selection */}
      <div className="hidden md:flex flex-col w-80 bg-[#1e293b] border-r border-slate-700 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 cursor-pointer" onClick={handleExit}>
          VoxChat AI
        </h1>
        
        <div className="mb-6 space-y-4">
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
               Seu Nome (Opcional)
             </label>
             <input 
               type="text" 
               value={userName}
               onChange={(e) => setUserName(e.target.value)}
               placeholder="Como devo te chamar?"
               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>

          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
               Modo
             </label>
             <div className="flex bg-slate-800 p-1 rounded-lg">
               <button 
                 onClick={() => { setMode(AppMode.CHAT); setMessages([]); }}
                 className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === AppMode.CHAT ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
               >
                 Chat
               </button>
               <button 
                 onClick={() => { setMode(AppMode.TTS); setMessages([]); }}
                 className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === AppMode.TTS ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
               >
                 Falar (TTS)
               </button>
             </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleDownloadConversation}
              disabled={messages.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Baixar Conversa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Baixar
            </button>
            <button 
              onClick={handleClearChat}
              disabled={messages.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Limpar Chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Limpar
            </button>
          </div>
          
          <button 
            onClick={handleExit}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg text-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sair
          </button>
        </div>

        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
          Personagens
        </label>
        <div className="flex flex-col gap-3">
          {CHARACTERS.map(char => (
            <CharacterCard 
              key={char.id}
              character={char}
              isSelected={selectedCharacter.id === char.id}
              onClick={() => handleCharacterChange(char)}
            />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header (Mobile only) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#1e293b] border-b border-slate-700 z-10">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500" onClick={handleExit}>VoxChat</h1>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={handleExit}
                className="p-2 bg-red-900/20 text-red-400 rounded-lg border border-red-900/50"
                title="Sair"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
             {messages.length > 0 && (
               <button 
                  onClick={handleClearChat}
                  className="p-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
                  title="Limpar Conversa"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
             )}
             <select 
              value={selectedCharacter.id} 
              onChange={(e) => {
                const char = CHARACTERS.find(c => c.id === e.target.value);
                if (char) handleCharacterChange(char);
              }}
              className="bg-slate-800 text-sm rounded-lg border-none focus:ring-2 focus:ring-blue-500 py-1 px-3 max-w-[120px]"
            >
              {CHARACTERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Chat Area / TTS Playground */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
           {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-50 text-center px-4">
                <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-4 border-slate-700 shadow-2xl relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                   <img src={selectedCharacter.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                </div>
                <h3 className="text-3xl font-bold mb-2 tracking-tight" style={{color: selectedCharacter.color}}>{selectedCharacter.name}</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-4">{selectedCharacter.description}</p>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-500">
                  {mode === AppMode.CHAT 
                    ? "Dica: Digite seu nome no menu para uma experiência personalizada."
                    : "Modo Repetição: A IA falará exatamente o que você escrever."}
                </div>
             </div>
           ) : (
             <>
               {messages.map((msg) => (
                 <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    accentColor={selectedCharacter.color} 
                  />
               ))}
               {/* Loading indicator for Chat mode specifically when waiting for TEXT generation */}
               {isLoading && mode === AppMode.CHAT && messages[messages.length - 1]?.role === 'user' && (
                 <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-sm border border-slate-700 flex items-center gap-2 shadow-lg">
                       <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                       <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                       <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
             </>
           )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#1e293b]/50 backdrop-blur-md border-t border-slate-700">
           {/* Image Preview */}
           {selectedImage && (
             <div className="max-w-4xl mx-auto mb-3 flex justify-start animate-in fade-in slide-in-from-bottom-4">
               <div className="relative group">
                 <img src={selectedImage.preview} alt="Preview" className="h-24 w-auto rounded-xl border border-slate-600 shadow-xl" />
                 <button 
                   onClick={removeSelectedImage}
                   className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                 >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               </div>
             </div>
           )}

          <div className="max-w-4xl mx-auto flex gap-3">
             {/* Image Input Trigger */}
             <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               onChange={handleFileSelect} 
               className="hidden" 
             />
             <button
               onClick={() => fileInputRef.current?.click()}
               className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                 selectedImage 
                   ? 'bg-blue-600/20 text-blue-400 border-blue-600/50' 
                   : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600'
               }`}
               title="Enviar Imagem"
               disabled={isLoading}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </button>

             <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={mode === AppMode.CHAT ? `Converse com ${selectedCharacter.name.split(' ')[0]}...` : "Digite o que a IA deve falar..."}
                disabled={isLoading}
                className="flex-1 bg-slate-800 border-slate-700 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 outline-none transition-all disabled:opacity-50 hover:border-slate-600"
             />
             <button
               onClick={handleSendMessage}
               disabled={isLoading || (!inputText.trim() && !selectedImage)}
               className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center min-w-[60px] shadow-lg shadow-blue-900/20"
             >
               {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
               )}
             </button>
          </div>
          <div className="text-center mt-2 flex justify-between px-4 max-w-4xl mx-auto">
             <div className="md:hidden">
                <button onClick={() => setMode(mode === AppMode.CHAT ? AppMode.TTS : AppMode.CHAT)} className="text-[10px] text-blue-400 uppercase font-bold">
                  {mode === AppMode.CHAT ? 'Ir para Modo Fala' : 'Ir para Chat'}
                </button>
             </div>
             <p className="text-[10px] text-slate-500 ml-auto">Powered by Gemini 2.5</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;