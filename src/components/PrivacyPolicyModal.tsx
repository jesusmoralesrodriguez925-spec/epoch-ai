import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="privacy-policy-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          id="privacy-policy-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/90">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Política de Privacidad y Protección de Datos</h2>
                <p className="text-xs text-zinc-400">KODI AI Studio v6.4.0 • Cumplimiento GDPR, CCPA & EU AI Act</p>
              </div>
            </div>
            <button
              id="privacy-modal-close-btn"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm text-zinc-300 leading-relaxed custom-scrollbar">
            {/* AI Warning Box */}
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
              <div className="flex items-center gap-2 mb-1.5 font-semibold text-cyan-300">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Aviso Obligatorio de Procesamiento por Inteligencia Artificial</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300">
                KODI AI Studio utiliza infraestructura de Inteligencia Artificial de <strong>Google Gemini (3.7/2.5)</strong> y <strong>Groq Inc. (Llama 3.3 70B)</strong>, junto con el motor de búsqueda en tiempo real de <strong>Tavily AI</strong>. Al utilizar la plataforma, comprendes y autorizas que los prompts, fragmentos de código e instrucciones técnicas sean procesados por estos servicios exclusivamente para generar los artefactos y código solicitados.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block" />
                1. Datos Recopilados
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300 text-xs sm:text-sm">
                <li><strong>Datos de Cuenta:</strong> Nombre o alias, correo electrónico verificado, rol y nivel de suscripción (`free`, `pro`, `max`).</li>
                <li><strong>Datos de Uso:</strong> Mensajes de chat, código analizado o ejecutado dentro del sandbox aislado, y archivos adjuntos del espacio de trabajo.</li>
                <li><strong>Datos Técnicos:</strong> Dirección IP registrada al otorgar consentimientos (para fines de auditoría y prueba legal), tipo de navegador y logs sanitizados.</li>
                <li><strong>Datos de Pago:</strong> Hashes públicos de transacciones USDT en BNB Smart Chain (BEP20). <em>KODI no recopila ni almacena datos de tarjetas de crédito o contraseñas privadas.</em></li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block" />
                2. Terceros Subcontratistas
              </h3>
              <p className="text-xs sm:text-sm">
                Compartimos datos estrictamente con Google Gemini (procesamiento de lenguaje natural y código), Groq Inc. (ejecución rápida de inferencia), Tavily Search (búsquedas web técnicas), Etherscan/BscScan (verificación de transacciones públicas) y Supabase / Firebase (almacenamiento cifrado de bases de datos).
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block" />
                3. Derechos del Usuario (GDPR & CCPA)
              </h3>
              <p className="text-xs sm:text-sm">
                Tienes derecho inalienable a acceder a tus datos, solicitar su rectificación, descargarlos en formato legible JSON (portabilidad) o solicitar su <strong>eliminación total e irreversible (Derecho al Olvido)</strong> en un plazo máximo garantizado de 48 horas hábiles.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block" />
                4. Política de Testimonios y Veracidad
              </h3>
              <p className="text-xs sm:text-sm">
                KODI no fabrica testimonios ni utiliza reseñas automatizadas de bots. Todos los testimonios proceden de cuentas verificadas con consentimiento expreso. Si deseas revocar un testimonio previamente aprobado, será retirado de inmediato.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block" />
                5. Contacto Legal y DPO
              </h3>
              <p className="text-xs sm:text-sm">
                Creador y Desarrollador: <strong>Jesús Morales Rodríguez</strong><br />
                Oficial de Privacidad: <strong>Jesús Morales Rodríguez</strong><br />
                Email de Contacto: <a href="mailto:jesusmoralesrodriguez925@gmail.com" className="text-cyan-400 underline">jesusmoralesrodriguez925@gmail.com</a>
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/95">
            <span className="text-xs text-zinc-500">Última revisión: Agosto 2026</span>
            <div className="flex items-center gap-3">
              <button
                id="privacy-modal-secondary-btn"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
              >
                Cerrar
              </button>
              {onAccept && (
                <button
                  id="privacy-modal-accept-btn"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entiendo y Acepto</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
