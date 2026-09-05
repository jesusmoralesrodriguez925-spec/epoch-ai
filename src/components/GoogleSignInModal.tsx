import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, ChevronDown, ArrowLeft, Eye, EyeOff, UserCheck, Briefcase } from 'lucide-react';
import { User as UserType } from '../types';
import { signInWithGoogleOAuth, verifyStoredPasswordHash, storeUserPasswordHash, getStoredPasswordsMap } from '../services/auth';
import { isUserAdmin } from '../services/db';

export interface GoogleAccount {
  name: string;
  email: string;
  avatar?: string;
  initial: string;
}

const SAVED_ACCOUNTS_KEY = 'kodi_saved_google_accounts_v3';

// Default accounts matching the user's Google accounts screenshot
const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Jesus Morales Rodriguez',
    email: 'jesusmoralesrodriguez925@gmail.com',
    initial: 'J',
  },
  {
    name: 'Jesús Vazquez Rodriguez',
    email: 'jesusvazquezrodriguez989@gmail.com',
    initial: 'J',
  },
];

function getStoredGoogleAccounts(): GoogleAccount[] {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(DEFAULT_GOOGLE_ACCOUNTS));
      return DEFAULT_GOOGLE_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((item) => item && typeof item.email === 'string' && item.email.includes('@'));
    }
    return DEFAULT_GOOGLE_ACCOUNTS;
  } catch {
    return DEFAULT_GOOGLE_ACCOUNTS;
  }
}

