import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

// Helper to determine standard extension and filename from language or code header
export function getFileNameForLanguage(code: string, language: string, index: number = 1): string {
  const lang = (language || '').toLowerCase().trim();
  
  // Try to find file name comment in code (e.g. // index.js or # main.py or <!-- index.html --> or /* style.css */)
  const firstLine = code.split('\n')[0]?.trim() || '';
  const secondLine = code.split('\n')[1]?.trim() || '';
  const headerText = `${firstLine}\n${secondLine}`;

  const fileNameRegex = /(?:\/\/\s*|\/\*\s*|#\s*|<!--\s*)([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)(?:\s*\*\/|\s*-->)?/i;
  const match = headerText.match(fileNameRegex);
  if (match && match[1] && !match[1].startsWith('http')) {
    const candidate = match[1].replace(/^[./]+/, '');
    if (candidate.includes('.')) return candidate;
  }

  const extMap: Record<string, { ext: string; defaultName: string }> = {
    python: { ext: 'py', defaultName: 'script.py' },
    py: { ext: 'py', defaultName: 'script.py' },
    javascript: { ext: 'js', defaultName: 'script.js' },
    js: { ext: 'js', defaultName: 'script.js' },
    typescript: { ext: 'ts', defaultName: 'index.ts' },
    ts: { ext: 'ts', defaultName: 'index.ts' },
    tsx: { ext: 'tsx', defaultName: 'Component.tsx' },
    jsx: { ext: 'jsx', defaultName: 'Component.jsx' },
    html: { ext: 'html', defaultName: 'index.html' },
    markup: { ext: 'html', defaultName: 'index.html' },
    css: { ext: 'css', defaultName: 'styles.css' },
    scss: { ext: 'scss', defaultName: 'styles.scss' },
    json: { ext: 'json', defaultName: 'data.json' },
    sql: { ext: 'sql', defaultName: 'query.sql' },
    bash: { ext: 'sh', defaultName: 'script.sh' },
    sh: { ext: 'sh', defaultName: 'script.sh' },
    shell: { ext: 'sh', defaultName: 'script.sh' },
    zsh: { ext: 'sh', defaultName: 'script.sh' },
    c: { ext: 'c', defaultName: 'main.c' },
    cpp: { ext: 'cpp', defaultName: 'main.cpp' },
    'c++': { ext: 'cpp', defaultName: 'main.cpp' },
    csharp: { ext: 'cs', defaultName: 'Program.cs' },
    'c#': { ext: 'cs', defaultName: 'Program.cs' },
    cs: { ext: 'cs', defaultName: 'Program.cs' },
    java: { ext: 'java', defaultName: 'Main.java' },
    rust: { ext: 'rs', defaultName: 'main.rs' },
    rs: { ext: 'rs', defaultName: 'main.rs' },
    go: { ext: 'go', defaultName: 'main.go' },
    golang: { ext: 'go', defaultName: 'main.go' },
    yaml: { ext: 'yaml', defaultName: 'config.yaml' },
    yml: { ext: 'yaml', defaultName: 'config.yaml' },
    markdown: { ext: 'md', defaultName: 'README.md' },
    md: { ext: 'md', defaultName: 'README.md' },
    dockerfile: { ext: 'dockerfile', defaultName: 'Dockerfile' },
    docker: { ext: 'dockerfile', defaultName: 'Dockerfile' },
    xml: { ext: 'xml', defaultName: 'data.xml' },
    csv: { ext: 'csv', defaultName: 'data.csv' },
  };

  if (extMap[lang]) {
    const item = extMap[lang];
    return index > 1 ? `${item.defaultName.split('.')[0]}_${index}.${item.ext}` : item.defaultName;
  }

  return `archivo_${index}.txt`;
}

// 1. Download Individual Code / Text File
export function downloadCodeFile(code: string, language: string, customFilename?: string): string {
  const filename = customFilename || getFileNameForLanguage(code, language);
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
  return filename;
}

// 2. Download Multi-File Project (.zip)
export async function downloadProjectZip(
  files: Array<{ name: string; content: string }>,
  projectName: string = 'proyecto-kodi-ai'
): Promise<string> {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.name, file.content);
  });

  // Add a README.md if not already present
  if (!files.some((f) => f.name.toLowerCase().includes('readme'))) {
    zip.file(
      'README.md',
      `# ${projectName}\n\nGenerado con **KODI AI** - Asistente Autónomo de Ingeniería de Software.\n\nFecha: ${new Date().toLocaleString()}\n`
    );
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const zipFileName = `${projectName}.zip`;
  saveAs(content, zipFileName);
  return zipFileName;
}

