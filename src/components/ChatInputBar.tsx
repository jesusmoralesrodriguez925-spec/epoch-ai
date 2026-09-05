import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Paperclip, 
  Mic, 
  MicOff, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Camera, 
  X,
  Check,
  Crown,
  Lock,
  Sparkles,
  Zap,
  CreditCard
} from 'lucide-react';
import { ChatAttachment, KodiModelId, KodiModelInfo, User } from '../types';
import { MODEL_CREDIT_COSTS } from '../services/db';

export const KODI_MODELS: KodiModelInfo[] = [
  {
    id: 'nova-core-2.1',
    name: 'KODI Nova Core 2.1',
    version: '2.1',
    tagline: 'Balanceado y Rápido (2 cr/msg)',
    isPaid: false,
    creditCost: 2,
    description: 'Generación ágil de código y funciones inmediatas.',
    speed: 'Ultra rápido',
    intelligence: 'Estándar',
  },
  {
    id: 'omniscient-3.0',
    name: 'KODI Omniscient 3.0',
    version: '3.0',
    tagline: 'Arquitectura y Análisis (6 cr/msg)',
    badge: 'PRO',
    isPaid: true,
    creditCost: 6,
    description: 'Arquitectura de software y lógica avanzada.',
    speed: 'Rápido',
    intelligence: 'Avanzado',
  },
  {
    id: 'max-4.5',
    name: 'KODI Max Engineering 4.5',
    version: '4.5',
    tagline: 'Máxima Potencia Algorítmica (12 cr/msg)',
    badge: 'MAX',
    isPaid: true,
    creditCost: 12,
    description: 'Máxima potencia analítica y razonamiento profundo.',
    speed: 'Calculado',
    intelligence: 'Máxima',
  },
];

