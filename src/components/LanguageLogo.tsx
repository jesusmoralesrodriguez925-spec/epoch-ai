import React from 'react';

interface LanguageLogoProps {
  language: string;
  className?: string;
  size?: number;
}

export const LanguageLogo: React.FC<LanguageLogoProps> = ({
  language,
  className = 'w-4 h-4',
  size = 16,
}) => {
  const lang = (language || '').toLowerCase().trim();

  // TypeScript
  if (lang === 'typescript' || lang === 'ts') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="16" fill="#3178C6" />
        <path d="M1.5 64C1.5 29.482 29.482 1.5 64 1.5S126.5 29.482 126.5 64 98.518 126.5 64 126.5 1.5 98.518 1.5 64" fill="#3178C6" />
        <rect width="128" height="128" rx="8" fill="#3178C6" />
        <path d="M72.07 83.94c2.56 3.65 6.07 5.76 11.23 5.76 4.7 0 7.74-2.3 7.74-5.69 0-4.03-3.65-5.38-9.85-8.06-8.83-3.78-14.72-8.32-14.72-18.43 0-9.92 7.68-17.47 19.9-17.47 7.74 0 13.57 2.69 17.54 8.77l-7.49 4.86c-2.18-3.46-5.06-4.99-9.85-4.99-4.35 0-7.04 2.24-7.04 5.31 0 3.71 3.2 4.99 9.34 7.62 9.47 4.03 15.3 8.38 15.3 18.88 0 10.88-8.26 17.92-20.73 17.92-9.79 0-16.7-3.9-20.48-10.43l9.12-4.05zm-44.54-34.9h32.64v8.32H44.17v39.68H33.48V57.36H17.53v-8.32h10z" fill="#FFFFFF" />
      </svg>
    );
  }

  // JavaScript
  if (lang === 'javascript' || lang === 'js' || lang === 'node') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="8" fill="#F7DF1E" />
        <path d="M67.31 102.82c1.35 2.26 3.7 4.14 7.51 4.14 4.06 0 6.64-1.99 6.64-4.73 0-3.32-2.65-4.57-7.1-6.52l-2.43-1.05c-7.04-3.02-11.7-6.9-11.7-15.38 0-7.66 5.86-13.62 15.22-13.62 6.6 0 11.38 2.3 14.86 8.35l-6.38 4.09c-1.87-3.23-3.89-4.48-7.92-4.48-3.62 0-5.83 1.83-5.83 4.25 0 2.91 2.3 4.06 6.54 5.91l2.43 1.05c8.35 3.59 12.44 7.42 12.44 15.86 0 8.92-6.98 14.34-16.89 14.34-9.35 0-15.38-4.73-18.06-11.19l10.67-5.02zm-35.43 4.41c1.55 2.65 3.59 4.88 7.31 4.88 4.25 0 6.95-1.95 6.95-9.35V56.32h11.23v46.43c0 13.06-7.56 18.89-18.17 18.89-7.99 0-12.78-3.92-15.65-9.84l8.33-4.57z" fill="#000000" />
      </svg>
    );
  }

  // React / JSX / TSX
  if (lang === 'react' || lang === 'tsx' || lang === 'jsx') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 115 100" fill="none">
        <ellipse cx="57.5" cy="50" rx="11" fill="#61DAFB" />
        <ellipse cx="57.5" cy="50" rx="55" ry="20" stroke="#61DAFB" strokeWidth="6.5" />
        <ellipse cx="57.5" cy="50" rx="55" ry="20" transform="rotate(60 57.5 50)" stroke="#61DAFB" strokeWidth="6.5" />
        <ellipse cx="57.5" cy="50" rx="55" ry="20" transform="rotate(120 57.5 50)" stroke="#61DAFB" strokeWidth="6.5" />
      </svg>
    );
  }

  // Python
  if (lang === 'python' || lang === 'py') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#3776AB" d="M63.08 12.02c-27.2 0-25.56 11.8-25.56 11.8l.03 12.22h26.1v3.69H26.32S12 37.93 12 65.17c0 27.24 12.48 26.33 12.48 26.33h7.45V81.08s-.41-12.48 12.26-12.48h26.04s11.85.2 11.85-11.45V23.82s1.84-11.8-26-11.8zm-14.3 7.82c2.5 0 4.54 2.04 4.54 4.54s-2.04 4.54-4.54 4.54-4.54-2.04-4.54-4.54 2.04-4.54 4.54-4.54z" />
        <path fill="#FFD43B" d="M64.92 115.98c27.2 0 25.56-11.8 25.56-11.8l-.03-12.22h-26.1v-3.69h37.33S116 90.07 116 62.83c0-27.24-12.48-26.33-12.48-26.33h-7.45v10.42s.41 12.48-12.26 12.48H57.77s-11.85-.2-11.85 11.45v33.33s-1.84 11.8 26 11.8zm14.3-7.82c-2.5 0-4.54-2.04-4.54-4.54s2.04-4.54 4.54-4.54 4.54 2.04 4.54 4.54-2.04 4.54-4.54 4.54z" />
      </svg>
    );
  }

  // HTML / HTML5
  if (lang === 'html' || lang === 'html5' || lang === 'markup') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#E44D26" d="M19.39 116.48l-10.6-104.96h110.42l-10.6 104.93-44.61 12.37-44.61-12.34z" />
        <path fill="#F16529" d="M64 119.53l36.9-10.23 8.78-87.03h-45.68v97.26z" />
        <path fill="#EBEBEB" d="M64 54.49h-19.1l-1.32-14.8h20.42v-14.8h-36.64l3.96 44.4h32.68v-14.8zm0 33.72l-.12.03-16.03-4.32-1.03-11.51h-14.86l2.02 22.7 29.9 8.3.12-.03v-15.17z" />
        <path fill="#FFFFFF" d="M64 39.69h33.8l-3.17 35.5-20.63 5.56v-15.17l11.48-3.09 1.2-13.43h-22.68v-29.37zm0-14.8h36.64l-.66 7.4-1.32 14.8h-34.66v-22.2z" />
      </svg>
    );
  }

  // CSS / CSS3
  if (lang === 'css' || lang === 'css3' || lang === 'scss' || lang === 'sass') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#1572B6" d="M19.39 116.48l-10.6-104.96h110.42l-10.6 104.93-44.61 12.37-44.61-12.34z" />
        <path fill="#33A9DC" d="M64 119.53l36.9-10.23 8.78-87.03h-45.68v97.26z" />
        <path fill="#EBEBEB" d="M64 68.32h-18.78l-1.32-14.8h20.1v-14.8h-36.32l3.96 44.4h32.36v-14.8zm0 33.72l-.12.03-16.03-4.32-1.03-11.51h-14.86l2.02 22.7 29.9 8.3.12-.03v-15.17z" />
        <path fill="#FFFFFF" d="M64 38.72h35.32l-1.32-14.8h-34v14.8zm0 29.6h17.96l-1.7 18.99-16.26 4.39v15.2l30.02-8.33 3.96-44.36h-33.98v14.1z" />
      </svg>
    );
  }

  // Rust
  if (lang === 'rust' || lang === 'rs') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <g fill="#DEA584">
          <path d="M119.5 56.5c-.3-1.6-.7-3.1-1.3-4.6l5.2-4.2-7.2-12.5-6.6 1.4c-1.2-1.1-2.6-2-4-2.8l1.5-6.6-12.5-7.2-4.2 5.2c-1.5-.6-3-1-4.6-1.3V17H73.3v6.9c-1.6.3-3.1.7-4.6 1.3l-4.2-5.2-12.5 7.2 1.4 6.6c-1.1 1.2-2 2.6-2.8 4l-6.6-1.5-7.2 12.5 5.2 4.2c-.6 1.5-1 3-1.3 4.6H33.8v12.5h6.9c.3 1.6.7 3.1 1.3 4.6l-5.2 4.2 7.2 12.5 6.6-1.4c1.2 1.1 2.6 2 4 2.8l-1.5 6.6 12.5 7.2 4.2-5.2c1.5.6 3 1 4.6 1.3v6.9h12.5v-6.9c1.6-.3 3.1-.7 4.6-1.3l4.2 5.2 12.5-7.2-1.4-6.6c1.1-1.2 2-2.6 2.8-4l6.6 1.5 7.2-12.5-5.2-4.2c.6-1.5 1-3 1.3-4.6h6.9V56.5h-6.9zm-39.7 7.5c0 8.8-7.2 16-16 16s-16-7.2-16-16 7.2-16 16-16 16 7.1 16 16z" />
          <path d="M52 46h24v12H64v6h10v10H64v12H52V46z" fill="#000000" />
        </g>
      </svg>
    );
  }

  // Go / Golang
  if (lang === 'go' || lang === 'golang') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#00ADD8" d="M12.8 54.4h32v8.5h-32zm-6.4 12.8h38.4v8.5H6.4zm12.8 12.8h25.6v8.5H19.2zM76.8 38.4c-16.5 0-29.9 13.4-29.9 29.9s13.4 29.9 29.9 29.9c14.2 0 26.2-9.9 29.2-23.1H76.8v-13.6h44c.5 2.2.8 4.4.8 6.8 0 23.8-19.3 43.1-43.1 43.1-23.8 0-43.1-19.3-43.1-43.1S54.7 25.2 78.5 25.2c11.8 0 22.5 4.8 30.3 12.5l-9.3 9.3c-5.8-5.4-13.8-8.6-22.7-8.6z" />
      </svg>
    );
  }

  // Java
  if (lang === 'java') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#5382A1" d="M46.7 99.4c16.2 1.3 32.5-.4 47.9-5.1 0 0-4.3 3.5-12.7 6.4-18.7 6.4-48.4 4.3-35.2-1.3zM42.2 84.1c14.5 1.1 30.8-.2 46.1-5.7 0 0-3.6 2.7-10.4 4.9-17.7 5.6-45.7 4.7-35.7.8z" />
        <path fill="#E76F00" d="M72.1 35.8c6.6 7.6 1.7 14.4-4.8 20.8-7.8 7.7-14.8 15.6-1.7 25.1-16-10.7-18-20.2-9.6-28.7 9.8-9.9 13.9-12.9 16.1-17.2zM80.5 14.8c4.2 8.4-5.1 16-12.3 22.8-5.8 5.4-11.8 11.2-5.4 19.3-12.6-9.8-11.5-18.5-4.4-25.7 7.7-7.9 17.5-11.4 22.1-16.4z" />
        <path fill="#5382A1" d="M96.7 106.6c-27.5 7.7-65.5 8.1-84.3-1.9-2.8-1.5 5.5-3.8 8.8-4.4-13.6-7.8-2.6-17.6 6.8-16.5-6.2-7.5 12.1-14.7 20.4-14.8-5.3-7.5 22.1-16.2 30-2.4-7.8.2-14.9 3.8-12.7 10.6 8.3 1.1 16.5 2.5 24.3 4.5 18.5 4.8 28.5 12.8 6.7 24.9z" />
      </svg>
    );
  }

  // C++ / C# / C
  if (lang === 'cpp' || lang === 'c++') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#00599C" d="M117.5 33.1L67.7 4.3c-2.3-1.3-5.1-1.3-7.4 0L10.5 33.1c-2.3 1.3-3.7 3.8-3.7 6.4v57.6c0 2.7 1.4 5.1 3.7 6.4l49.8 28.8c2.3 1.3 5.1 1.3 7.4 0l49.8-28.8c2.3-1.3 3.7-3.8 3.7-6.4V39.5c0-2.6-1.4-5.1-3.7-6.4z" />
        <path fill="#FFFFFF" d="M64 34.6c-16.2 0-29.4 13.2-29.4 29.4S47.8 93.4 64 93.4c12.3 0 22.9-7.6 27.2-18.4H77.9C74.7 80 69.7 83.1 64 83.1c-10.5 0-19.1-8.6-19.1-19.1S53.5 44.9 64 44.9c5.7 0 10.7 3.1 13.9 8.1h13.3c-4.3-10.8-14.9-18.4-27.2-18.4zm28.4 24.5v-7.1h4.9v7.1h7.1v4.9h-7.1v7.1h-4.9v-7.1h-7.1v-4.9h7.1zm17.4 0v-7.1h4.9v7.1h7.1v4.9h-7.1v7.1h-4.9v-7.1h-7.1v-4.9h7.1z" />
      </svg>
    );
  }

  if (lang === 'csharp' || lang === 'c#' || lang === 'cs') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#9B4993" d="M117.5 33.1L67.7 4.3c-2.3-1.3-5.1-1.3-7.4 0L10.5 33.1c-2.3 1.3-3.7 3.8-3.7 6.4v57.6c0 2.7 1.4 5.1 3.7 6.4l49.8 28.8c2.3 1.3 5.1 1.3 7.4 0l49.8-28.8c2.3-1.3 3.7-3.8 3.7-6.4V39.5c0-2.6-1.4-5.1-3.7-6.4z" />
        <path fill="#FFFFFF" d="M64 34.6c-16.2 0-29.4 13.2-29.4 29.4S47.8 93.4 64 93.4c12.3 0 22.9-7.6 27.2-18.4H77.9C74.7 80 69.7 83.1 64 83.1c-10.5 0-19.1-8.6-19.1-19.1S53.5 44.9 64 44.9c5.7 0 10.7 3.1 13.9 8.1h13.3c-4.3-10.8-14.9-18.4-27.2-18.4zm33.4 16.5h4.1l-1.5 6.8h5.3l-1.1 4.9h-5.3l-1.8 8h4.6l-1.1 4.9h-4.6l-2.4 10.7h-4.9l2.4-10.7h-7.6l-2.4 10.7h-4.9l2.4-10.7h-3.9l1.1-4.9h4.4l1.8-8h-4.6l1.1-4.9h5.1l1.5-6.8h4.9l-1.5 6.8h7.6l1.5-6.8h4.9zm-6.5 11.7l-1.8 8h7.6l1.8-8h-7.6z" />
      </svg>
    );
  }

  if (lang === 'c') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#A8B9CC" d="M117.5 33.1L67.7 4.3c-2.3-1.3-5.1-1.3-7.4 0L10.5 33.1c-2.3 1.3-3.7 3.8-3.7 6.4v57.6c0 2.7 1.4 5.1 3.7 6.4l49.8 28.8c2.3 1.3 5.1 1.3 7.4 0l49.8-28.8c2.3-1.3 3.7-3.8 3.7-6.4V39.5c0-2.6-1.4-5.1-3.7-6.4z" />
        <path fill="#283593" d="M64 34.6c-16.2 0-29.4 13.2-29.4 29.4S47.8 93.4 64 93.4c12.3 0 22.9-7.6 27.2-18.4H77.9C74.7 80 69.7 83.1 64 83.1c-10.5 0-19.1-8.6-19.1-19.1S53.5 44.9 64 44.9c5.7 0 10.7 3.1 13.9 8.1h13.3c-4.3-10.8-14.9-18.4-27.2-18.4z" />
      </svg>
    );
  }

  // SQL / PostgreSQL / MySQL
  if (lang === 'sql' || lang === 'postgres' || lang === 'postgresql' || lang === 'mysql' || lang === 'sqlite') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="16" fill="#336791" />
        <ellipse cx="64" cy="36" rx="42" ry="16" fill="#4AA3DF" />
        <path d="M22 36v24c0 8.8 18.8 16 42 16s42-7.2 42-16V36" stroke="#FFFFFF" strokeWidth="6" fill="none" />
        <path d="M22 60v24c0 8.8 18.8 16 42 16s42-7.2 42-16V60" stroke="#FFFFFF" strokeWidth="6" fill="none" />
        <path d="M22 84v20c0 8.8 18.8 16 42 16s42-7.2 42-16V84" stroke="#FFFFFF" strokeWidth="6" fill="none" />
      </svg>
    );
  }

  // Bash / Shell / Terminal / Zsh / PowerShell
  if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh' || lang === 'terminal' || lang === 'powershell') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="16" fill="#24292E" />
        <path d="M30 40l28 24-28 24" stroke="#4EBA6F" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M68 92h32" stroke="#4EBA6F" strokeWidth="12" strokeLinecap="round" />
      </svg>
    );
  }

  // JSON
  if (lang === 'json') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="16" fill="#292929" />
        <text x="64" y="78" fill="#F7DF1E" fontSize="42" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          {'{ }'}
        </text>
      </svg>
    );
  }

  // PHP
  if (lang === 'php') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <ellipse cx="64" cy="64" rx="58" ry="34" fill="#777BB4" />
        <path d="M34 52h14c6 0 10 3 10 8s-4 8-10 8H38l-4 12H24l10-28zm11 11h3c3 0 5-1 5-3s-2-3-5-3h-3v6zm22-11h10l-6 16h10l-4 12H67l10-28zm21 0h14c6 0 10 3 10 8s-4 8-10 8h-6l-4 12H88l10-28zm11 11h3c3 0 5-1 5-3s-2-3-5-3h-3v6z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Ruby
  if (lang === 'ruby' || lang === 'rb') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#CC342D" d="M14 84l50 36 50-36L96 24H32z" />
        <path fill="#FFFFFF" opacity="0.3" d="M64 120L14 84l18-60h32z" />
        <path fill="#FFFFFF" opacity="0.5" d="M64 120l50-36-18-60H64z" />
      </svg>
    );
  }

  // Swift
  if (lang === 'swift') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <rect width="128" height="128" rx="24" fill="#FA7343" />
        <path d="M106 82c-12 18-34 26-54 20 18-6 30-18 36-32-12 8-28 10-42 6 22-8 36-24 40-42-16 10-34 14-50 10C24 41 18 28 16 14c-2 18 4 40 18 56-10-8-16-20-18-32 0 24 16 46 38 56 22 10 48 4 64-12h-12z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Kotlin
  if (lang === 'kotlin' || lang === 'kt') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <defs>
          <linearGradient id="kt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7F52FF" />
            <stop offset="50%" stopColor="#C711E1" />
            <stop offset="100%" stopColor="#E4485D" />
          </linearGradient>
        </defs>
        <path fill="url(#kt-grad)" d="M120 8H8v112h112L64 64z" />
      </svg>
    );
  }

  // Docker / Dockerfile
  if (lang === 'docker' || lang === 'dockerfile') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128">
        <path fill="#2496ED" d="M121.2 56.4c-2.4-1.6-7.8-2.6-12.8-.7-1.4-6.4-6.2-11.4-12.6-13.6l-3.2-1.1-.9 3.2c-2.4 8.7 1.5 16.9 7 21.6-4.6 3.1-12.4 4.5-22.3 4.5H8.6c-1.3 5.4-.5 14.6 3.5 21.3 6.6 11 19 17.6 37.8 17.6 34.6 0 59.4-19 66.8-44.5 5.9.4 12.3-.9 15.6-7.4l.6-1.1-11.7-.9z" />
        <path fill="#2496ED" d="M26 36h12v12H26zm16 0h12v12H42zm16 0h12v12H58zm-32 16h12v12H26zm16 0h12v12H42zm16 0h12v12H58zm16 0h12v12H74zm16 0h12v12H90z" />
      </svg>
    );
  }

  // YAML / YML
  if (lang === 'yaml' || lang === 'yml') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="16" fill="#CB171E" />
        <text x="64" y="78" fill="#FFFFFF" fontSize="34" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
          YML
        </text>
      </svg>
    );
  }

  // Default clean code badge
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
};