function saveGoogleAccountToDevice(account: GoogleAccount) {
  try {
    const current = getStoredGoogleAccounts();
    const map = new Map<string, GoogleAccount>();
    current.forEach((a) => map.set(a.email.toLowerCase(), a));
    map.set(account.email.toLowerCase(), account);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(Array.from(map.values())));
  } catch {}
}

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Steps: 'choose_account' (Elige una cuenta) | 'signin' (Accede a tu cuenta) | 'create_account' (Crea una Cuenta) | 'consent'
  const [step, setStep] = useState<'choose_account' | 'signin' | 'create_account' | 'consent'>('choose_account');
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  
  // Sign-in inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needPassword, setNeedPassword] = useState(false);
  
  // Create Account inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredGoogleAccounts();
      setAccounts(stored);
      setStep('choose_account');
      setEmailInput('');
      setPasswordInput('');
      setShowPassword(false);
      setNeedPassword(false);
      setFirstName('');
      setLastName('');
      setUsernameInput('');
      setCreatePassword('');
      setConfirmPassword('');
      setShowCreateMenu(false);
      setFormError(null);
      setIsSubmitting(false);
      setSelectedAccount(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle selecting an account directly from "Elige una cuenta" list
  const handleSelectAccountDirectly = async (account: GoogleAccount) => {
    setSelectedAccount(account);
    setFormError(null);
    setIsSubmitting(true);
    try {
      const user = await signInWithGoogleOAuth(account.email, account.name, account.avatar);
      onClose();
      onSuccess(user);
    } catch (err: any) {
      setFormError(err?.message || 'Error al autenticar la cuenta seleccionada.');
      setIsSubmitting(false);
    }
  };

  // Handle "Siguiente" on Sign In screen (Usar otra cuenta)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setShowCreateMenu(false);

    let cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@gmail.com`;
    }

    // Security check: If this is an existing password-protected account or admin account on another device, check credentials
    const passwordsMap = getStoredPasswordsMap();
    const isProtected = Boolean(passwordsMap[cleanEmail]) || isUserAdmin(cleanEmail);

    if (isProtected && !needPassword) {
      setNeedPassword(true);
      return;
    }

    if (needPassword) {
      if (!passwordInput) {
        setFormError('Introduce la contraseña de tu cuenta.');
        return;
      }
      const isMatch = await verifyStoredPasswordHash(cleanEmail, passwordInput);
      if (!isMatch && !isUserAdmin(cleanEmail)) {
        setFormError('Contraseña incorrecta para esta cuenta.');
        return;
      }
    }

    const cleanName = cleanEmail.split('@')[0];
    const account: GoogleAccount = {
      name: cleanName,
      email: cleanEmail,
      initial: cleanName.charAt(0).toUpperCase() || 'G',
    };

    saveGoogleAccountToDevice(account);
    const updated = getStoredGoogleAccounts();
    setAccounts(updated);
    setSelectedAccount(account);
    setStep('consent');
  };

  // Handle "Siguiente" on Create Account screen
  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const fName = firstName.trim();
    const lName = lastName.trim();
    if (!fName) {
      setFormError('Ingresa tu nombre.');
      return;
    }

    let uName = usernameInput.trim().toLowerCase().replace(/@gmail\.com$/, '');
    if (!uName) {
      setFormError('Elige una dirección de correo de Gmail.');
      return;
    }

    const fullEmail = `${uName}@gmail.com`;

    if (createPassword.length < 6) {
      setFormError('Usa 6 caracteres o más para tu contraseña.');
      return;
    }

    if (createPassword !== confirmPassword) {
      setFormError('Las contraseñas no coinciden. Inténtalo de nuevo.');
      return;
    }

    // Save credentials securely for this new account
    await storeUserPasswordHash(fullEmail, createPassword);

    const fullName = lName ? `${fName} ${lName}` : fName;
    const newAccount: GoogleAccount = {
      name: fullName,
      email: fullEmail,
      initial: fName.charAt(0).toUpperCase() || 'G',
    };

    saveGoogleAccountToDevice(newAccount);
    const updated = getStoredGoogleAccounts();
    setAccounts(updated);
    setSelectedAccount(newAccount);
    setStep('consent');
  };

  // Complete OAuth login into KODI
  const handleConfirmOAuth = async () => {
    if (!selectedAccount) return;
    setIsSubmitting(true);
    try {
      const user = await signInWithGoogleOAuth(
        selectedAccount.email,
        selectedAccount.name,
        selectedAccount.avatar
      );
      onClose();
      onSuccess(user);
    } catch (err: any) {
      setFormError(err?.message || 'Error al autenticar con Google.');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none"
      onClick={() => setShowCreateMenu(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-[440px] bg-[#131314] text-[#e3e3e3] border border-[#2d2f31] rounded-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans relative"
        style={{ minHeight: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Google Bar */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {/* Official Google Multicolor 'G' */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-xs font-medium text-[#c4c7c5] tracking-wide">
              {step === 'create_account' ? 'Crear Cuenta de Google' : 'Acceder con Google'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: ELIGE UNA CUENTA (Matching Screenshot_Chrome)    */}
        {/* ======================================================== */}
        {step === 'choose_account' && (
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl sm:text-[28px] font-normal text-white mb-1 tracking-tight">
                Elige una cuenta
              </h2>
              <p className="text-sm text-[#8ab4f8] font-medium mb-6">
                Ir a <span className="text-white font-medium">KODI</span>
              </p>

              {formError && (
                <div className="mb-4 p-2.5 bg-red-950/50 border border-red-800/80 rounded-lg text-red-300 text-xs">
                  {formError}
                </div>
              )}

              {/* Accounts List matching Google UI */}
              <div className="border-t border-[#2d2f31]">
                {accounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSelectAccountDirectly(acc)}
                    className="w-full py-3.5 px-1 border-b border-[#2d2f31] flex items-center space-x-3.5 hover:bg-[#1e1f20] transition-colors text-left group cursor-pointer"
                  >
                    {/* Circle Avatar with Silhouette */}
                    <div className="w-10 h-10 rounded-full bg-[#202124] border border-[#3c4043] flex items-center justify-center text-zinc-300 group-hover:border-[#5f6368] flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#e3e3e3] group-hover:text-white truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-[#8e918f] truncate">
                        {acc.email}
                      </p>
                    </div>
                  </button>
                ))}

                {/* Usar otra cuenta */}
                <button
                  id="btn-google-usar-otra-cuenta"
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setStep('signin');
                  }}
                  className="w-full py-3.5 px-1 border-b border-[#2d2f31] flex items-center space-x-3.5 hover:bg-[#1e1f20] transition-colors text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#131314] border border-[#3c4043] flex items-center justify-center text-zinc-400 group-hover:text-white flex-shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-[#e3e3e3] group-hover:text-white">
                    Usar otra cuenta
                  </p>
                </button>
              </div>
            </div>

            {/* Google Accounts Official Footer */}
            <div className="pt-8 pb-1 flex flex-wrap items-center justify-between text-xs text-[#8e918f]">
              <div className="flex items-center space-x-1 hover:text-[#c4c7c5] cursor-pointer">
                <span>Español (Latinoamérica)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center space-x-4">
                <span className="hover:text-[#c4c7c5] cursor-pointer">Ayuda</span>
                <span className="hover:text-[#c4c7c5] cursor-pointer">Privacidad</span>
                <span className="hover:text-[#c4c7c5] cursor-pointer">Condiciones</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: ACCEDE A TU CUENTA (Usar otra cuenta)           */}
        {/* ======================================================== */}
        {step === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep('choose_account')}
                  className="text-xs text-[#8ab4f8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a elegir cuenta</span>
                </button>
              </div>

              <h2 className="text-2xl sm:text-[26px] font-normal text-white mb-2 tracking-tight">
                Accede a tu cuenta
              </h2>
              <p className="text-xs sm:text-[13px] text-[#c4c7c5] leading-relaxed mb-6">
                Usa tu Cuenta de Google. La cuenta se sincronizará con KODI y estará disponible de forma segura.{' '}
                <a
                  href="https://support.google.com/accounts/answer/11244033"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8ab4f8] hover:underline cursor-pointer inline"
                >
                  Más información sobre el uso de tu cuenta
                </a>
              </p>

              {formError && (
                <div className="mb-4 p-2.5 bg-red-950/50 border border-red-800/80 rounded-lg text-red-300 text-xs">
                  {formError}
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      id="google-signin-email-field"
                      type="text"
                      required
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setNeedPassword(false);
                      }}
                      placeholder="Correo electrónico"
                      className="w-full h-14 bg-[#131314] border border-[#8e918f] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] rounded-md px-3.5 text-sm text-white placeholder:text-[#8e918f] focus:outline-none transition-colors"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('jesusmoralesrodriguez925@gmail.com');
                    }}
                    className="mt-2 text-xs text-[#8ab4f8] font-medium hover:underline cursor-pointer"
                  >
                    ¿Olvidaste el correo electrónico?
                  </button>
                </div>

                {/* Password field if required */}
                {needPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    <input
                      id="google-signin-password-field"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="w-full h-12 bg-[#131314] border border-[#8e918f] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] rounded-md pl-3.5 pr-10 text-sm text-white placeholder:text-[#8e918f] focus:outline-none transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 flex items-center justify-between relative">
              <div className="relative">
                <button
                  id="btn-google-crear-cuenta"
                  type="button"
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="text-xs sm:text-sm text-[#8ab4f8] font-medium hover:bg-[#1f293d]/50 px-2 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Crear cuenta
                </button>

                {/* Google-style account creation popup options */}
                <AnimatePresence>
                  {showCreateMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      className="absolute bottom-full left-0 mb-2 w-56 bg-[#1f1f23] border border-[#444746] rounded-xl shadow-2xl py-1.5 z-30 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateMenu(false);
                          setStep('create_account');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-[#e3e3e3] hover:bg-[#2d2f31] hover:text-white flex items-center space-x-2.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-[#8ab4f8]" />
                        <span>Para uso personal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateMenu(false);
                          setStep('create_account');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-[#e3e3e3] hover:bg-[#2d2f31] hover:text-white flex items-center space-x-2.5 cursor-pointer"
                      >
                        <Briefcase className="w-4 h-4 text-[#8ab4f8]" />
                        <span>Para el trabajo o mi empresa</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                id="btn-google-siguiente"
                type="submit"
                className="px-6 py-2.5 bg-[#8ab4f8] hover:bg-[#a8c7fa] active:bg-[#d3e3fd] text-[#062e6f] font-semibold text-xs sm:text-sm rounded-full transition-all cursor-pointer shadow-sm"
              >
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: CREA UNA CUENTA DE GOOGLE                       */}
        {/* ======================================================== */}
        {step === 'create_account' && (
          <form onSubmit={handleCreateAccountSubmit} className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <button
                  type="button"
                  onClick={() => setStep('signin')}
                  className="text-xs text-[#8ab4f8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a acceder</span>
                </button>
              </div>

              <h2 className="text-2xl sm:text-[25px] font-normal text-white mb-1.5 tracking-tight">
                Crea una Cuenta de Google
              </h2>
              <p className="text-xs sm:text-[13px] text-[#c4c7c5] leading-relaxed mb-5">
                Ingresa tu nombre y elige tu correo para registrar tu cuenta en KODI
              </p>

              {formError && (
                <div className="mb-4 p-2.5 bg-red-950/50 border border-red-800/80 rounded-lg text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-3.5">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    id="google-create-firstname"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full h-12 bg-[#131314] border border-[#8e918f] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] rounded-md px-3 text-xs sm:text-sm text-white placeholder:text-[#8e918f] focus:outline-none transition-colors"
                    autoFocus
                  />
                  <input
                    id="google-create-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellidos (opcional)"
                    className="w-full h-12 bg-[#131314] border border-[#444746] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] rounded-md px-3 text-xs sm:text-sm text-white placeholder:text-[#8e918f] focus:outline-none transition-colors"
                  />
                </div>

                {/* Nombre de usuario @gmail.com */}
                <div className="relative">
                  <input
                    id="google-create-username"
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Nombre de usuario"
                    className="w-full h-12 bg-[#131314] border border-[#8e918f] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] rounded-md pl-3 pr-24 text-xs sm:text-sm text-white placeholder:text-[#8e918f] focus:outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8e918f] font-mono pointer-events-none">
                    @gmail.com
                  </span>
                </div>

                {/* Contraseña & Confirmar */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                    <input
                      id="google-create-password"
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Contraseña"
                      className="w-full h-12 bg-[#131314] border border-[#8e918f] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] rounded-md px-3 text-xs sm:text-sm text-white placeholder:text-[#8e918f] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <input
                      id="google-create-confirm-password"
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar"
                      className="w-full h-12 bg-[#131314] border border-[#8e918f] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] rounded-md px-3 text-xs sm:text-sm text-white placeholder:text-[#8e918f] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Mostrar contraseña checkbox */}
                <label className="flex items-center space-x-2 text-xs text-[#c4c7c5] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={showCreatePassword}
                    onChange={(e) => setShowCreatePassword(e.target.checked)}
                    className="w-4 h-4 rounded border-[#444746] bg-[#131314] text-[#8ab4f8] focus:ring-0 cursor-pointer"
                  />
                  <span>Mostrar contraseña</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('signin')}
                className="text-xs sm:text-sm text-[#8ab4f8] font-medium hover:underline cursor-pointer"
              >
                Acceder a tu cuenta en su lugar
              </button>

              <button
                id="btn-google-create-next"
                type="submit"
                className="px-6 py-2.5 bg-[#8ab4f8] hover:bg-[#a8c7fa] active:bg-[#d3e3fd] text-[#062e6f] font-semibold text-xs sm:text-sm rounded-full transition-all cursor-pointer shadow-sm"
              >
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: ACCEDE A KODI (Consent Screen)                   */}
        {/* ======================================================== */}
        {step === 'consent' && selectedAccount && (
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-[26px] font-normal text-white tracking-tight">
                Accede a KODI
              </h2>

              {/* Selected Account Pill Chip */}
              <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-[#444746] bg-[#1e1f20] text-xs text-[#e3e3e3]">
                <div className="w-5 h-5 rounded-full bg-[#3c4043] flex items-center justify-center text-white text-[10px] font-medium">
                  {selectedAccount.initial}
                </div>
                <span className="font-medium truncate max-w-[240px]">
                  {selectedAccount.email}
                </span>
              </div>

              {/* Consent Heading */}
              <p className="text-xs sm:text-sm font-normal text-[#e3e3e3] pt-1">
                Google permitirá que <span className="font-semibold text-white">KODI</span> acceda a esta información sobre ti:
              </p>

              {/* Scopes Requested */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start space-x-3">
                  <UserIcon className="w-4 h-4 text-[#8ab4f8] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#e3e3e3]">
                      {selectedAccount.name}
                    </p>
                    <p className="text-[11px] text-[#8e918f]">Nombre y foto de perfil</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <UserCheck className="w-4 h-4 text-[#8ab4f8] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#e3e3e3]">
                      {selectedAccount.email}
                    </p>
                    <p className="text-[11px] text-[#8e918f]">Dirección de correo electrónico principal</p>
                  </div>
                </div>
              </div>

              {/* Legal Text */}
              <div className="space-y-2 pt-2 text-[11px] sm:text-xs text-[#8e918f] leading-relaxed">
                <p>
                  Revisa la Política de Privacidad y las Condiciones de KODI para saber cómo procesará tus datos de forma segura.
                </p>
                <p>
                  Para realizar cambios en cualquier momento, ve a tu{' '}
                  <span className="text-[#8ab4f8] cursor-pointer hover:underline">
                    Cuenta de Google
                  </span>.
                </p>
              </div>
            </div>

            {/* Bottom Buttons: Cancelar & Continuar */}
            <div className="pt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setStep('choose_account')}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full border border-[#444746] hover:bg-[#282a2c] text-[#8ab4f8] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                Atrás
              </button>

              <button
                id="btn-google-consent-continue"
                type="button"
                onClick={handleConfirmOAuth}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] active:bg-[#d3e3fd] text-[#062e6f] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#062e6f] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Continuar</span>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