interface ChatInputBarProps {
  user: User;
  onSendMessage: (
    text: string, 
    attachments: ChatAttachment[], 
    isReasoningActive: boolean,
    selectedModel: KodiModelId
  ) => void;
  disabled?: boolean;
  currentTheme?: 'dark' | 'light';
  onOpenSettingsBilling?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  user,
  onSendMessage,
  disabled = false,
  currentTheme = 'dark',
  onOpenSettingsBilling,
}) => {
  const [text, setText] = useState('');
  const [selectedModel, setSelectedModel] = useState<KodiModelId>('nova-core-2.1');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState<KodiModelInfo | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [audioTranscriptError, setAudioTranscriptError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isLight = currentTheme === 'light';
  const isVipUser = user.isAdmin === true || user.email === 'jesusmoralesrodriguez925@gmail.com' || user.planTier === 'max' || user.credits === -1;
  const isProUser = user.planTier === 'pro';

  const currentModelInfo = KODI_MODELS.find((m) => m.id === selectedModel) || KODI_MODELS[0];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setAudioTranscriptError('Acceso al micrófono denegado en el navegador.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Toggle voice dictation
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta entrada por voz en este entorno.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setAudioTranscriptError(null);
      } catch (err) {
        console.warn('Voice recognition start error:', err);
      }
    }
  };

  // Read single file cleanly as text or base64 DataURL
  const readFileAsync = (file: File, fileType: 'file' | 'image'): Promise<ChatAttachment> => {
    return new Promise((resolve) => {
      const isImage = fileType === 'image' || file.type.startsWith('image/');
      const isTextOrCode = !isImage && (
        file.type.startsWith('text/') ||
        Boolean(file.name.match(/\.(py|ts|tsx|js|jsx|json|html|css|sql|sh|bash|c|cpp|h|java|kt|rs|go|xml|yaml|yml|md|txt|csv|log|env|ini|conf)$/i))
      );

      const sizeFormatted = file.size < 1024 * 1024 
        ? `${Math.max(0.1, Math.round((file.size / 1024) * 10) / 10)} KB` 
        : `${Math.round((file.size / (1024 * 1024)) * 10) / 10} MB`;

      const id = 'att-' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

      if (isTextOrCode) {
        const textReader = new FileReader();
        textReader.onload = () => {
          const textContent = (textReader.result as string) || '';
          resolve({
            id,
            name: file.name,
            type: 'file',
            mimeType: file.type || 'text/plain',
            size: sizeFormatted,
            data: textContent,
            url: `data:text/plain;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(textContent.substring(0, 50000))))}`,
          });
        };
        textReader.onerror = () => {
          resolve({
            id,
            name: file.name,
            type: 'file',
            mimeType: file.type || 'text/plain',
            size: sizeFormatted,
            data: '',
          });
        };
        textReader.readAsText(file);
      } else {
        // Images, PDFs and document files
        const dataReader = new FileReader();
        dataReader.onload = () => {
          const dataUrl = (dataReader.result as string) || '';
          const base64Content = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
          resolve({
            id,
            name: file.name,
            type: isImage ? 'image' : 'file',
            mimeType: file.type || (isImage ? 'image/jpeg' : 'application/pdf'),
            size: sizeFormatted,
            data: base64Content,
            url: dataUrl,
          });
        };
        dataReader.onerror = () => {
          resolve({
            id,
            name: file.name,
            type: isImage ? 'image' : 'file',
            mimeType: file.type || 'application/octet-stream',
            size: sizeFormatted,
            data: '',
          });
        };
        dataReader.readAsDataURL(file);
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    const fileList = Array.from(rawFiles);
    if (e.target) e.target.value = '';

    // 1. Filter out video files (video is not permitted)
    const validFiles = fileList.filter((f) => {
      const isVideo = f.type.startsWith('video/') || Boolean(f.name.match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/i));
      return !isVideo;
    });

    const hadVideo = validFiles.length < fileList.length;

    // 2. Check maximum 7 limit
    const currentCount = attachments.length;
    const remainingSlots = Math.max(0, 7 - currentCount);

    if (remainingSlots === 0) {
      setAudioTranscriptError('Límite alcanzado: Máximo 7 archivos adjuntos.');
      setTimeout(() => setAudioTranscriptError(null), 4000);
      setShowAttachMenu(false);
      return;
    }

    const filesToProcess = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots || hadVideo) {
      let msg = '';
      if (hadVideo) msg += 'Los videos no están soportados. ';
      if (validFiles.length > remainingSlots) msg += 'Se seleccionaron hasta 7 archivos máximos.';
      setAudioTranscriptError(msg.trim());
      setTimeout(() => setAudioTranscriptError(null), 4000);
    }

    try {
      const processed = await Promise.all(filesToProcess.map((f) => readFileAsync(f, type)));
      setAttachments((prev) => [...prev, ...processed].slice(0, 7));
    } catch (readErr) {
      console.warn('Error reading attached files:', readErr);
    }

    setShowAttachMenu(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSelectModel = (model: KodiModelInfo) => {
    // Model permission check
    if (model.id === 'max-4.5' && !isVipUser) {
      setShowPaywallModal(model);
      setShowModelMenu(false);
      return;
    }
    if (model.id === 'omniscient-3.0' && !isVipUser && !isProUser) {
      setShowPaywallModal(model);
      setShowModelMenu(false);
      return;
    }

    setSelectedModel(model.id);
    setShowModelMenu(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && attachments.length === 0) || disabled) return;

    onSendMessage(text.trim(), attachments, true, selectedModel);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // El botón de Enter del teclado hace un tab, NO envía el mensaje
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart ?? 0;
          const end = textarea.selectionEnd ?? 0;
          const tabValue = '\t';
          const newValue = text.substring(0, start) + tabValue + text.substring(end);
          setText(newValue);
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + tabValue.length;
            }
          });
        }
        return;
      }
      // Con Shift+Enter permite salto de línea en el textarea
      return;
    }

    // Tecla Tab también inserta tabulación en vez de perder el foco
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const tabValue = '\t';
        const newValue = text.substring(0, start) + tabValue + text.substring(end);
        setText(newValue);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + tabValue.length;
          }
        });
      }
      return;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 select-none">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, 'file')}
        className="hidden"
        multiple
        accept=".pdf,.txt,.py,.js,.ts,.tsx,.jsx,.html,.css,.json,.md,.csv,.sql,.sh,.bash,.c,.cpp,.h,.java,.kt,.rs,.go,.xml,.yaml,.yml,.doc,.docx,.xls,.xlsx,.ppt,.pptx,text/*,application/pdf,application/json,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <input
        type="file"
        ref={photoInputRef}
        onChange={(e) => handleFileChange(e, 'image')}
        accept="image/*"
        className="hidden"
        multiple
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => handleFileChange(e, 'image')}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Main Container */}
      <div className={`border rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-2xl transition-all relative ${
        isLight
          ? 'bg-white border-zinc-300 focus-within:border-zinc-500 shadow-zinc-300/40'
          : 'bg-[#121215] border-[#1f1f26] focus-within:border-[#2e2e3a]'
      }`}>
        
        {/* Attached Files Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 px-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className={`flex items-center space-x-2 rounded-xl px-2.5 py-1 text-xs border ${
                  isLight
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                    : 'bg-[#1b1b22] border-zinc-700/70 text-zinc-200'
                }`}
              >
                {att.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="truncate max-w-[140px]">{att.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="text-zinc-400 hover:text-red-500 ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Listening notification */}
        {isListening && (
          <div className="flex items-center space-x-2 text-xs text-amber-500 font-mono px-2 py-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Escuchando voz...</span>
          </div>
        )}

        {/* Error notification */}
        {audioTranscriptError && (
          <div className="text-[11px] text-zinc-400 px-2 mb-1">
            {audioTranscriptError}
          </div>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje o haz una consulta a KODI..."
          rows={1}
          disabled={disabled}
          className={`w-full bg-transparent text-xs sm:text-sm resize-none focus:outline-none px-2 py-1 max-h-[180px] [tab-size:4] ${
            isLight
              ? 'text-zinc-900 placeholder:text-zinc-400'
              : 'text-zinc-100 placeholder:text-zinc-500'
          }`}
        />

        {/* Controls Bar */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-transparent">
          
          {/* Left Controls: Attach button & Model Selector */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Attachment Button */}
            <div className="relative" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight
                    ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Adjuntar archivo o imagen"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Attachment Dropdown Menu */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute bottom-11 left-0 w-48 border rounded-2xl p-1.5 shadow-2xl z-40 space-y-1 ${
                      isLight
                        ? 'bg-white border-zinc-200 text-zinc-800'
                        : 'bg-[#15151b] border-[#262633] text-zinc-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-[#1e1e28] text-zinc-200'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      <span>Subir Fotos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-[#1e1e28] text-zinc-200'
                      }`}
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Hacer Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-[#1e1e28] text-zinc-200'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Subir Archivo</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Model Selector Dropdown */}
            <div className="relative" ref={modelMenuRef}>
              <button
                type="button"
                onClick={() => setShowModelMenu(!showModelMenu)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  selectedModel === 'max-4.5'
                    ? 'bg-[#18140a] border-[#443013] text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : selectedModel === 'omniscient-3.0'
                      ? 'bg-[#0f1422] border-[#1d2948] text-blue-300'
                      : isLight
                        ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                        : 'bg-[#181822] hover:bg-[#20202e] border-[#282838] text-zinc-200'
                }`}
              >
                {selectedModel === 'max-4.5' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ) : selectedModel === 'omniscient-3.0' ? (
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>{currentModelInfo.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">({currentModelInfo.creditCost} cr)</span>
              </button>

              {/* Model Menu Dropdown */}
              <AnimatePresence>
                {showModelMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute bottom-11 left-0 w-80 sm:w-88 max-w-[calc(100vw-2rem)] border rounded-2xl p-2 shadow-2xl z-40 space-y-1.5 ${
                      isLight
                        ? 'bg-white border-zinc-300 text-zinc-800'
                        : 'bg-[#111116] border-[#22222f] text-zinc-100'
                    }`}
                  >
                    <div className="px-2 py-1 text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                      Seleccionar Motor de Cómputo
                    </div>

                    {KODI_MODELS.map((model) => {
                      const isSelected = selectedModel === model.id;
                      const isLocked = (model.id === 'max-4.5' && !isVipUser) || (model.id === 'omniscient-3.0' && !isVipUser && !isProUser);

                      return (
                        <div
                          key={model.id}
                          onClick={() => handleSelectModel(model)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-zinc-100 border-zinc-400 shadow-sm'
                                : 'bg-[#1c1c28] border-[#38384e] shadow-md'
                              : isLight
                                ? 'hover:bg-zinc-50 border-transparent'
                                : 'hover:bg-[#161620] border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-bold ${
                                model.id === 'max-4.5' ? 'text-amber-400' : model.id === 'omniscient-3.0' ? 'text-blue-400' : isLight ? 'text-zinc-900' : 'text-white'
                              }`}>
                                {model.name}
                              </span>
                              {model.badge && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                  model.id === 'max-4.5' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}>
                                  {model.badge}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-mono text-zinc-400">
                                {model.creditCost} créditos
                              </span>
                              {isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                              ) : isSelected ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : null}
                            </div>
                          </div>

                          <p className="text-[11px] text-zinc-400 leading-normal break-words">
                            {model.description}
                          </p>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Controls: Microphone & Submit */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mic voice button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : isLight
                    ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Dictado por voz"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Message Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={(!text.trim() && attachments.length === 0) || disabled}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer ${
                text.trim() || attachments.length > 0
                  ? isLight
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md'
                    : 'bg-white text-black hover:bg-zinc-200 shadow-md font-bold'
                  : isLight
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paywall locked modal */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md border rounded-2xl p-6 shadow-2xl relative ${
            isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-[#111116] border-[#232332] text-white'
          }`}>
            <button
              onClick={() => setShowPaywallModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold mb-1">
              Desbloquea {showPaywallModal.name}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Este modelo requiere un plan superior ({showPaywallModal.id === 'max-4.5' ? 'Plan Max - 29 USDT' : 'Plan Pro - 15 USDT'}). Consume {showPaywallModal.creditCost} créditos por mensaje.
            </p>

            <button
              onClick={() => {
                setShowPaywallModal(null);
                if (onOpenSettingsBilling) {
                  onOpenSettingsBilling();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              Ver Planes de Facturación en USDT BEP20
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