// 3. Extract and Download Data Tables as Excel (.xlsx) or CSV
export interface ParsedTableData {
  headers: string[];
  rows: string[][];
  title?: string;
}

export function parseMarkdownTable(markdown: string): ParsedTableData[] {
  const tables: ParsedTableData[] = [];
  const lines = markdown.split('\n');
  let currentTableLines: string[] = [];
  let tableTitle = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (currentTableLines.length === 0 && i > 0 && lines[i - 1].trim().length > 0) {
        tableTitle = lines[i - 1].replace(/^[#*_\s]+/, '').replace(/[*_#:]+$/, '').trim();
      }
      currentTableLines.push(line);
    } else {
      if (currentTableLines.length >= 2) {
        const parsed = parseSingleMarkdownTableLines(currentTableLines, tableTitle);
        if (parsed) tables.push(parsed);
      }
      currentTableLines = [];
      tableTitle = '';
    }
  }

  if (currentTableLines.length >= 2) {
    const parsed = parseSingleMarkdownTableLines(currentTableLines, tableTitle);
    if (parsed) tables.push(parsed);
  }

  return tables;
}

export const parseMarkdownTables = parseMarkdownTable;

function parseSingleMarkdownTableLines(lines: string[], title?: string): ParsedTableData | null {
  if (lines.length < 2) return null;

  const parseRow = (rowLine: string) => {
    return rowLine
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim().replace(/[*_`]/g, ''));
  };

  const headers = parseRow(lines[0]);
  const rows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    // Skip separator row like |---|---|
    if (/^\|[-:\s|]+\|$/.test(lines[i])) continue;
    rows.push(parseRow(lines[i]));
  }

  if (headers.length === 0 || rows.length === 0) return null;

  return { headers, rows, title };
}

export function downloadExcelFromTable(
  table: ParsedTableData,
  filename: string = 'datos-kodi.xlsx'
): string {
  const wsData = [table.headers, ...table.rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto column widths
  const colWidths = table.headers.map((h, i) => {
    const maxRowLen = table.rows.reduce((max, row) => Math.max(max, (row[i] || '').length), h.length);
    return { wch: Math.min(Math.max(maxRowLen + 3, 12), 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, table.title ? table.title.slice(0, 25) : 'KODI Datos');

  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalName);
  return finalName;
}

export function downloadCsvFromTable(
  table: ParsedTableData,
  filename: string = 'datos-kodi.csv'
): string {
  const wsData = [table.headers, ...table.rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const finalName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  saveAs(blob, finalName);
  return finalName;
}

// 4. Generate & Download Professional PDF Report
export function downloadPdfReport(
  title: string,
  markdownContent: string,
  filename: string = 'Reporte-KODI-AI.pdf'
): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let currentY = margin;

  // Header Banner: KODI AI Corporate Style (Dark/Gold Accent)
  doc.setFillColor(15, 15, 20); // #0f0f14
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bar
  doc.setFillColor(245, 158, 11); // Amber/Gold #f59e0b
  doc.rect(0, 26, pageWidth, 2, 'F');

  // KODI Logo mark
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(margin, 5, 18, 18, 3, 3, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('K', margin + 6.5, 17.5);

  // KODI AI Brand Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('AGENT KODI AI', margin + 22, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.text('Reporte y Documentación Técnica Autónoma', margin + 22, 18);

  // Date on right
  const dateStr = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(8.5);
  doc.text(dateStr, pageWidth - margin, 15, { align: 'right' });

  currentY = 38;

  // Document Title
  const cleanTitle = title || 'Documentación Técnica y Reporte Ejecutivo';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(24, 24, 27); // Zinc 900
  const titleLines = doc.splitTextToSize(cleanTitle, pageWidth - margin * 2);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 7 + 4;

  // Divider line
  doc.setDrawColor(228, 228, 231); // Zinc 200
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Process Markdown Content Paragraphs, Headings, Tables & Code
  const lines = markdownContent.split('\n');
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let tableLines: string[] = [];

  const checkPageBreak = (neededHeight: number = 10) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block start/end
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockLines.join('\n');
        checkPageBreak(25);

        doc.setFillColor(244, 244, 245); // Zinc 100
        doc.setDrawColor(212, 212, 216); // Zinc 300
        doc.setFont('courier', 'normal');
        doc.setFontSize(8.5);

        const codeFormatted = doc.splitTextToSize(codeText, pageWidth - margin * 2 - 8);
        const boxHeight = codeFormatted.length * 4.2 + 6;

        if (currentY + boxHeight > pageHeight - 20) {
          doc.addPage();
          currentY = 20;
        }

        doc.roundedRect(margin, currentY, pageWidth - margin * 2, boxHeight, 2, 2, 'FD');
        doc.setTextColor(39, 39, 42);
        doc.text(codeFormatted, margin + 4, currentY + 5);
        currentY += boxHeight + 6;
        codeBlockLines = [];
      } else {
        inCodeBlock = true;
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Markdown Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableLines.push(trimmed);
      continue;
    } else if (tableLines.length > 0) {
      const parsedTable = parseSingleMarkdownTableLines(tableLines);
      if (parsedTable) {
        checkPageBreak(30);
        autoTable(doc, {
          startY: currentY,
          head: [parsedTable.headers],
          body: parsedTable.rows,
          margin: { left: margin, right: margin },
          theme: 'grid',
          headStyles: {
            fillColor: [18, 18, 26],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8.5,
            textColor: [39, 39, 42],
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
        });
        currentY = (doc as any).lastAutoTable.finalY + 8;
      }
      tableLines = [];
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      checkPageBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(18, 18, 26);
      doc.text(trimmed.replace(/^#\s+/, ''), margin, currentY);
      currentY += 8;
    } else if (trimmed.startsWith('## ')) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(24, 24, 27);
      doc.text(trimmed.replace(/^##\s+/, ''), margin, currentY);
      currentY += 7;
    } else if (trimmed.startsWith('### ')) {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(39, 39, 42);
      doc.text(trimmed.replace(/^###\s+/, ''), margin, currentY);
      currentY += 6;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // List items
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42);
      const bulletText = trimmed.replace(/^[-*]\s+/, '').replace(/[*_`]/g, '');
      const wrapped = doc.splitTextToSize(`• ${bulletText}`, pageWidth - margin * 2 - 4);
      doc.text(wrapped, margin + 2, currentY);
      currentY += wrapped.length * 4.8 + 1.5;
    } else if (trimmed.length > 0) {
      // Standard paragraph
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42);
      const cleanText = trimmed.replace(/[*_`]/g, '');
      const wrapped = doc.splitTextToSize(cleanText, pageWidth - margin * 2);
      doc.text(wrapped, margin, currentY);
      currentY += wrapped.length * 4.8 + 2.5;
    } else {
      currentY += 2;
    }
  }

  // Add Page Numbers in Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.text(`Página ${p} de ${totalPages} • Generado por KODI AI`, margin, pageHeight - 8);
    doc.text('Documento Confidencial & Oficial', pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(finalName);
  return finalName;
}

// 5. Generate & Download Word (.docx) Document
export async function downloadDocxReport(
  title: string,
  markdownContent: string,
  filename: string = 'Documento-KODI-AI.docx'
): Promise<string> {
  const paragraphs: (Paragraph | Table)[] = [];

  // Title
  paragraphs.push(
    new Paragraph({
      text: title || 'Reporte Técnico KODI AI',
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generado por KODI AI el ${new Date().toLocaleDateString('es-ES')}`,
          italics: true,
          color: '71717A',
          size: 20,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  const lines = markdownContent.split('\n');

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          text: `• ${trimmed.replace(/^[-*]\s+/, '').replace(/[*_`]/g, '')}`,
          spacing: { after: 80 },
        })
      );
    } else if (!trimmed.startsWith('```') && !trimmed.startsWith('|')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/[*_`]/g, ''),
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const finalName = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  saveAs(blob, finalName);
  return finalName;
}

