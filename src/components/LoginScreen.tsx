import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowRight, AlertCircle, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { KodiLogo } from './KodiLogo';
import { ConsentCheckboxes, ConsentState } from './ConsentCheckboxes';
import { GoogleSignInModal } from './GoogleSignInModal';
import { 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  getStoredLastEmail 
} from '../services/auth';
import { User as UserType } from '../types';

interface LoginScreenProps {
  onSuccess: (user: UserType) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Legal Consents State (Unchecked by default)
  const [consents, setConsents] = useState<ConsentState>({
    privacyPolicy: false,
    termsOfService: false,
    aiUsage: false,
    dataSharing: false,
    aiDataProcessing: false,
  });

  // Initialize with stored last login email if available
  useEffect(() => {
    const lastEmail = getStoredLastEmail();
    if (lastEmail) {
      setEmail(lastEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegisterMode) {
      const allAccepted = Object.values(consents).every(Boolean);
      if (!allAccepted) {
        setError('Debes leer y aceptar todos los consentimientos legales y el aviso de IA para registrarte.');
        return;
      }
    }

    setLoading(true);

    try {
      let loggedUser: UserType;
      if (isRegisterMode) {
        loggedUser = await signUpWithEmailPassword(email, password, name);
        // Record consent proof in backend
        fetch('/api/user/consent-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: loggedUser.uid,
            userEmail: loggedUser.email,
            consents,
          }),
        }).catch(() => {});
      } else {
        loggedUser = await signInWithEmailPassword(email, password);
      }
      onSuccess(loggedUser);
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between items-center px-4 py-8 sm:py-12 select-none relative overflow-hidden">
      {/* Background subtle atmospheric aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-zinc-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Spacer */}
      <div className="w-full h-2" />

      {/* Center Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[370px] sm:max-w-[390px] flex flex-col items-center z-10"
      >
        {/* KODI Official Hexagon Logo */}
        <div className="mb-7 sm:mb-8">
          <KodiLogo size="lg" showText={true} />
        </div>

        {/* Error notification banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full mb-4 p-3 bg-red-950/60 border border-red-800/70 rounded-xl text-red-300 text-xs flex items-start gap-2.5 shadow-lg"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Auth Button - Native in-app selector with zero ais-dev redirects */}
        <button
          id="btn-google-auth"
          type="button"
          onClick={() => {
            setError(null);
            setShowGoogleModal(true);
          }}
          disabled={loading}
          className="w-full h-[48px] rounded-xl bg-[#141417] hover:bg-[#1b1b20] active:bg-[#22222a] border border-[#26262e] hover:border-[#383844] flex items-center justify-center space-x-3 transition-all duration-150 active:scale-[0.99] disabled:opacity-60 cursor-pointer shadow-sm group"
        >
          {/* Perfect Official Google 'G' Multi-Color SVG */}
          <svg
            className="w-[18px] h-[18px] flex-shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
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
          <span className="text-[14px] font-medium text-zinc-100 group-hover:text-white tracking-normal">
            Continuar con Google
          </span>
        </button>

        {/* Divider with 'o' in the middle */}
        <div className="w-full my-6 flex items-center justify-center relative">
          <div className="w-full h-[1px] bg-[#1a1a20]" />
          <span className="absolute px-3 bg-[#000000] text-[#52525c] text-xs font-normal">
            o
          </span>
        </div>

        {/* Email & Password Form with Browser/Manager Autocomplete Compatibility */}
        <form 
          id={isRegisterMode ? "form-register" : "form-login"}
          name={isRegisterMode ? "kodi_register_form" : "kodi_login_form"}
          onSubmit={handleSubmit} 
          autoComplete="on"
          className="w-full space-y-4"
        >
          {isRegisterMode && (
            <div className="space-y-1.5">
              <label htmlFor="input-name" className="block text-xs font-medium text-zinc-300">
                Nombre Completo
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre o alias"
                  className="w-full h-11 bg-[#121215] border border-[#222228] focus:border-zinc-500 rounded-xl pl-10 pr-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email field with autocomplete="email" */}
          <div className="space-y-1.5">
            <label htmlFor="input-email" className="block text-xs font-medium text-zinc-300">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="input-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full h-11 bg-[#121215] border border-[#222228] focus:border-zinc-500 rounded-xl pl-10 pr-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password field with show/hide toggle eye button and autocomplete */}
          <div className="space-y-1.5">
            <label htmlFor="input-password" className="block text-xs font-medium text-zinc-300">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="input-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full h-11 bg-[#121215] border border-[#222228] focus:border-zinc-500 rounded-xl pl-10 pr-11 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors ${
                  showPassword ? 'tracking-normal font-sans' : 'tracking-widest'
                }`}
              />
              {/* Toggle Eye Button */}
              <button
                id="btn-toggle-password-visibility"
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                className="absolute right-3 p-1.5 text-zinc-500 hover:text-zinc-200 active:text-white rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Legal Compliance Checkboxes (GDPR, CCPA & AI Notice) - Only when registering */}
          {isRegisterMode && (
            <ConsentCheckboxes
              consents={consents}
              onChange={setConsents}
              disabled={loading}
            />
          )}

          {/* Primary Action Button */}
          <button
            id="btn-primary-auth"
            type="submit"
            disabled={loading || (isRegisterMode && !Object.values(consents).every(Boolean))}
            className="w-full h-11 mt-2 rounded-xl bg-white hover:bg-zinc-100 active:bg-zinc-200 text-black font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-150 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-lg shadow-white/5 group"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer link: ¿No tienes una cuenta? Regístrate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="w-full text-center mt-6 z-10 space-y-3"
      >
        <p className="text-xs text-zinc-400">
          {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
          <button
            id="link-toggle-auth-mode"
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-white hover:text-zinc-300 underline font-medium cursor-pointer transition-colors"
          >
            {isRegisterMode ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>

        {/* External Auth & Security Provider Badge */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-zinc-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Autenticación segura</span>
        </div>
      </motion.div>

      {/* Official Google Accounts Modal (accounts.google.com/v3/signin) */}
      <AnimatePresence>
        {showGoogleModal && (
          <GoogleSignInModal
            isOpen={showGoogleModal}
            onClose={() => setShowGoogleModal(false)}
            onSuccess={onSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
