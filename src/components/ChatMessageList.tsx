import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Copy, 
  Check, 
  FileText, 
  Image as ImageIcon,
  RotateCw,
  Share2,
  Download,
  FolderArchive,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  CheckCircle2,
  HardDriveDownload,
  Rocket,
  ExternalLink,
  X,
  Terminal,
  Zap,
  ArrowDown
} from 'lucide-react';
import { KodiLogo } from './KodiLogo';
import { CleanCodeBlock } from './CleanCodeBlock';
import { ChatMessage, User } from '../types';
import {
  downloadProjectZip,
  downloadExcelFromTable,
  downloadCsvFromTable,
  downloadPdfReport,
  downloadDocxReport,
  downloadMarkdownFile,
  extractCodeBlocks,
  extractTitleFromMarkdown,
  parseMarkdownTables
} from '../services/fileExportService';

// ==============================================================================
// 1. COMPONENTE DE TABLA MARKDOWN INTERACTIVA (EXCEL / CSV) - MEMOIZADO
// ==============================================================================
const InteractiveMarkdownTable: React.FC<{ children: React.ReactNode; isLight: boolean }> = React.memo(({
  children,
  isLight,
}) => {
  const [downloadState, setDownloadState] = useState<'idle' | 'excel' | 'csv'>('idle');
  const tableRef = useRef<HTMLTableElement>(null);

  const handleExport = useCallback((type: 'excel' | 'csv') => {
    if (!tableRef.current) return;
    const tableEl = tableRef.current;
    const headerCells = Array.from(tableEl.querySelectorAll('thead th')).map(
      (th) => th.textContent?.trim() || ''
    );
    const rowElements = Array.from(tableEl.querySelectorAll('tbody tr'));
    const rows = rowElements.map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.trim() || '')
    );

    if (headerCells.length > 0 && rows.length > 0) {
      const tableData = { headers: headerCells, rows, title: 'Datos KODI' };
      if (type === 'excel') {
        downloadExcelFromTable(tableData, 'datos-kodi.xlsx');
        setDownloadState('excel');
      } else {
        downloadCsvFromTable(tableData, 'datos-kodi.csv');
        setDownloadState('csv');
      }
      setTimeout(() => setDownloadState('idle'), 2000);
    }
  }, []);

  return (
    <div
      className={`my-4 overflow-hidden w-full rounded-xl border transition-colors ${
        isLight ? 'border-zinc-300 bg-white shadow-xs' : 'border-zinc-700/80 bg-[#0d1117] shadow-lg'
      }`}
      style={{ contain: 'content' }}
    >
      {/* Table Toolbar */}
      <div
        className={`flex flex-wrap items-center justify-between px-3.5 py-2 border-b text-[11px] gap-2 ${
          isLight
            ? 'bg-zinc-100/90 border-zinc-200 text-zinc-700'
            : 'bg-[#161b22] border-zinc-700/60 text-zinc-300'
        }`}
      >
        <div className="flex items-center space-x-1.5 font-semibold">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tabla de Datos Procesada</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-[10.5px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Descargar tabla en formato Excel nativo (.xlsx)"
          >
            {downloadState === 'excel' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">¡Descargado!</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Descargar Excel (.xlsx)</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white border border-blue-500/40 text-[10.5px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Descargar tabla en formato CSV (.csv)"
          >
            {downloadState === 'csv' ? (
              <>
                <Check className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400 font-medium">¡Descargado!</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3 text-blue-400" />
                <span>CSV (.csv)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table
          ref={tableRef}
          className="w-full text-left border-collapse font-sans text-xs sm:text-sm min-w-full"
        >
          {children}
        </table>
      </div>
    </div>
  );
});
InteractiveMarkdownTable.displayName = 'InteractiveMarkdownTable';

// ==============================================================================
// 2. TARJETA DE DESCARGA DIRECTA DE ARCHIVO (PDF / WORD / EXCEL / ZIP) - MEMOIZADO
// ==============================================================================
interface DirectFileDeliveryProps {
  fileType: 'pdf' | 'excel' | 'docx' | 'zip' | 'code';
  title: string;
  isLight: boolean;
  onDownload: () => void;
  isDownloaded: boolean;
  onDownloadSecondary?: (format: 'pdf' | 'docx' | 'excel' | 'csv' | 'md') => void;
}

const DirectFileDeliveryCard: React.FC<DirectFileDeliveryProps> = React.memo(({
  fileType,
  title,
  onDownload,
  isDownloaded,
  onDownloadSecondary,
}) => {
  const getBadgeConfig = () => {
    switch (fileType) {
      case 'pdf':
        return {
          badge: 'DOCUMENTO PDF LISTO',
          bgColor: 'from-red-500/20 via-zinc-900 to-[#120a0d]',
          borderColor: 'border-red-500/40',
          btnBg: 'from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white',
          icon: <FileText className="w-5 h-5 text-red-400" />,
          accentText: 'text-red-300',
          extension: '.pdf',
          fileDesc: 'Formato corporativo formal con diseño oficial de KODI',
          mainBtnText: 'Descargar PDF Listo',
        };
      case 'excel':
        return {
          badge: 'HOJA DE CÁLCULO EXCEL LISTA',
          bgColor: 'from-emerald-500/20 via-zinc-900 to-[#0a120d]',
          borderColor: 'border-emerald-500/40',
          btnBg: 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white',
          icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
          accentText: 'text-emerald-300',
          extension: '.xlsx',
          fileDesc: 'Archivo nativo de Microsoft Excel listo para abrir y editar',
          mainBtnText: 'Descargar Excel (.xlsx)',
        };
      case 'docx':
        return {
          badge: 'DOCUMENTO WORD LISTO',
          bgColor: 'from-blue-500/20 via-zinc-900 to-[#0a0f18]',
          borderColor: 'border-blue-500/40',
          btnBg: 'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white',
          icon: <FileCode className="w-5 h-5 text-blue-400" />,
          accentText: 'text-blue-300',
          extension: '.docx',
          fileDesc: 'Documento editable de Microsoft Word con estilos y títulos',
          mainBtnText: 'Descargar Word (.docx)',
        };
      case 'zip':
        return {
          badge: 'PAQUETE DE PROYECTO LISTO',
          bgColor: 'from-amber-500/20 via-zinc-900 to-[#14110a]',
          borderColor: 'border-amber-500/40',
          btnBg: 'from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black',
          icon: <FolderArchive className="w-5 h-5 text-amber-400" />,
          accentText: 'text-amber-300',
          extension: '.zip',
          fileDesc: 'Paquete comprimido con todos los archivos estructurados y README',
          mainBtnText: 'Descargar Proyecto (.zip)',
        };
      case 'code':
      default:
        return {
          badge: 'ARCHIVO DE CÓDIGO LISTO',
          bgColor: 'from-amber-500/15 via-zinc-900 to-zinc-950',
          borderColor: 'border-amber-500/30',
          btnBg: 'from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black',
          icon: <FileCode className="w-5 h-5 text-amber-400" />,
          accentText: 'text-amber-300',
          extension: '',
          fileDesc: 'Archivo de código limpio listo para ejecutar',
          mainBtnText: 'Descargar Archivo',
        };
    }
  };

  const config = getBadgeConfig();
  const cleanFileName = `${title.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 32)}${config.extension}`;

  return (
    <div className={`mb-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br ${config.bgColor} border ${config.borderColor} shadow-xl relative overflow-hidden`} style={{ contain: 'content' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-md">
            {config.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-black/40 border border-white/10 ${config.accentText}`}>
                {config.badge}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline-block">KODI Core</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1 truncate max-w-[280px] sm:max-w-[340px]" title={cleanFileName}>
              {cleanFileName}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {config.fileDesc}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onDownload}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r ${config.btnBg} font-bold text-xs shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0`}
          >
            {isDownloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>¡Descargado en tu dispositivo!</span>
              </>
            ) : (
              <>
                <HardDriveDownload className="w-4 h-4" />
                <span>{config.mainBtnText}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {onDownloadSecondary && (
        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between text-[10.5px] text-zinc-400 gap-2">
          <span>¿Deseas otro formato adicional?</span>
          <div className="flex items-center space-x-2">
            {fileType !== 'pdf' && (
              <button
                onClick={() => onDownloadSecondary('pdf')}
                className="px-2 py-0.5 rounded bg-black/40 hover:bg-black/70 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
              >
                Descargar en PDF
              </button>
            )}
            {fileType !== 'docx' && (
              <button
                onClick={() => onDownloadSecondary('docx')}
                className="px-2 py-0.5 rounded bg-black/40 hover:bg-black/70 text-blue-300 border border-blue-500/30 transition-colors cursor-pointer"
              >
                Descargar en Word (.docx)
              </button>
            )}
            {fileType !== 'excel' && (
              <button
                onClick={() => onDownloadSecondary('excel')}
                className="px-2 py-0.5 rounded bg-black/40 hover:bg-black/70 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                Descargar en Excel
              </button>
            )}
            <button
              onClick={() => onDownloadSecondary('md')}
              className="px-2 py-0.5 rounded bg-black/40 hover:bg-black/70 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            >
              Markdown (.md)
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
DirectFileDeliveryCard.displayName = 'DirectFileDeliveryCard';

// ==============================================================================
// 3. COMPONENTE INDIVIDUAL DE MENSAJE (REACT.MEMO PARA CERO TEMBLEQUEO)
// ==============================================================================
interface ChatMessageItemProps {
  msg: ChatMessage;
  user: User;
  isLight: boolean;
  isLastMessage: boolean;
  isStreaming: boolean;
  copiedId: string | null;
  sharedId: string | null;
  downloadedId: string | null;
  onCopyText: (id: string, text: string) => void;
  onShare: (id: string, text: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onExportPdf: (msg: ChatMessage) => void;
  onExportExcel: (msg: ChatMessage) => void;
  onExportDocx: (msg: ChatMessage) => void;
  onExportMarkdown: (msg: ChatMessage) => void;
  onDownloadZip: (msgId: string, text: string) => void;
  isPreviewExpanded: boolean;
  onTogglePreview: (id: string) => void;
  isDedicatedFileMessage: boolean;
  activeFileType: 'pdf' | 'excel' | 'docx' | 'zip' | 'code';
  title: string;
  hasMultipleFiles: boolean;
  codeBlocksCount: number;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(({
  msg,
  user,
  isLight,
  isLastMessage,
  isStreaming,
  copiedId,
  sharedId,
  downloadedId,
  onCopyText,
  onShare,
  onRetryMessage,
  onExportPdf,
  onExportExcel,
  onExportDocx,
  onExportMarkdown,
  onDownloadZip,
  isPreviewExpanded,
  onTogglePreview,
  isDedicatedFileMessage,
  activeFileType,
  title,
  hasMultipleFiles,
  codeBlocksCount,
}) => {
  const isUser = msg.sender === 'user';
  const isCurrentlyStreamingThisMsg = (!isUser && isStreaming && isLastMessage) || (!isUser && isStreaming && Boolean(msg.isStreaming));

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-opacity duration-150`}
      style={{ 
        contain: 'style layout',
        willChange: isCurrentlyStreamingThisMsg ? 'contents' : 'auto'
      }}
    >
      {/* Sender header / Avatar */}
      <div className="flex items-center space-x-2 mb-1.5 px-1">
        {!isUser ? (
          <>
            <KodiLogo size="sm" showText={false} />
            <span className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              KODI
            </span>
            {msg.modelName && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-400 font-mono">
                {msg.modelName}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-[10px] text-zinc-400 font-mono">{msg.timestamp}</span>
            <span className={`text-xs font-semibold ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>
              {user.displayName}
            </span>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-5 h-5 rounded-full border border-zinc-600 object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Bubble Container */}
      <div
        className={`rounded-2xl px-4 py-3 max-w-[96%] sm:max-w-[90%] shadow-sm ${
          isUser
            ? isLight
              ? 'bg-zinc-900 text-white rounded-br-sm'
              : 'bg-[#1e1e28] text-white border border-[#2d2d3d] rounded-br-sm'
            : isLight
              ? 'bg-white text-zinc-900 border border-zinc-200 shadow-zinc-200/50 rounded-bl-sm'
              : 'bg-[#0f0f14] text-zinc-200 border border-[#1e1e28] rounded-bl-sm'
        }`}
      >
        {/* Attachments if user sent files */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-zinc-700/40">
            {msg.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center space-x-2 bg-black/40 border border-zinc-700/50 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
              >
                {att.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="truncate max-w-[150px]">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* DIRECT READY-TO-DOWNLOAD FILE CARD */}
        {isDedicatedFileMessage && (
          <DirectFileDeliveryCard
            fileType={activeFileType}
            title={title}
            isLight={isLight}
            onDownload={() => {
              if (activeFileType === 'pdf') onExportPdf(msg);
              else if (activeFileType === 'excel') onExportExcel(msg);
              else if (activeFileType === 'docx') onExportDocx(msg);
              else if (activeFileType === 'zip') onDownloadZip(msg.id, msg.text);
            }}
            isDownloaded={downloadedId === `direct-${msg.id}` || downloadedId === `zip-${msg.id}`}
            onDownloadSecondary={(format) => {
              if (format === 'pdf') onExportPdf(msg);
              else if (format === 'docx') onExportDocx(msg);
              else if (format === 'excel') onExportExcel(msg);
              else if (format === 'md') onExportMarkdown(msg);
            }}
          />
        )}

        {/* Multi-file Project .zip banner */}
        {!isDedicatedFileMessage && hasMultipleFiles && (
          <div className="mb-3.5 p-3 sm:p-3.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <FolderArchive className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-zinc-100 flex items-center space-x-2">
                    <span>Archivos de Código Generados</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                      {codeBlocksCount} archivos
                    </span>
                  </h5>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Descarga todo el proyecto empaquetado y listo para usar
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0 sm:ml-auto">
                <button
                  onClick={() => onDownloadZip(msg.id, msg.text)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                >
                  {downloadedId === `zip-${msg.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>¡Descargado!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-black" />
                      <span>Descargar (.zip)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated file preview toggle */}
        {isDedicatedFileMessage && (
          <div className="mb-2">
            <button
              onClick={() => onTogglePreview(msg.id)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                isLight 
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200' 
                  : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700/60'
              }`}
            >
              {isPreviewExpanded ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ocultar vista previa del documento</span>
                  <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver contenido y vista previa</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Main Content Rendered with Markdown, Interactive Tables & Code Blocks */}
        {(!isDedicatedFileMessage || isPreviewExpanded) && (
          <div className={`markdown-content text-xs sm:text-sm leading-relaxed ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
            {(msg.text || '').trim() === '' ? (
              isCurrentlyStreamingThisMsg ? (
                <div className="flex items-center space-x-2.5 py-2 text-zinc-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">Generando respuesta...</span>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 py-1 text-zinc-400">
                  <div className="flex items-center space-x-2 text-amber-400/90 text-xs">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Respuesta pausada al salir de la app.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRetryMessage(msg.id)}
                    className="inline-flex items-center self-start space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 mr-1" />
                    <span>Reintentar y generar respuesta</span>
                  </button>
                </div>
              )
            ) : (
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }) => (
                    <InteractiveMarkdownTable isLight={isLight}>
                      {children}
                    </InteractiveMarkdownTable>
                  ),
                  thead: ({ children }) => (
                    <thead className={`${
                      isLight 
                        ? 'bg-zinc-100/90 text-zinc-900 border-b-2 border-zinc-400' 
                        : 'bg-[#151520] text-zinc-100 border-b-2 border-zinc-600'
                    } font-semibold uppercase tracking-wider text-[11px]`}>
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className={`divide-y ${isLight ? 'divide-zinc-200' : 'divide-zinc-800/80'}`}>
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className={`transition-colors border-b ${
                      isLight 
                        ? 'hover:bg-zinc-50/80 border-zinc-200 last:border-b-0' 
                        : 'hover:bg-zinc-800/30 border-zinc-800/80 last:border-b-0'
                    }`}>
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className={`py-2.5 px-3.5 font-bold border-r last:border-r-0 whitespace-nowrap ${
                      isLight 
                        ? 'border-zinc-300 text-zinc-900' 
                        : 'border-zinc-700/60 text-zinc-100'
                    }`}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className={`py-2.5 px-3.5 align-top border-r last:border-r-0 leading-normal ${
                      isLight 
                        ? 'border-zinc-200 text-zinc-800' 
                        : 'border-zinc-800/60 text-zinc-200'
                    }`}>
                      {children}
                    </td>
                  ),
                  pre: ({ children }) => <>{children}</>,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-([a-zA-Z0-9_-]+)/.exec(className || '');
                    const codeContent = String(children).replace(/\n$/, '');
                    const isMultiLine = codeContent.includes('\n');

                    if (match || isMultiLine) {
                      const rawLang = match ? match[1] : '';
                      return (
                        <CleanCodeBlock
                          code={codeContent}
                          language={rawLang}
                          isLight={isLight}
                        />
                      );
                    }

                    return (
                      <code
                        className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
                          isLight
                            ? 'bg-zinc-200 text-amber-800 border border-zinc-300'
                            : 'bg-zinc-800/90 text-amber-300 border border-zinc-700/60'
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => (
                    <h1 className={`text-base sm:text-lg font-bold mt-4 mb-2 tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className={`text-sm sm:text-base font-bold mt-3.5 mb-1.5 tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className={`text-xs sm:text-sm font-semibold mt-3 mb-1 tracking-tight ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="my-1.5 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 space-y-1.5 pl-1.5">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 space-y-1.5 pl-4 list-decimal list-outside">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-3 border-amber-400/80 pl-3.5 my-2.5 italic text-zinc-400 text-xs sm:text-sm">
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <hr className={`my-3.5 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`} />
                  ),
                  strong: ({ children }) => (
                    <strong className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {children}
                    </strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {msg.text}
              </Markdown>
            )}
          </div>
        )}

        {/* Message Footer Actions */}
        {!isUser && (msg.text || '').trim().length > 0 && (
          <div className="flex flex-wrap items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60 text-[11px] text-zinc-500 gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] text-zinc-500">{msg.timestamp}</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onCopyText(msg.id, msg.text)}
                className="flex items-center space-x-1 hover:text-zinc-300 transition-colors cursor-pointer text-zinc-400 hover:text-white"
                title="Copiar texto del mensaje"
              >
                {copiedId === msg.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className={copiedId === msg.id ? 'text-emerald-400 font-medium' : ''}>
                  {copiedId === msg.id ? 'Copiado' : 'Copiar'}
                </span>
              </button>

              {onRetryMessage && (
                <button
                  onClick={() => onRetryMessage(msg.id)}
                  className="flex items-center space-x-1 hover:text-amber-400 text-zinc-400 transition-colors cursor-pointer"
                  title="Reintentar respuesta"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reintentar</span>
                </button>
              )}

              <button
                onClick={() => onShare(msg.id, msg.text)}
                className="flex items-center space-x-1 hover:text-blue-400 text-zinc-400 transition-colors cursor-pointer"
                title="Compartir mensaje"
              >
                {sharedId === msg.id ? (
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span className={sharedId === msg.id ? 'text-blue-400 font-medium' : ''}>
                  {sharedId === msg.id ? 'Copiado' : 'Compartir'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
ChatMessageItem.displayName = 'ChatMessageItem';

// ==============================================================================
// 4. COMPONENTE PRINCIPAL CON AUTO-SCROLL DE ALTA VELOCIDAD Y CERO PARPADEO
// ==============================================================================
interface ChatMessageListProps {
  messages: ChatMessage[];
  user: User;
  isStreaming?: boolean;
  currentTheme?: 'dark' | 'light';
  onRetryMessage?: (messageId: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  user,
  isStreaming = false,
  currentTheme = 'dark',
  onRetryMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [expandedPreviewIds, setExpandedPreviewIds] = useState<Record<string, boolean>>({});
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Tracking refs to eliminate layout jitter and smooth scroll
  const isUserScrolledUpRef = useRef<boolean>(false);
  const rafScrollIdRef = useRef<number | null>(null);
  const prevMsgCountRef = useRef<number>(messages.length);
  const lastMsgTextLenRef = useRef<number>(0);

  const isLight = currentTheme === 'light';

  // Instant smooth scroll to bottom helper using RAF
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    if (rafScrollIdRef.current) {
      cancelAnimationFrame(rafScrollIdRef.current);
    }
    
    rafScrollIdRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, []);

  // Handle user manual scrolling: detect if user deliberately looked at past messages
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isScrolledUp = distanceFromBottom > 120;
    
    isUserScrolledUpRef.current = isScrolledUp;
    setShowScrollBottomBtn(isScrolledUp);
  }, []);

  // Smart Auto-scroll Engine: handles stream updates smoothly without screen flicker
  useEffect(() => {
    const msgCount = messages.length;
    const lastMsg = msgCount > 0 ? messages[msgCount - 1] : null;
    const currentLen = lastMsg ? lastMsg.text.length : 0;
    const hasNewMessage = msgCount !== prevMsgCountRef.current;

    if (hasNewMessage) {
      prevMsgCountRef.current = msgCount;
      lastMsgTextLenRef.current = currentLen;
      // When a new message appears, force scroll down
      isUserScrolledUpRef.current = false;
      scrollToBottom(true);
      return;
    }

    // If streaming in progress and user has NOT scrolled up, maintain lock to bottom smoothly
    if (isStreaming && !isUserScrolledUpRef.current) {
      if (currentLen > lastMsgTextLenRef.current) {
        lastMsgTextLenRef.current = currentLen;
        // Direct assignment on RAF prevents layout thrashing & jitter
        if (rafScrollIdRef.current) {
          cancelAnimationFrame(rafScrollIdRef.current);
        }
        rafScrollIdRef.current = requestAnimationFrame(() => {
          const container = containerRef.current;
          if (container && !isUserScrolledUpRef.current) {
            container.scrollTop = container.scrollHeight;
          }
        });
      }
    } else if (!isStreaming && lastMsgTextLenRef.current !== currentLen) {
      lastMsgTextLenRef.current = currentLen;
      if (!isUserScrolledUpRef.current) {
        scrollToBottom(true);
      }
    }
  }, [messages, isStreaming, scrollToBottom]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafScrollIdRef.current) {
        cancelAnimationFrame(rafScrollIdRef.current);
      }
    };
  }, []);

  // Action handlers
  const handleCopyText = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleShare = useCallback(async (id: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          navigator.clipboard.writeText(text);
          setSharedId(id);
          setTimeout(() => setSharedId(null), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(text);
      setSharedId(id);
      setTimeout(() => setSharedId(null), 2000);
    }
  }, []);

  const handleDownloadZip = useCallback(async (msgId: string, text: string) => {
    const blocks = extractCodeBlocks(text);
    if (blocks.length === 0) return;
    const title = extractTitleFromMarkdown(text)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const projectName = title || 'proyecto-kodi';
    await downloadProjectZip(blocks, projectName);
    setDownloadedId(`zip-${msgId}`);
    setTimeout(() => setDownloadedId(null), 2500);
  }, []);

  const handleExportPdf = useCallback((msg: ChatMessage) => {
    const title = extractTitleFromMarkdown(msg.text);
    downloadPdfReport(title, msg.text, `${title.replace(/\s+/g, '_').slice(0, 30)}.pdf`);
    setDownloadedId(`direct-${msg.id}`);
    setTimeout(() => setDownloadedId(null), 2500);
  }, []);

  const handleExportDocx = useCallback(async (msg: ChatMessage) => {
    const title = extractTitleFromMarkdown(msg.text);
    await downloadDocxReport(title, msg.text, `${title.replace(/\s+/g, '_').slice(0, 30)}.docx`);
    setDownloadedId(`direct-${msg.id}`);
    setTimeout(() => setDownloadedId(null), 2500);
  }, []);

  const handleExportExcel = useCallback((msg: ChatMessage) => {
    const tables = parseMarkdownTables(msg.text);
    const title = extractTitleFromMarkdown(msg.text);
    if (tables.length > 0) {
      downloadExcelFromTable(tables[0], `${title.replace(/\s+/g, '_').slice(0, 30)}.xlsx`);
    } else {
      const fallbackTable = {
        title,
        headers: ['Contenido'],
        rows: msg.text.split('\n').filter(l => l.trim().length > 0).map(l => [l.trim()])
      };
      downloadExcelFromTable(fallbackTable, `${title.replace(/\s+/g, '_').slice(0, 30)}.xlsx`);
    }
    setDownloadedId(`direct-${msg.id}`);
    setTimeout(() => setDownloadedId(null), 2500);
  }, []);

  const handleExportMarkdown = useCallback((msg: ChatMessage) => {
    const title = extractTitleFromMarkdown(msg.text);
    downloadMarkdownFile(msg.text, `${title.replace(/\s+/g, '_').slice(0, 30)}.md`);
    setDownloadedId(`direct-${msg.id}`);
    setTimeout(() => setDownloadedId(null), 2000);
  }, []);

  const togglePreview = useCallback((id: string) => {
    setExpandedPreviewIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Pre-calculated message metadata for high performance rendering
  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      const isUser = msg.sender === 'user';
      const codeBlocks = !isUser ? extractCodeBlocks(msg.text) : [];
      const hasMultipleFiles = codeBlocks.length >= 2;

      const prevMsg = index > 0 ? messages[index - 1] : null;
      const prevUserText = prevMsg && prevMsg.sender === 'user' ? prevMsg.text.toLowerCase() : '';
      const currentText = msg.text.toLowerCase();

      const isPdfRequested = 
        prevUserText.includes('pdf') || 
        currentText.includes('documento pdf') || 
        currentText.includes('reporte pdf') ||
        currentText.includes('archivo pdf');

      const isExcelRequested = 
        prevUserText.includes('excel') || 
        prevUserText.includes('xlsx') || 
        prevUserText.includes('hoja de calculo') || 
        prevUserText.includes('hoja de cálculo') ||
        currentText.includes('hoja de cálculo') ||
        currentText.includes('archivo excel');

      const isWordRequested = 
        prevUserText.includes('word') || 
        prevUserText.includes('docx') || 
        currentText.includes('documento word');

      const isZipRequested = 
        prevUserText.includes('zip') || 
        prevUserText.includes('proyecto completo') ||
        (hasMultipleFiles && (prevUserText.includes('proyecto') || prevUserText.includes('archivos')));

      const isDedicatedFileMessage = !isUser && (isPdfRequested || isExcelRequested || isWordRequested || isZipRequested);
      const title = extractTitleFromMarkdown(msg.text);

      const activeFileType: 'pdf' | 'excel' | 'docx' | 'zip' | 'code' = isPdfRequested 
        ? 'pdf' 
        : isExcelRequested 
          ? 'excel' 
          : isWordRequested 
            ? 'docx' 
            : isZipRequested 
              ? 'zip' 
              : 'pdf';

      return {
        msg,
        isLastMessage: index === messages.length - 1,
        isDedicatedFileMessage,
        activeFileType,
        title,
        hasMultipleFiles,
        codeBlocksCount: codeBlocks.length,
      };
    });
  }, [messages]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-3xl w-full mx-auto relative select-text"
      style={{
        contain: 'layout style',
        scrollBehavior: isStreaming ? 'auto' : 'smooth',
        WebkitOverflowScrolling: 'touch',
        willChange: 'scroll-position',
        transform: 'translateZ(0)',
      }}
    >
      {renderedMessages.map(({
        msg,
        isLastMessage,
        isDedicatedFileMessage,
        activeFileType,
        title,
        hasMultipleFiles,
        codeBlocksCount
      }) => (
        <ChatMessageItem
          key={msg.id}
          msg={msg}
          user={user}
          isLight={isLight}
          isLastMessage={isLastMessage}
          isStreaming={isStreaming}
          copiedId={copiedId}
          sharedId={sharedId}
          downloadedId={downloadedId}
          onCopyText={handleCopyText}
          onShare={handleShare}
          onRetryMessage={onRetryMessage}
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
          onExportDocx={handleExportDocx}
          onExportMarkdown={handleExportMarkdown}
          onDownloadZip={handleDownloadZip}
          isPreviewExpanded={Boolean(expandedPreviewIds[msg.id])}
          onTogglePreview={togglePreview}
          isDedicatedFileMessage={isDedicatedFileMessage}
          activeFileType={activeFileType}
          title={title}
          hasMultipleFiles={hasMultipleFiles}
          codeBlocksCount={codeBlocksCount}
        />
      ))}

      <div ref={bottomRef} className="h-2 w-full pointer-events-none" />

      {/* Floating snap-to-bottom button when user scrolls up during conversation */}
      <AnimatePresence>
        {showScrollBottomBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => {
              isUserScrolledUpRef.current = false;
              setShowScrollBottomBtn(false);
              scrollToBottom(true);
            }}
            className="fixed bottom-24 right-6 sm:right-10 z-30 p-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white shadow-xl border border-zinc-700/80 backdrop-blur-md transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
            title="Ir al final del chat"
          >
            <ArrowDown className="w-4 h-4 text-amber-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
