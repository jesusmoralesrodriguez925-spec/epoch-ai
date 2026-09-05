import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  CreditCard, 
  Palette, 
  LogOut, 
  X, 
  Check, 
  Sparkles, 
  Camera, 
  Copy, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Crown, 
  Lock, 
  ArrowRight, 
  HelpCircle, 
  Send, 
  Mail, 
  Smartphone, 
  Info,
  Shield,
  Trash2,
  Download,
  Scale
} from 'lucide-react';
import { User, PlanTier } from '../types';
import { updateUserProfileData, upgradeUserPlan, setUserPlanDirectly, MODEL_CREDIT_COSTS } from '../services/db';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { AiNoticeModal } from './AiNoticeModal';
import { DataDeletionModal } from './DataDeletionModal';
import { DataExportButton } from './DataExportButton';

export type SettingsTab = 'profile' | 'billing' | 'theme' | 'support' | 'legal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSignOut: () => void;
  onUpdateUser: (updatedUser: User) => void;
  currentTheme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
  initialTab?: SettingsTab;
}

const USDT_WALLET_ADDRESS = '0xe10D30B2914B49d28C8a4BE47e10D9FF61dbeE83';
const SUPPORT_EMAIL = 'jesusmoralesrodriguez925@gmail.com';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
  onUpdateUser,
  currentTheme,
  onToggleTheme,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Profile editing states
  const [displayName, setDisplayName] = useState(user?.displayName || 'Usuario');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName || 'Usuario');
      setPhotoURL(user.photoURL || '');
      setSupportName(user.displayName || 'Usuario');
      setSupportEmail(user.email || '');
    }
  }, [isOpen, user?.displayName, user?.photoURL, user?.email]);

  // Billing / Payment states
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<PlanTier | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Support states
  const [supportName, setSupportName] = useState(user?.displayName || 'Usuario');
  const [supportEmail, setSupportEmail] = useState(user?.email || '');
  const [supportCategory, setSupportCategory] = useState('Consulta General');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState<{ ticketId: string; message: string; mailtoUrl: string } | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);

  // Legal & Privacy modal states
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showDataDeletionModal, setShowDataDeletionModal] = useState(false);

  if (!isOpen) return null;

  const userEmail = (user?.email || '').toLowerCase();
  const isAdmin = Boolean(user?.isAdmin) || userEmail === 'jesusmoralesrodriguez925@gmail.com' || user?.credits === -1;
  const isLight = currentTheme === 'light';

  // Handle profile photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoURL(base64);
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const updated = updateUserProfileData(user.uid, {
      displayName: displayName.trim() || user.displayName,
      photoURL: photoURL || user.photoURL,
    });

    if (updated) {
      onUpdateUser(updated);
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3000);
    }
    setIsSavingProfile(false);
  };

  // Copy wallet address
  const handleCopyWallet = () => {
    navigator.clipboard.writeText(USDT_WALLET_ADDRESS);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2500);
  };

  // Verify BEP20 Payment Hash via Etherscan V2 Backend
  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanToBuy || !txHashInput.trim()) return;

    setIsVerifyingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    const cleanHash = txHashInput.trim();

    try {
      const response = await fetch('/api/crypto/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: cleanHash,
          plan: selectedPlanToBuy,
          userId: user.uid,
          userEmail: user.email
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Upgrade user in local persistent store
        const result = upgradeUserPlan(user.uid, data.planTier || selectedPlanToBuy, cleanHash);
        setIsVerifyingPayment(false);
        setPaymentSuccess(data.message || `¡Pago verificado en la blockchain! Plan ${String(data.planTier || selectedPlanToBuy).toUpperCase()} activado exitosamente.`);
        if (result.user) {
          onUpdateUser({
            ...result.user,
            planTier: data.planTier || selectedPlanToBuy,
            credits: data.credits !== undefined ? data.credits : result.user.credits,
            maxDailyCredits: data.credits !== undefined ? data.credits : result.user.maxDailyCredits,
            planExpirationDate: data.planExpirationDate || result.user.planExpirationDate
          });
        }
        setSelectedPlanToBuy(null);
        setTxHashInput('');
      } else {
        setIsVerifyingPayment(false);
        setPaymentError(data.error || data.message || 'No se pudo validar la transacción en BSC BEP20.');
      }
    } catch (netErr: any) {
      // Fallback local upgrade if network timeout on API
      const result = upgradeUserPlan(user.uid, selectedPlanToBuy, cleanHash);
      setIsVerifyingPayment(false);
      if (result.success && result.user) {
        setPaymentSuccess(result.message);
        onUpdateUser(result.user);
        setSelectedPlanToBuy(null);
        setTxHashInput('');
      } else {
        setPaymentError(result.message || 'Error de conexión al verificar el Hash.');
      }
    }
  };

  // Submit Support Ticket to Backend
  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setIsSendingSupport(true);
    setSupportError(null);
    setSupportSuccess(null);

    const fullSubject = `[${supportCategory}] ${supportSubject.trim() || 'Consulta KODI'}`;

    try {
      const res = await fetch('/api/support/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supportName.trim() || user.displayName || 'Usuario',
          email: supportEmail.trim() || user.email || 'usuario@kodi.ai',
          subject: fullSubject,
          message: supportMessage.trim(),
          userId: user.uid,
          planTier: user.planTier || 'free',
          includeSystemInfo: true
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSendingSupport(false);
        setSupportSuccess({
          ticketId: data.ticketId,
          message: data.message,
          mailtoUrl: data.mailtoUrl
        });
        setSupportSubject('');
        setSupportMessage('');
      } else {
        setIsSendingSupport(false);
        setSupportError(data.error || 'No se pudo enviar el mensaje. Intenta de nuevo o usa el botón de correo directo.');
      }
    } catch (err: any) {
      setIsSendingSupport(false);
      // Fallback mailto trigger
      const fallbackMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(
        `Hola Equipo de Soporte de KODI,\n\nSoy ${supportName} (${supportEmail}).\nPlan: ${user.planTier || 'Free'}\nUID: ${user.uid}\n\nMensaje:\n${supportMessage}\n\n--\nEnviado desde KODI AI Studio.`
      )}`;
      setSupportSuccess({
        ticketId: `KODI-SUP-LOCAL-${Date.now().toString(36).toUpperCase()}`,
        message: `Se ha generado tu ticket. Haz clic en "Abrir en mi Correo" para enviar directamente a ${SUPPORT_EMAIL}.`,
        mailtoUrl: fallbackMailto
      });
    }
  };

  // Compute credit percentages
  const maxCredits = user.maxDailyCredits === -1 ? 100 : (user.maxDailyCredits || 50);
  const currentCredits = user.credits === -1 ? 100 : user.credits;
  const spentCredits = user.totalSpentCredits || 0;
  const creditPercent = user.credits === -1 ? 100 : Math.min(100, Math.max(0, (currentCredits / maxCredits) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh] ${
            isLight
              ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/20'
              : 'bg-[#0d0d12] border-[#22222e] text-zinc-100'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-600 hover:text-zinc-900'
                : 'bg-[#14141c] hover:bg-[#20202c] border-[#2b2b3b] text-zinc-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Navigation Sidebar */}
          <div className={`w-full md:w-56 border-b md:border-b-0 md:border-r p-4 flex flex-col justify-between ${
            isLight
              ? 'bg-zinc-50 border-zinc-200'
              : 'bg-[#09090d] border-[#1a1a24]'
          }`}>
            <div>
              <div className="px-2 py-1 mb-4">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-zinc-900' : 'text-white'
                }`}>
                  Configuración
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono">KODI Engine v3.0</p>
              </div>

              <nav className="space-y-1">
                {/* 1. Perfil */}
                <button
                  id="tab-settings-profile"
                  onClick={() => {
                    setActiveTab('profile');
                    setSelectedPlanToBuy(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                    activeTab === 'profile'
                      ? isLight
                        ? 'bg-zinc-200 text-zinc-900 border border-zinc-300 font-semibold'
                        : 'bg-[#1c1c28] text-white border border-[#333348]'
                      : isLight
                        ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121218]'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                  <span>Perfil</span>
                </button>

                {/* 2. Facturación */}
                <button
                  id="tab-settings-billing"
                  onClick={() => {
                    setActiveTab('billing');
                    setSelectedPlanToBuy(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                    activeTab === 'billing'
                      ? isLight
                        ? 'bg-zinc-200 text-zinc-900 border border-zinc-300 font-semibold'
                        : 'bg-[#1c1c28] text-white border border-[#333348]'
                      : isLight
                        ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121218]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-zinc-400" />
                  <span>Facturación</span>
                </button>

                {/* 3. Tema */}
                <button
                  id="tab-settings-theme"
                  onClick={() => {
                    setActiveTab('theme');
                    setSelectedPlanToBuy(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                    activeTab === 'theme'
                      ? isLight
                        ? 'bg-zinc-200 text-zinc-900 border border-zinc-300 font-semibold'
                        : 'bg-[#1c1c28] text-white border border-[#333348]'
                      : isLight
                        ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121218]'
                  }`}
                >
                  <Palette className="w-4 h-4 text-zinc-400" />
                  <span>Tema</span>
                </button>

                {/* 4. Soporte (Ubicado justo abajo de Temas) */}
                <button
                  id="tab-settings-support"
                  onClick={() => {
                    setActiveTab('support');
                    setSelectedPlanToBuy(null);
                    setSupportSuccess(null);
                    setSupportError(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                    activeTab === 'support'
                      ? isLight
                        ? 'bg-zinc-200 text-zinc-900 border border-zinc-300 font-semibold'
                        : 'bg-[#1c1c28] text-white border border-[#333348]'
                      : isLight
                        ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121218]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                  <span>Soporte</span>
                </button>

                {/* 5. Privacidad y Legal (GDPR, CCPA, Portabilidad & Olvido) */}
                <button
                  id="tab-settings-legal"
                  onClick={() => {
                    setActiveTab('legal');
                    setSelectedPlanToBuy(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                    activeTab === 'legal'
                      ? isLight
                        ? 'bg-zinc-200 text-zinc-900 border border-zinc-300 font-semibold'
                        : 'bg-[#1c1c28] text-white border border-[#333348]'
                      : isLight
                        ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121218]'
                  }`}
                >
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Privacidad & Legal</span>
                </button>
              </nav>
            </div>

            {/* 6. Cerrar sesión */}
            <div className={`pt-4 mt-4 border-t ${
              isLight ? 'border-zinc-200' : 'border-[#1a1a24]'
            }`}>
              <button
                id="btn-settings-signout"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 flex items-center space-x-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className={`flex-1 p-6 overflow-y-auto ${
            isLight ? 'bg-white' : 'bg-[#0d0d12]'
          }`}>
            {/* ========================================================= */}
            {/* TAB 1: PERFIL */}
            {/* ========================================================= */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h4 className={`text-sm font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Perfil de Usuario
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Modifica tu nombre, avatar e información de cuenta personal.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>¡Perfil actualizado con éxito!</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Photo & Avatar editing */}
                  <div className={`p-4 border rounded-xl flex items-center space-x-4 ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#121218] border-[#20202c]'
                  }`}>
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      {photoURL ? (
                        <img
                          src={photoURL}
                          alt={displayName}
                          className="w-16 h-16 rounded-full border border-zinc-700 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-bold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-4 h-4" />
                        <span className="text-[9px] font-medium mt-0.5">Cambiar</span>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                          Foto de Perfil
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-zinc-200 hover:bg-zinc-300 border-zinc-300 text-zinc-700'
                              : 'bg-[#1a1a24] hover:bg-[#252535] border-[#2c2c3e] text-zinc-300'
                          }`}
                        >
                          Subir imagen
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Sube una foto JPG, PNG o WebP desde tu dispositivo.
                      </p>
                    </div>
                  </div>

                  {/* ID de Usuario Personal Completo */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      ID de Usuario (UID Personal)
                    </label>
                    <div className={`flex items-center justify-between px-3 py-2 border rounded-xl ${
                      isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#121218] border-[#20202c]'
                    }`}>
                      <span className={`text-xs font-mono font-bold tracking-wider ${
                        isAdmin ? 'text-amber-500' : isLight ? 'text-zinc-800' : 'text-zinc-200'
                      }`}>
                        {user.uid}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/40 text-zinc-400 font-mono">
                        Identificador Único
                      </span>
                    </div>
                  </div>

                  {/* Nombre Completo editable */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre..."
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${
                        isLight
                          ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-500'
                          : 'bg-[#121218] border-[#20202c] text-zinc-200 focus:border-zinc-500'
                      }`}
                      required
                    />
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user.email}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-mono opacity-80 cursor-not-allowed ${
                        isLight
                          ? 'bg-zinc-100 border-zinc-200 text-zinc-700'
                          : 'bg-[#121218] border-[#20202c] text-zinc-400'
                      }`}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.99] cursor-pointer ${
                        isLight
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-md'
                          : 'bg-white hover:bg-zinc-200 text-black font-bold'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSavingProfile ? 'Guardando...' : 'Guardar Cambios de Perfil'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: FACTURACIÓN & PLANES CON USDT BEP20 */}
            {/* ========================================================= */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h4 className={`text-sm font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Facturación y Planes
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Gestiona tu plan activo, consumo de créditos y recargas vía USDT BEP20.
                  </p>
                </div>

                {/* Credit Usage Progress Bar */}
                <div className={`p-4 border rounded-xl space-y-2.5 ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#121218] border-[#20202c]'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">Créditos de Cómputo Hoy</span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {user.credits === -1 ? 'Ilimitados (Creador)' : `${user.credits} disponibles / ${maxCredits} diarios`}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2.5 bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        user.credits === -1
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-300 w-full'
                          : creditPercent > 30
                            ? 'bg-emerald-500'
                            : creditPercent > 10
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${user.credits === -1 ? 100 : creditPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Gastados hoy: {spentCredits} créditos</span>
                    <span>Consumo por modelo: Nova (2), Omniscient (6), Max (12)</span>
                  </div>
                </div>

                {/* Three Plans Display: Free, Pro, Max */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. FREE PLAN */}
                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    user.planTier === 'free'
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#101016] border-[#1e1e28]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h5 className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                          Plan Free
                        </h5>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                          Defecto
                        </span>
                      </div>
                      <p className="text-lg font-extrabold text-white mb-2 font-mono">
                        $0 <span className="text-[10px] text-zinc-400 font-normal">/ para siempre</span>
                      </p>
                      <ul className="text-[11px] text-zinc-400 space-y-1.5 mb-4">
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>50 créditos diarios</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>KODI Nova Core 2.1 (2 cr/msg)</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Reinicio a las 00:00 UTC</span>
                        </li>
                      </ul>
                    </div>

                    {user.planTier === 'free' ? (
                      <div className="w-full py-1.5 text-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                        Plan Activo (Por Defecto)
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const res = setUserPlanDirectly(user.uid, 'free');
                          if (res.user) onUpdateUser(res.user);
                        }}
                        className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Activar Plan Free
                      </button>
                    )}
                  </div>

                  {/* 2. PRO PLAN (15 USDT) */}
                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between relative overflow-hidden ${
                    user.planTier === 'pro'
                      ? 'border-blue-500/50 bg-blue-950/10 shadow-lg'
                      : isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#101016] border-[#1e1e28]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h5 className={`text-xs font-bold text-blue-400`}>
                          Plan Pro
                        </h5>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-lg font-extrabold text-white mb-2 font-mono">
                        15 USDT <span className="text-[10px] text-zinc-400 font-normal">/ 1 mes</span>
                      </p>
                      <ul className="text-[11px] text-zinc-400 space-y-1.5 mb-4">
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                          <span>300 créditos diarios</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                          <span>Omniscient 3.0 (6 cr/msg)</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                          <span>Duración: 30 días</span>
                        </li>
                      </ul>
                    </div>

                    {user.planTier === 'pro' ? (
                      <div className="w-full py-1.5 text-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold">
                        Plan Activo {user.planExpirationDate ? `(Expira: ${new Date(user.planExpirationDate).toLocaleDateString()})` : ''}
                      </div>
                    ) : isAdmin ? (
                      <button
                        onClick={() => {
                          const res = setUserPlanDirectly(user.uid, 'pro');
                          if (res.user) onUpdateUser(res.user);
                        }}
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Activar Plan Pro
                      </button>
                    ) : (
                      <button
                        id="btn-buy-pro-plan"
                        onClick={() => {
                          setSelectedPlanToBuy('pro');
                          setPaymentError(null);
                          setPaymentSuccess(null);
                        }}
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <span>Obtener</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* 3. MAX PLAN (29 USDT) */}
                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between relative overflow-hidden ${
                    user.planTier === 'max'
                      ? 'border-amber-500/50 bg-amber-950/10 shadow-lg'
                      : isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#101016] border-[#1e1e28]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Plan Max</span>
                        </h5>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                          INSIGNIA
                        </span>
                      </div>
                      <p className="text-lg font-extrabold text-white mb-2 font-mono">
                        29 USDT <span className="text-[10px] text-zinc-400 font-normal">/ 1 mes</span>
                      </p>
                      <ul className="text-[11px] text-zinc-400 space-y-1.5 mb-4">
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-semibold text-zinc-200">2,500 créditos diarios (Paquete Masivo)</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span><strong>Activa los 2 Modelos:</strong> Max Engineering 4.5 + Omniscient 3.0</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span><strong>Todas las Funciones:</strong> FinOps, Búsqueda Web, Generación & Exportaciones</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span>Duración: 30 días (1 mes - expira al término)</span>
                        </li>
                      </ul>
                    </div>

                    {user.planTier === 'max' ? (
                      <div className="w-full py-1.5 text-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">
                        Plan Activo {isAdmin ? '(Creador)' : user.planExpirationDate ? `(Expira: ${new Date(user.planExpirationDate).toLocaleDateString()})` : ''}
                      </div>
                    ) : isAdmin ? (
                      <button
                        onClick={() => {
                          const res = setUserPlanDirectly(user.uid, 'max');
                          if (res.user) onUpdateUser(res.user);
                        }}
                        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        Activar Plan Max
                      </button>
                    ) : (
                      <button
                        id="btn-buy-max-plan"
                        onClick={() => {
                          setSelectedPlanToBuy('max');
                          setPaymentError(null);
                          setPaymentSuccess(null);
                        }}
                        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <span>Obtener</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* USDT BEP20 Payment Modal / Section if a plan is clicked */}
                {selectedPlanToBuy && (
                  <div className={`p-4 border rounded-xl space-y-3.5 animate-fadeIn ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[#15151f] border-[#2d2d40]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Pagar {selectedPlanToBuy === 'pro' ? 'Plan Pro (15 USDT)' : 'Plan Max (29 USDT)'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                          Red BNB Smart Chain (BEP20)
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedPlanToBuy(null)}
                        className="text-zinc-400 hover:text-white text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg space-y-1.5">
                      <label className="block text-[10px] text-zinc-400 uppercase font-semibold">
                        Dirección de Wallet para enviar USDT BEP20:
                      </label>
                      <div className="flex items-center justify-between space-x-2">
                        <span className="text-xs font-mono text-zinc-200 select-all break-all">
                          {USDT_WALLET_ADDRESS}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyWallet}
                          className="px-2.5 py-1 rounded bg-[#222230] hover:bg-[#2c2c40] text-zinc-200 text-[10px] font-medium flex items-center space-x-1 flex-shrink-0 transition-colors cursor-pointer"
                        >
                          {copiedWallet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedWallet ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    {paymentSuccess && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center space-x-2">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>{paymentSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleVerifyPayment} className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                          Pega el Hash de Transacción (TX Hash BEP20) para verificar tu pago:
                        </label>
                        <input
                          type="text"
                          value={txHashInput}
                          onChange={(e) => setTxHashInput(e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifyingPayment}
                        className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        {isVerifyingPayment ? (
                          <span>Verificando transacción en BEP20...</span>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Verificar Pago y Activar Plan</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: TEMA (CLARO Y OSCURO POR DEFECTO) */}
            {/* ========================================================= */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                <div>
                  <h4 className={`text-sm font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Tema y Apariencia
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Selecciona entre el Tema Oscuro (por defecto) y el Tema Claro de alta legibilidad.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* Tema Oscuro (Default) */}
                  <div
                    id="theme-select-dark"
                    onClick={() => onToggleTheme('dark')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      !isLight
                        ? 'bg-[#181824] border-zinc-400 shadow-lg ring-1 ring-zinc-400'
                        : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    <div className="w-full h-16 bg-black rounded-lg border border-zinc-800 mb-2.5 p-2 flex flex-col justify-between">
                      <div className="w-8 h-2 bg-zinc-700 rounded"></div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Tema Oscuro</span>
                        <span className="text-[10px] text-zinc-400 font-mono">Por defecto</span>
                      </div>
                      {!isLight && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  {/* Tema Claro */}
                  <div
                    id="theme-select-light"
                    onClick={() => onToggleTheme('light')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isLight
                        ? 'bg-zinc-100 border-zinc-800 shadow-lg ring-1 ring-zinc-800'
                        : 'bg-[#101016] border-[#22222e] hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-full h-16 bg-white rounded-lg border border-zinc-300 mb-2.5 p-2 flex flex-col justify-between">
                      <div className="w-8 h-2 bg-zinc-300 rounded"></div>
                      <div className="w-full h-1.5 bg-zinc-200 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-zinc-300'} block`}>
                          Tema Claro
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">Luminoso y nítido</span>
                      </div>
                      {isLight && <Check className="w-4 h-4 text-zinc-900" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: SOPORTE TÉCNICO Y CONTACTO DIRECTO */}
            {/* ========================================================= */}
            {activeTab === 'support' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h4 className={`text-sm font-semibold flex items-center space-x-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Soporte Técnico y Contacto Directo</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Envía tus dudas, sugerencias o reportes directamente a la bandeja del desarrollador.
                  </p>
                </div>

                {/* Email Banner Card */}
                <div className={`p-4 border rounded-xl space-y-2.5 ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#121218] border-[#20202c]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bandeja Oficial de Soporte</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      Atención Directa
                    </span>
                  </div>

                  <div className="p-2.5 bg-black/40 border border-zinc-800 rounded-lg">
                    <span className="text-xs font-mono font-semibold text-zinc-100 select-all break-all">
                      {SUPPORT_EMAIL}
                    </span>
                  </div>
                </div>

                {/* Success Banner */}
                {supportSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>{supportSuccess.message}</span>
                    </div>
                    <div className="text-[11px] text-zinc-300 font-mono">
                      Ticket ID: <span className="text-emerald-400 font-bold">{supportSuccess.ticketId}</span>
                    </div>
                    {supportSuccess.mailtoUrl && (
                      <div className="pt-1">
                        <a
                          href={supportSuccess.mailtoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Abrir copia en mi aplicación de Correo / Gmail</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Banner */}
                {supportError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{supportError}</span>
                  </div>
                )}

                {/* Support Form */}
                <form onSubmit={handleSendSupport} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Tu Nombre
                      </label>
                      <input
                        type="text"
                        value={supportName}
                        onChange={(e) => setSupportName(e.target.value)}
                        placeholder="Nombre o alias"
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-500'
                            : 'bg-[#121218] border-[#20202c] text-zinc-200 focus:border-amber-400'
                        }`}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Tu Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-500'
                            : 'bg-[#121218] border-[#20202c] text-zinc-200 focus:border-amber-400'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Category & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Categoría
                      </label>
                      <select
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-500'
                            : 'bg-[#121218] border-[#20202c] text-zinc-200 focus:border-amber-400'
                        }`}
                      >
                        <option value="Consulta General">Consulta General</option>
                        <option value="Error o Bug">Reporte de Error / Bug</option>
                        <option value="Planes y Pagos USDT">Planes y Pagos USDT</option>
                        <option value="Generación y Respuestas">Generación y Respuestas</option>
                        <option value="Instalación WebAPK Móvil">Instalación WebAPK Móvil</option>
                        <option value="Sugerencia de Función">Sugerencia de Función</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Asunto
                      </label>
                      <input
                        type="text"
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        placeholder="Resumen de tu duda o problema..."
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-500'
                            : 'bg-[#121218] border-[#20202c] text-zinc-200 focus:border-amber-400'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Descripción Detallada
                    </label>
                    <textarea
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Explica detalladamente qué duda tienes o qué problema ocurrió para ayudarte de inmediato..."
                      rows={4}
                      className={`w-full border rounded-xl p-3 text-xs focus:outline-none transition-colors resize-none ${
                        isLight
                          ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-500'
                          : 'bg-[#121218] border-[#20202c] text-zinc-200 focus:border-amber-400'
                      }`}
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={isSendingSupport}
                      className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingSupport ? 'Enviando a la bandeja...' : `Enviar a ${SUPPORT_EMAIL}`}</span>
                    </button>

                    <a
                      href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[${supportCategory}] ${supportSubject || 'Consulta KODI'}`)}&body=${encodeURIComponent(
                        `Hola Equipo de Soporte de KODI,\n\nSoy ${supportName} (${supportEmail}).\nPlan: ${user.planTier || 'Free'}\nUID: ${user.uid}\n\nMensaje:\n${supportMessage || 'Escribe tu mensaje aquí...'}`
                      )}`}
                      className={`w-full sm:w-auto py-2.5 px-4 border rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                          : 'bg-[#1a1a24] hover:bg-[#242434] border-[#2c2c3e] text-zinc-200'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Abrir en Gmail</span>
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: PRIVACIDAD, GDPR & CUMPLIMIENTO LEGAL */}
            {/* ========================================================= */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <div>
                  <h4 className={`text-sm font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Privacidad y Derechos Legales
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Gestión de datos conforme a GDPR (UE), CCPA (EE.UU.), EU AI Act y políticas de transparencia.
                  </p>
                </div>

                {/* 1. Portabilidad de Datos (GDPR Art. 20) */}
                <div className={`p-4 border rounded-xl space-y-3 ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#121218] border-[#20202c]'
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h5 className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>
                        Portabilidad de Datos (Exportar en JSON)
                      </h5>
                      <p className="text-[11px] text-zinc-400">
                        Descarga una copia completa de tu perfil, historial de sesiones, archivos y consentimientos.
                      </p>
                    </div>
                  </div>
                  <DataExportButton user={user} />
                </div>

                {/* 2. Documentos y Avisos Legales */}
                <div className={`p-4 border rounded-xl space-y-3 ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#121218] border-[#20202c]'
                }`}>
                  <h5 className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>
                    Documentación Legal Oficial
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      id="btn-open-privacy-policy"
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-medium text-cyan-400 block">Política de Privacidad</span>
                      <span className="text-[10px] text-zinc-500">v6.4.0 • GDPR & CCPA</span>
                    </button>
                    <button
                      id="btn-open-terms-of-service"
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-medium text-indigo-400 block">Términos de Servicio</span>
                      <span className="text-[10px] text-zinc-500">Contrato de Usuario</span>
                    </button>
                    <button
                      id="btn-open-ai-notice"
                      type="button"
                      onClick={() => setShowAiModal(true)}
                      className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-medium text-emerald-400 block">Aviso de IA</span>
                      <span className="text-[10px] text-zinc-500">EU AI Act & FTC</span>
                    </button>
                  </div>
                </div>

                {/* 3. Zona de Peligro: Eliminación de Datos (Derecho al Olvido - GDPR Art. 17) */}
                <div className="p-4 border border-red-500/30 bg-red-950/20 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-red-400">
                    <Trash2 className="w-4 h-4" />
                    <h5 className="text-xs font-bold uppercase tracking-wider">
                      Derecho al Olvido (Eliminación de Cuenta y Datos)
                    </h5>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Puedes solicitar la eliminación total e irreversible de tu cuenta, chats, archivos y proyectos. Todos tus datos serán purgados de forma permanente en un plazo máximo de 48 horas.
                  </p>
                  <button
                    id="btn-open-deletion-modal"
                    type="button"
                    onClick={() => setShowDataDeletionModal(true)}
                    className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Solicitar Eliminación de Datos (48h)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Modales Legales */}
        <PrivacyPolicyModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
        />
        <TermsOfServiceModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
        />
        <AiNoticeModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
        />
        <DataDeletionModal
          isOpen={showDataDeletionModal}
          onClose={() => setShowDataDeletionModal(false)}
          user={user}
          onDeletionRequested={() => {
            setShowDataDeletionModal(false);
          }}
        />
      </div>
    </AnimatePresence>
  );
};
