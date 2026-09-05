import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { LanguageLogo } from './LanguageLogo';
import { highlightCode, resolvePrismLanguage } from '../lib/prism';

interface CleanCodeBlockProps {
  code: string;
  language?: string;
  isLight?: boolean;
}

const getLanguageDisplayName = (rawLang: string): string => {
  const l = (rawLang || '').toLowerCase().trim();
  switch (l) {
    case 'python':
    case 'py':
    case 'python3':
      return 'PYTHON';
    case 'javascript':
    case 'js':
    case 'node':
    case 'nodejs':
      return 'JAVASCRIPT';
    case 'typescript':
    case 'ts':
      return 'TYPESCRIPT';
    case 'tsx':
    case 'react-tsx':
      return 'REACT TSX';
    case 'jsx':
    case 'react-jsx':
      return 'REACT JSX';
    case 'html':
    case 'html5':
      return 'HTML';
    case 'css':
      return 'CSS';
    case 'scss':
    case 'sass':
      return 'SCSS';
    case 'sql':
    case 'postgres':
    case 'postgresql':
    case 'mysql':
    case 'sqlite':
      return 'SQL';
    case 'c':
      return 'C';
    case 'cpp':
    case 'c++':
    case 'cc':
      return 'C++';
    case 'csharp':
    case 'cs':
    case 'c#':
      return 'C#';
    case 'java':
      return 'JAVA';
    case 'rust':
    case 'rs':
      return 'RUST';
    case 'go':
    case 'golang':
      return 'GO';
    case 'bash':
    case 'sh':
    case 'shell':
    case 'zsh':
      return 'BASH / SHELL';
    case 'powershell':
    case 'ps1':
      return 'POWERSHELL';
    case 'json':
    case 'jsonc':
      return 'JSON';
    case 'yaml':
    case 'yml':
      return 'YAML';
    case 'php':
      return 'PHP';
    case 'ruby':
    case 'rb':
      return 'RUBY';
    case 'swift':
      return 'SWIFT';
    case 'kotlin':
    case 'kt':
      return 'KOTLIN';
    case 'docker':
    case 'dockerfile':
      return 'DOCKER';
    case 'markdown':
    case 'md':
      return 'MARKDOWN';
    case 'graphql':
    case 'gql':
      return 'GRAPHQL';
    case 'dart':
      return 'DART';
    case 'r':
      return 'R';
    case 'lua':
      return 'LUA';
    default:
      return l ? l.toUpperCase() : 'CODE';
  }
};

export const CleanCodeBlock: React.FC<CleanCodeBlockProps> = ({
  code,
  language = '',
  isLight = false,
}) => {
  const [copied, setCopied] = useState(false);
  const cleanLang = language.replace(/^language-/, '').toLowerCase();
  const displayName = useMemo(() => getLanguageDisplayName(cleanLang), [cleanLang]);
  const prismLang = useMemo(() => resolvePrismLanguage(cleanLang), [cleanLang]);

  // Syntax highlighting computation with Prism
  const highlightedCode = useMemo(() => {
    return highlightCode(code, cleanLang);
  }, [code, cleanLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`my-3.5 rounded-xl overflow-hidden border select-text transition-all ${
        isLight
          ? 'border-zinc-300 bg-[#1e1e24] text-zinc-100 shadow-md'
          : 'border-zinc-800/90 bg-[#121218] text-zinc-100 shadow-xl'
      }`}
    >
      {/* Header with Language Logo, Title & Copy Button */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#181822] border-b border-zinc-800/80 text-[11px] select-none">
        <div className="flex items-center space-x-2">
          {/* Language Logo Icon */}
          <div className="w-5 h-5 flex items-center justify-center rounded bg-black/40 border border-white/10 p-0.5 shrink-0 shadow-xs">
            <LanguageLogo language={cleanLang} className="w-3.5 h-3.5 shrink-0" size={14} />
          </div>

          {/* Language Name Tag */}
          <span className="font-mono text-xs font-bold text-zinc-200 tracking-wider">
            {displayName}
          </span>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 hover:text-white transition-all cursor-pointer text-xs font-medium border border-white/5"
          title="Copiar código al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Area with Vibrant Syntax Colors */}
      <div className="p-3.5 overflow-x-auto bg-[#0d0d14]">
        <pre className="font-mono text-xs sm:text-[13px] leading-relaxed prism-code-block text-zinc-200 m-0">
          <code 
            className={`language-${prismLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};