// 6. Download raw Markdown file (.md)
export function downloadMarkdownFile(content: string, filename: string = 'documentacion.md'): string {
  const finalName = filename.endsWith('.md') ? filename : `${filename}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, finalName);
  return finalName;
}

// 7. Utility to extract all code blocks from message text
export function extractCodeBlocks(text: string): Array<{ name: string; content: string; language: string }> {
  if (!text) return [];
  const blocks: Array<{ name: string; content: string; language: string }> = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let idx = 1;
  while ((match = regex.exec(text)) !== null) {
    const lang = match[1] || 'text';
    const content = match[2] || '';
    if (content.trim().length > 0) {
      const name = getFileNameForLanguage(content, lang, idx);
      blocks.push({ name, content, language: lang });
      idx++;
    }
  }
  return blocks;
}

// 8. Utility to extract clean title from markdown
export function extractTitleFromMarkdown(text: string): string {
  if (!text) return 'Reporte Técnico KODI AI';
  const match = text.match(/^#\s+(.+)$/m) || text.match(/^##\s+(.+)$/m);
  if (match && match[1]) {
    return match[1].replace(/[*_`#]/g, '').trim();
  }
  const firstLine = text.split('\n')[0]?.replace(/[*_`#]/g, '').trim();
  if (firstLine && firstLine.length > 3 && firstLine.length < 80) {
    return firstLine;
  }
  return 'Reporte Técnico KODI AI';
}

