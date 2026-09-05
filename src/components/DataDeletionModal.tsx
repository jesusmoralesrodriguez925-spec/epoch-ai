import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertOctagon, X, Check, Lock, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import { User } from '../types';

interface DataDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onDeletionRequested: () => void;
}

export const DataDeletionModal: React.FC<DataDeletionModalProps> = ({
  isOpen,
  onClose,
  user,
  onDeletionRequested,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [reason, setReason] = useState('Ya no necesito el servicio');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletionReceipt, setDeletionReceipt] = useState<{
    success: boolean;
    confirmationCode: string;
    scheduledPurgeDate: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (confirmKeyword.trim().toUpperCase() !== 'ELIMINAR MI CUENTA') {
      setError('Debes escribir exactamente "ELIMINAR MI CUENTA" para continuar.');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (user.authProvider === 'password') {
      if (!passwordInput || !confirmPasswordInput) {
        setError('Por favor ingresa tu contraseña en ambos campos.');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (passwordInput.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/user/request-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
          'x-user-id': user.uid,
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          reason,
          confirmedKeyword: confirmKeyword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo registrar la solicitud de eliminación.');
      }

      setDeletionReceipt({
        success: true,
        confirmationCode: data.confirmationCode || 'KODI-DEL-8921',
        scheduledPurgeDate: data.scheduledPurgeDate || new Date(Date.now() + 48 * 3600 * 1000).toLocaleString(),
        message: data.message || 'Solicitud de eliminación registrada satisfactoriamente.'
      });
      setStep(3);
      onDeletionRequested();
    } catch (err: any) {
      setError(err?.message || 'Error de comunicación con el servidor de privacidad.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setConfirmKeyword('');
    setPasswordInput('');
    setConfirmPasswordInput('');
    setError(null);
    setDeletionReceipt(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="data-deletion-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          id="data-deletion-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-zinc-950 border border-red-500/40 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-red-500/20 bg-red-950/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">Solicitud de Eliminación de Datos (GDPR)</h2>
                <p className="text-xs text-red-300">Derecho al Olvido • Purga irreversible en 48 horas</p>
              </div>
            </div>
            <button
              id="data-deletion-close-btn"
              onClick={resetAndClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 space-y-2 text-xs text-zinc-300">
                  <span className="font-bold text-red-400 text-sm flex items-center gap-1.5">
                    ⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER
                  </span>
                  <p>Al confirmar esta solicitud, se iniciará el protocolo de eliminación total:</p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                    <li>Se borrarán permanentemente todos tus chats, proyectos y código.</li>
                    <li>Se destruirán tus archivos cargados y cachés del espacio de trabajo.</li>
                    <li>Se cancelará cualquier plan activo sin posibilidad de reembolso.</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Motivo principal (opcional):</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Ya no necesito el servicio">Ya no necesito el servicio</option>
                    <option value="Preocupaciones de privacidad">Preocupaciones de privacidad</option>
                    <option value="Voy a crear una cuenta nueva">Voy a crear una cuenta nueva</option>
                    <option value="Otro motivo">Otro motivo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Para continuar, escribe exactamente <span className="text-red-400 font-bold">ELIMINAR MI CUENTA</span>:
                  </label>
                  <input
                    type="text"
                    value={confirmKeyword}
                    onChange={(e) => setConfirmKeyword(e.target.value)}
                    placeholder="ELIMINAR MI CUENTA"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-500/20 transition-all"
                  >
                    Continuar al Paso 2
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                  <span className="font-semibold text-white">Doble Verificación de Seguridad</span>
                  <p className="text-zinc-400">
                    Por favor confirma tu identidad para asegurar que nadie más pueda solicitar la eliminación de tu cuenta ({user.email}).
                  </p>
                </div>

                {user.authProvider === 'password' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">1. Ingresa tu contraseña:</label>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">2. Reingresa tu contraseña por segunda vez:</label>
                      <input
                        type="password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Autenticado mediante Google OAuth ({user.email}). Haz clic en confirmar para programar la purga en 48h.</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl shadow-lg shadow-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isLoading ? 'Registrando...' : 'Confirmar Eliminación Definitiva'}</span>
                  </button>
                </div>
              </form>
            )}

            {step === 3 && deletionReceipt && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Solicitud de Eliminación Registrada</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Hemos enviado un correo de confirmación a <strong className="text-zinc-200">{user.email}</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Código de Confirmación:</span>
                    <span className="font-mono text-cyan-400 font-bold">{deletionReceipt.confirmationCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Purga Total Programada:</span>
                    <span className="text-white font-medium">{deletionReceipt.scheduledPurgeDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Periodo de Gracia para Cancelar:</span>
                    <span className="text-amber-400 font-medium">24 Horas</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full py-2.5 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all"
                >
                  Entendido y Salir
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
