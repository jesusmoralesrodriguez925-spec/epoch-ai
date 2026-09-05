import Prism from 'prismjs';

// Guarantee global availability in browser and node environments
if (typeof window !== 'undefined') {
  (window as unknown as { Prism: typeof Prism }).Prism = Prism;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as unknown as { Prism: typeof Prism }).Prism = Prism;
}

// 1. Base prerequisites
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';

// 2. Secondary dependencies
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';

// 3. Independent / other languages
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-ini';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-powershell';

export const resolvePrismLanguage = (rawLang: string): string => {
  const l = (rawLang || '').toLowerCase().trim();
  switch (l) {
    case 'py':
    case 'python':
    case 'python3':
      return 'python';
    case 'js':
    case 'javascript':
    case 'node':
    case 'nodejs':
      return 'javascript';
    case 'ts':
    case 'typescript':
      return 'typescript';
    case 'tsx':
    case 'react-tsx':
      return 'tsx';
    case 'jsx':
    case 'react-jsx':
    case 'react':
      return 'jsx';
    case 'html':
    case 'html5':
    case 'xml':
    case 'svg':
    case 'vue':
    case 'svelte':
      return 'markup';
    case 'css':
      return 'css';
    case 'scss':
    case 'sass':
      return 'scss';
    case 'sql':
    case 'postgres':
    case 'postgresql':
    case 'mysql':
    case 'sqlite':
    case 'mariadb':
      return 'sql';
    case 'c':
      return 'c';
    case 'cpp':
    case 'c++':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'csharp':
    case 'cs':
    case 'c#':
    case 'dotnet':
      return 'csharp';
    case 'java':
      return 'java';
    case 'rust':
    case 'rs':
      return 'rust';
    case 'go':
    case 'golang':
      return 'go';
    case 'bash':
    case 'sh':
    case 'shell':
    case 'zsh':
      return 'bash';
    case 'powershell':
    case 'ps1':
      return 'powershell';
    case 'json':
    case 'jsonc':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'php':
      return 'php';
    case 'ruby':
    case 'rb':
      return 'ruby';
    case 'swift':
      return 'swift';
    case 'kotlin':
    case 'kt':
      return 'kotlin';
    case 'docker':
    case 'dockerfile':
      return 'docker';
    case 'markdown':
    case 'md':
      return 'markdown';
    case 'ini':
      return 'ini';
    case 'toml':
      return 'toml';
    case 'graphql':
    case 'gql':
      return 'graphql';
    case 'r':
      return 'r';
    case 'dart':
    case 'flutter':
      return 'dart';
    case 'lua':
      return 'lua';
    default:
      if (Prism.languages[l]) return l;
      return 'javascript';
  }
};

export const highlightCode = (code: string, rawLang: string): string => {
  if (!code) return '';
  const resolved = resolvePrismLanguage(rawLang);
  const grammar = Prism.languages[resolved] || Prism.languages.javascript || Prism.languages.markup;

  try {
    if (grammar) {
      return Prism.highlight(code, grammar, resolved);
    }
  } catch (err) {
    console.warn('Prism highlight error for language:', rawLang, err);
  }

  // Fallback: escaped HTML
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export default Prism;
