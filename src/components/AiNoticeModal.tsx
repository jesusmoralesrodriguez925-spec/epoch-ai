import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Cpu, Globe, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AiNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiNoticeModal: React.FC<AiNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="ai-notice-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          id="ai-notice-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-zinc-900 border border-cyan-500/30 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-900/95 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Aviso de Inteligencia Artificial</h2>
                <p className="text-[11px] sm:text-xs text-cyan-400">Cumplimiento del Reglamento Europeo de IA (EU AI Act) & FTC</p>
              </div>
            </div>
            <button
              id="ai-notice-close-btn"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 text-xs sm:text-sm text-zinc-300 custom-scrollbar">
            <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 space-y-2.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 block">
                🤖 Declaración de Modelos
              </span>
              <p className="text-xs text-zinc-300">
                Este servicio emplea modelos generativos y agentes autónomos de Inteligencia Artificial provistos por:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col">
                  <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    Google Gemini 3.7
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">Razonamiento profundo y arquitectura</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col">
                  <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    Groq Llama 3.3
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">Inferencia ultrarrápida y ejecución</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col">
                  <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Tavily AI Search
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">Búsqueda técnica y documentación web</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300 text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Limitación de Responsabilidad de la IA</span>
              </div>
              <ul className="list-disc pl-4 sm:pl-5 space-y-1.5 text-xs text-zinc-300">
                <li>La IA puede cometer errores lógicos, sugerir dependencias obsoletas o generar código con vulnerabilidades.</li>
                <li>KODI no se responsabiliza por fallos en producción, pérdidas económicas o decisiones basadas en respuestas del modelo.</li>
                <li><strong>Es tu responsabilidad auditar y validar todo el código antes de desplegarlo.</strong></li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-4 sm:px-6 py-3 sm:py-3.5 border-t border-zinc-800 bg-zinc-900/95 shrink-0">
            <button
              id="ai-notice-accept-btn"
              onClick={onClose}
              className="flex items-center gap-1.5 sm:gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Entendido</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
