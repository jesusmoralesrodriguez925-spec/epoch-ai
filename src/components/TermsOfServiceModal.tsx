import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="terms-of-service-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          id="terms-of-service-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/90">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Términos y Condiciones de Servicio</h2>
                <p className="text-xs text-zinc-400">KODI AI Studio v6.4.0 • Contrato Legal de Usuario</p>
              </div>
            </div>
            <button
              id="terms-modal-close-btn"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm text-zinc-300 leading-relaxed custom-scrollbar">
            {/* Caution Box */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200">
              <div className="flex items-center gap-2 mb-1.5 font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Descargo de Responsabilidad de Código e IA</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300">
                El código y las recomendaciones arquitectónicas son generados mediante modelos de IA probabilísticos. <strong>Tú eres el único responsable de compilar, auditar y probar la seguridad de cualquier script o código generado antes de su puesta en producción.</strong> KODI no se responsabiliza por fallos o brechas en código de terceros.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" />
                1. Aceptación y Modificaciones
              </h3>
              <p className="text-xs sm:text-sm">
                Al acceder a KODI AI Studio, aceptas someterte a estos Términos. Nos reservamos el derecho de modificar estos términos notificando con antelación razonable mediante aviso en la plataforma o correo electrónico.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" />
                2. Usos Prohibidos y Conducta
              </h3>
              <p className="text-xs sm:text-sm">
                Queda expresamente prohibido usar la plataforma para desarrollar malware, ransomware, ejecutar ataques de denegación de servicio, escanear vulnerabilidades sin autorización, o intentar vulnerar el sandbox del servidor. La infracción conllevará la suspensión definitiva de la cuenta.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" />
                3. Propiedad Intelectual
              </h3>
              <p className="text-xs sm:text-sm">
                Conservas la plena titularidad y derechos sobre tus proyectos y código original generado en tu espacio de trabajo. KODI AI conserva todos los derechos sobre la marca, arquitectura del servidor, modelos y software propietario.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" />
                4. Pagos y Suscripciones Blockchain
              </h3>
              <p className="text-xs sm:text-sm">
                Los planes Pro y Max se activan por periodos de 30 días mediante USDT BEP20. Dado el carácter descentralizado e irreversible de la blockchain, las transacciones confirmadas no son reembolsables tras el inicio del consumo de créditos.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" />
                5. Limitación de Responsabilidad
              </h3>
              <p className="text-xs sm:text-sm">
                En la máxima medida que permita la ley, KODI no responderá por pérdidas económicas indirectas, interrupción de servicios o daños derivados de la aplicación de código o respuestas generadas por los modelos de IA.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/95">
            <span className="text-xs text-zinc-500">KODI Legal Team</span>
            <div className="flex items-center gap-3">
              <button
                id="terms-modal-secondary-btn"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
              >
                Cerrar
              </button>
              {onAccept && (
                <button
                  id="terms-modal-accept-btn"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acepto los Términos</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
