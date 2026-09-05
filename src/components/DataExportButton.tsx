import React, { useState } from 'react';
import { Download, Check, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../types';

interface DataExportButtonProps {
  user: User;
  className?: string;
}

export const DataExportButton: React.FC<DataExportButtonProps> = ({ user, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    setExportSuccess(false);

    try {
      const response = await fetch('/api/user/data-export', {
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
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar la exportación de datos.');
      }

      const data = await response.json();
      
      // Create and trigger download
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `kodi-data-export-${user.uid}-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'No se pudo descargar el paquete de datos.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        id="data-export-btn"
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-medium border border-zinc-700/80 transition-all disabled:opacity-50"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        ) : exportSuccess ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Download className="w-4 h-4 text-cyan-400" />
        )}
        <span>
          {isExporting
            ? 'Compilando exportación...'
            : exportSuccess
            ? '¡Descarga completada!'
            : 'Descargar mis datos (JSON - GDPR)'}
        </span>
      </button>

      {errorMessage && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};
