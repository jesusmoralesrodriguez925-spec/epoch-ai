import React, { useState } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { AiNoticeModal } from './AiNoticeModal';

export interface ConsentState {
  privacyPolicy: boolean;
  termsOfService: boolean;
  aiUsage: boolean;
  dataSharing: boolean;
  aiDataProcessing: boolean;
}

interface ConsentCheckboxesProps {
  consents: ConsentState;
  onChange: (updated: ConsentState) => void;
  disabled?: boolean;
}

export const ConsentCheckboxes: React.FC<ConsentCheckboxesProps> = ({
  consents,
  onChange,
  disabled = false,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleToggle = (key: keyof ConsentState) => {
    if (disabled) return;
    onChange({
      ...consents,
      [key]: !consents[key],
    });
  };

  const isAllChecked = Object.values(consents).every(Boolean);

  const handleToggleAll = () => {
    if (disabled) return;
    const nextVal = !isAllChecked;
    onChange({
      privacyPolicy: nextVal,
      termsOfService: nextVal,
      aiUsage: nextVal,
      dataSharing: nextVal,
      aiDataProcessing: nextVal,
    });
  };

  return (
    <div id="kodi-legal-consent-section" className="space-y-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/70">
        <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Consentimientos Legales Obligatorios
        </span>
        <button
          type="button"
          onClick={handleToggleAll}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
        >
          {isAllChecked ? 'Desmarcar todos' : 'Aceptar todos'}
        </button>
      </div>

      <div className="space-y-2.5">
        {/* Checkbox 1: Política de Privacidad */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-zinc-300 hover:text-white transition-colors">
          <input
            id="consent-privacy-checkbox"
            type="checkbox"
            checked={consents.privacyPolicy}
            onChange={() => handleToggle('privacyPolicy')}
            disabled={disabled}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950 cursor-pointer shrink-0"
          />
          <span className="leading-snug">
            He leído y acepto la{' '}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPrivacyModal(true);
              }}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-0.5"
            >
              Política de Privacidad
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </button>
          </span>
        </label>

        {/* Checkbox 2: Términos de Servicio */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-zinc-300 hover:text-white transition-colors">
          <input
            id="consent-terms-checkbox"
            type="checkbox"
            checked={consents.termsOfService}
            onChange={() => handleToggle('termsOfService')}
            disabled={disabled}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-950 cursor-pointer shrink-0"
          />
          <span className="leading-snug">
            He leído y acepto los{' '}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTermsModal(true);
              }}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium inline-flex items-center gap-0.5"
            >
              Términos de Servicio
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </button>
          </span>
        </label>

        {/* Checkbox 3: Uso de IA */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-zinc-300 hover:text-white transition-colors">
          <input
            id="consent-ai-usage-checkbox"
            type="checkbox"
            checked={consents.aiUsage}
            onChange={() => handleToggle('aiUsage')}
            disabled={disabled}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950 cursor-pointer shrink-0"
          />
          <span className="leading-snug">
            Entiendo que KODI utiliza IA (Google Gemini 3.7, Groq Llama 3.3 y Tavily AI).{' '}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAiModal(true);
              }}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-0.5"
            >
              Ver Aviso de IA
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </button>
          </span>
        </label>

        {/* Checkbox 4: Compartir datos con terceros técnicos */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-zinc-300 hover:text-white transition-colors">
          <input
            id="consent-datasharing-checkbox"
            type="checkbox"
            checked={consents.dataSharing}
            onChange={() => handleToggle('dataSharing')}
            disabled={disabled}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950 cursor-pointer shrink-0"
          />
          <span className="leading-snug">
            Autorizo a transferir los prompts y código a los proveedores de IA mencionados exclusivamente para la ejecución de servicios.
          </span>
        </label>

        {/* Checkbox 5: Procesamiento de datos por IA */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-zinc-300 hover:text-white transition-colors">
          <input
            id="consent-aiprocessing-checkbox"
            type="checkbox"
            checked={consents.aiDataProcessing}
            onChange={() => handleToggle('aiDataProcessing')}
            disabled={disabled}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950 cursor-pointer shrink-0"
          />
          <span className="leading-snug">
            Entiendo que mis solicitudes de software son procesadas por algoritmos de IA y que debo revisar el código antes de usarlo.
          </span>
        </label>
      </div>

      {/* Modales */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => onChange({ ...consents, privacyPolicy: true })}
      />
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => onChange({ ...consents, termsOfService: true })}
      />
      <AiNoticeModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />
    </div>
  );
};
