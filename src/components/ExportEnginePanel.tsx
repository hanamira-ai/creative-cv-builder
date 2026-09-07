import React, { useState } from 'react';
import { 
  FileDown, 
  FileText, 
  Printer, 
  Cpu, 
  Sparkles, 
  Server, 
  Code2, 
  Copy, 
  Check, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileCode2,
  Workflow
} from 'lucide-react';
import { CVData } from '../types';
import { downloadPDF, exportToPdfClient, PUPPETEER_SERVER_SCRIPT } from '../exportPdf';
import { generateAndDownloadDocx, generateDocxBlob, generateWordHtmlBlob, generateDocxHTML, PYTHON_DOCX_SCRIPT } from '../exportDocx';
import { saveAs } from 'file-saver';

interface ExportEnginePanelProps {
  currentCVData: CVData;
  selectedThemeId: string;
  sidebarTheme?: 'light' | 'dark';
  onSidebarThemeChange?: (newTheme: 'light' | 'dark') => void;
  badgeTheme?: 'light' | 'dark';
  onBadgeThemeChange?: (newTheme: 'light' | 'dark') => void;
  standaloneHtmlCode: string;
}

export const ExportEnginePanel: React.FC<ExportEnginePanelProps> = ({
  currentCVData,
  selectedThemeId,
  sidebarTheme = 'dark',
  onSidebarThemeChange,
  badgeTheme = 'dark',
  onBadgeThemeChange,
  standaloneHtmlCode
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string>('');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [docxSuccess, setDocxSuccess] = useState(false);
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<'pdf-client' | 'pdf-server' | 'docx-client' | 'docx-table-html' | 'docx-python' | 'pipeline'>('pipeline');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Trigger Client-Side PDF Export (Target strictly id="cv-paper-target")
  const handleExportPdfClient = async () => {
    try {
      setIsExportingPdf(true);
      setPdfStatus('Memulai rasterisasi kanvas A4 (windowWidth: 794)...');
      const cleanName = currentCVData.personal_info.name.replace(/\s+/g, '_');
      await downloadPDF('cv-paper-target', {
        filename: `CV_${cleanName}_A4.pdf`,
        quality: 2,
        onProgress: (msg) => setPdfStatus(msg)
      });
      setPdfStatus('Berhasil diunduh!');
      setTimeout(() => {
        setIsExportingPdf(false);
        setPdfStatus('');
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setPdfStatus(`Gagal: ${err.message || 'Error ekspor PDF'}`);
      setTimeout(() => {
        setIsExportingPdf(false);
        setPdfStatus('');
      }, 4000);
    }
  };

  // Trigger Client-Side DOCX / Word Export
  const handleExportDocx = async (format: 'docx' | 'doc' = 'docx') => {
    try {
      setIsExportingDocx(true);
      const sbTheme: 'light' | 'dark' = sidebarTheme === 'light' ? 'light' : 'dark';
      const bgTheme: 'light' | 'dark' = badgeTheme === 'light' ? 'light' : 'dark';
      
      if (format === 'doc') {
        const fullName = (currentCVData.personal_info as any).full_name || currentCVData.personal_info.name || 'Candidate';
        const cleanName = fullName.trim().replace(/\s+/g, '_');
        const blob = generateWordHtmlBlob(currentCVData, selectedThemeId, sbTheme, bgTheme);
        saveAs(blob, `CV_${cleanName}.doc`);
      } else {
        await generateAndDownloadDocx(currentCVData, selectedThemeId, sbTheme, bgTheme);
      }

      setDocxSuccess(true);
      setTimeout(() => {
        setIsExportingDocx(false);
        setDocxSuccess(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsExportingDocx(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const clientPdfCode = `// EKSPOR PDF CLIENT-SIDE DENGAN html2canvas & jsPDF (A4 Fixed, windowWidth: 794)
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function downloadPDF(elementId = 'cv-paper-target') {
  const element = document.getElementById(elementId);
  if (!element) return;

  // 1. Render DOM ke Canvas dengan windowWidth: 794 (A4 Desktop 96 DPI)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    windowWidth: 794, // Kunci viewport A4 desktop agar layout 2-kolom tidak collapse
    ignoreElements: (node) => node.classList?.contains('no-print'),
    onclone: (clonedDoc) => {
      const cloned = clonedDoc.getElementById(elementId);
      if (cloned) {
        if (cloned.parentElement) cloned.parentElement.style.transform = 'none';
        cloned.style.transform = 'none';
        cloned.style.margin = '0';
        cloned.style.boxShadow = 'none';
        cloned.style.width = '210mm';
        cloned.style.minHeight = '297mm';
        cloned.style.display = 'grid';
        cloned.style.gridTemplateColumns = '32% 68%';
      }
    }
  });

  // 2. Inisialisasi dokumen jsPDF A4 portrait (210mm x 297mm) Margin: 0
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // 3. Masukkan gambar pas ke halaman PDF A4 (margin 0) & unduh
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  pdf.save('Curriculum_Vitae_A4.pdf');
}`;

  const clientDocxCode = `// EKSPOR DOCX DENGAN LIBRARY 'docx' (Office Open XML Asli - DXA Valid)
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

export async function exportToDocxFile(cvData) {
  // 1. Total Lebar Printable A4: 10,772 DXA (Sidebar: 3,447 DXA [32%], Main: 7,325 DXA [68%])
  const SIDEBAR_DXA = 3447;
  const MAIN_DXA = 7325;
  const TOTAL_DXA = 10772;

  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' };

  const table = new Table({
    width: { size: TOTAL_DXA, type: WidthType.DXA },
    columnWidths: [SIDEBAR_DXA, MAIN_DXA],
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
    rows: [
      new TableRow({
        children: [
          // Sidebar Kiri (32%)
          new TableCell({
            width: { size: SIDEBAR_DXA, type: WidthType.DXA },
            shading: { fill: '182634' },
            margins: { top: 240, bottom: 240, left: 220, right: 220 },
            children: [
              new Paragraph({ children: [new TextRun({ text: cvData.personal_info.name, bold: true, size: 28, color: 'FFFFFF' })] }),
              new Paragraph({ children: [new TextRun({ text: 'KONTAK', bold: true, color: 'C08A3E' })] }),
              new Paragraph({ text: cvData.personal_info.contact.email, color: 'CBD5E1' }),
              new Paragraph({ text: cvData.personal_info.contact.phone, color: 'CBD5E1' })
            ]
          }),
          // Konten Utama Kanan (68%)
          new TableCell({
            width: { size: MAIN_DXA, type: WidthType.DXA },
            margins: { top: 240, bottom: 240, left: 280, right: 220 },
            children: [
              new Paragraph({ children: [new TextRun({ text: cvData.personal_info.title, bold: true, size: 22, color: '182634' })] }),
              new Paragraph({ text: cvData.personal_info.summary }),
              new Paragraph({ children: [new TextRun({ text: 'PENGALAMAN KERJA', bold: true, color: '182634' })] })
            ]
          })
        ]
      })
    ]
  });

  // 2. Bungkus ke Dokumen Word A4 Presisi (Margin 10mm = 567 DXA)
  const doc = new Document({
    sections: [{
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 567, right: 567, bottom: 567, left: 567 } }
      },
      children: [table]
    }]
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}`;

  const docxTableHtmlCode = `// STRUKTUR TABEL 2-KOLOM NATIVE MICROSOFT WORD (generateDocxHTML)
// Mengubah data JSON CV menjadi HTML berbasis tabel 2-kolom:
// <table width="100%">
//   <tr>
//     <td width="32%" valign="top" style="background-color: #182634; ...">...Sidebar...</td>
//     <td width="68%" valign="top" style="background-color: #ffffff; ...">...Main Content...</td>
//   </tr>
// </table>
// Disertai Office XML Namespace Header agar 100% kompatibel dan tidak corrupt di MS Word.

import { generateDocxHTML, generateWordHtmlBlob } from './exportDocx';

export function exportWordHtmlTable(cvData, themeId = 'navy-gold') {
  const html = generateDocxHTML(cvData, themeId);
  const blob = new Blob(['\\ufeff' + html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'CV_' + cvData.personal_info.name.replace(/\\s+/g, '_') + '.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}`;

  const endToEndPipelineCode = `/**
 * WORKFLOW UTUH END-TO-END:
 * Input Dokumen -> Gemini Multimodal Extraksi -> JSON Skema Valid -> Render HTML -> Ekspor PDF & DOCX
 */

// 1. LANGKAH 1: Server Route Menerima File & Kirim ke Gemini 2.5 Flash
import { GoogleGenAI, Type } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseResumeWithGemini(fileBuffer, mimeType) {
  const prompt = \`Ekstraksi seluruh data riwayat hidup ke JSON skema 9 modul ketat (personal_info, core_skills, tech_stack, work_experience, digital_portfolio, education, languages, certifications, references).\`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          { inlineData: { data: fileBuffer.toString('base64'), mimeType } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      // Memastikan skema JSON tervalidasi 100% tanpa halusinasi
      responseSchema: CV_STRICT_JSON_SCHEMA
    }
  });

  return JSON.parse(response.text);
}

// 2. LANGKAH 2: Render Data ke Template HTML A4
export function renderCvHtml(cvData, themeId = 'navy-gold') {
  return generateStandaloneCVHtml(cvData, themeId);
}

// 3. LANGKAH 3: Download Button Actions di Frontend
// Tombol PDF: exportToPdfClient() atau panggil /api/export/pdf (Puppeteer)
// Tombol DOCX: generateDocxBlob(cvData) -> saveAs(blob, 'CV.docx')
`;

  return (
    <div className="space-y-6">
      {/* Top Action Banners for Live Download */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Action 1: Client PDF Export */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileDown className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Ekspor PDF (Client-Side)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Menggunakan <code className="text-amber-400">html-to-image</code> (SVG foreignObject native) & <code className="text-amber-400">jsPDF</code> langsung di browser pengguna dengan resolusi tinggi (300 DPI).
            </p>
          </div>

          <button
            onClick={handleExportPdfClient}
            disabled={isExportingPdf}
            className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isExportingPdf ? (
              <span className="flex items-center gap-2 text-[11px] animate-pulse">
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                {pdfStatus || 'Memproses PDF...'}
              </span>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Unduh File .PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Action 2: DOCX Export */}
        <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Ekspor DOCX (Word Asli)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Membuat file <code className="text-cyan-400">.docx</code> asli (Office Open XML) berstruktur tabel 2-kolom (32% shaded, 68% konten) menggunakan library <code className="text-cyan-400">docx</code>.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleExportDocx('docx')}
              disabled={isExportingDocx}
              className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isExportingDocx ? (
                <span className="flex items-center gap-2 text-[11px] animate-pulse">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  Menyusun Dokumen Word...
                </span>
              ) : docxSuccess ? (
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Check className="w-4 h-4" />
                  Tersimpan (.docx)
                </span>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Unduh File .DOCX</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleExportDocx('doc')}
              disabled={isExportingDocx}
              className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-[11px] rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Unduh format tabel Word XML (.doc)"
            >
              <span>Alternatif: Unduh .DOC (HTML Table)</span>
            </button>
          </div>
        </div>

        {/* Action 3: Browser Print / PDF Native */}
        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Print / Save PDF (Browser)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memanfaatkan render engine native browser Chrome/Safari dengan aturan <code className="text-emerald-400">@media print</code> dan margin 10mm.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Save as PDF</span>
          </button>
        </div>

        {/* Action 4: Standalone HTML File */}
        <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">HTML5 Standalone</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              File HTML5 tunggal independen berisi CSS variables tema & styling cetak tanpa ketergantungan library eksternal.
            </p>
          </div>

          <button
            onClick={() => {
              const blob = new Blob([standaloneHtmlCode], { type: 'text/html;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `CV_${currentCVData.personal_info.name.replace(/\s+/g, '_')}_A4.html`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FileCode2 className="w-4 h-4" />
            <span>Unduh File .HTML</span>
          </button>
        </div>

      </div>

      {/* Visual Workflow Diagram */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Workflow className="w-4 h-4" />
          <span>Workflow Integrasi Utuh (End-to-End Pipeline)</span>
        </div>
        
        <h3 className="text-base sm:text-lg font-bold text-white">
          Dari Dokumen Mentah (PDF/DOCX/Scan) Hingga File Ekspor Presisi
        </h3>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          
          {/* Stage 1 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 relative">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Tahap 1</div>
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Input Dokumen</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-normal">
              Pengguna mengunggah berkas CV lama dalam format PDF, Word (.docx), TXT, atau Foto/Scan (JPEG/PNG).
            </p>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
              File buffer & MIME
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 relative">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Tahap 2</div>
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Gemini 2.5 Extraction</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-normal">
              Gemini API memproses multimodal buffer dokumen lalu mengembalikan data JSON terstruktur 9 modul sesuai <code className="text-cyan-400">responseSchema</code>.
            </p>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
              CVData JSON Object
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 relative">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Tahap 3</div>
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Template Engine & Validation</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-normal">
              Integritas data diverifikasi oleh validator. Data di-binding ke layout A4 2-kolom dengan CSS Variables tema (Navy/Emerald/Charcoal).
            </p>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
              HTML5 + CSS Live DOM
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 relative">
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Tahap 4</div>
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Multi-Format Export</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-normal">
              Pengguna mengunduh hasil dalam format PDF (client / Puppeteer), DOCX (tabel Microsoft Word asli), atau print langsung.
            </p>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
              .PDF, .DOCX, .HTML
            </div>
          </div>

        </div>
      </section>

      {/* Code Architecture Switcher */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">Arsitektur & Skrip Implementasi Lengkap</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCodeSnippet('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeSnippet === 'pipeline'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Workflow Utuh
            </button>
            <button
              onClick={() => setActiveCodeSnippet('docx-client')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeSnippet === 'docx-client'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              DOCX Native (OpenXML)
            </button>
            <button
              onClick={() => setActiveCodeSnippet('docx-table-html')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeSnippet === 'docx-table-html'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Tabel Native Word (HTML)
            </button>
            <button
              onClick={() => setActiveCodeSnippet('docx-python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeSnippet === 'docx-python'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Python-docx Backend
            </button>
            <button
              onClick={() => setActiveCodeSnippet('pdf-client')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeSnippet === 'pdf-client'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Client PDF (jsPDF)
            </button>
            <button
              onClick={() => setActiveCodeSnippet('pdf-server')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeSnippet === 'pdf-server'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Server PDF (Puppeteer)
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950/90 font-mono text-xs text-slate-300 overflow-auto max-h-[500px] leading-relaxed relative">
          <button
            onClick={() => {
              const code = 
                activeCodeSnippet === 'pipeline' ? endToEndPipelineCode :
                activeCodeSnippet === 'docx-client' ? clientDocxCode :
                activeCodeSnippet === 'docx-table-html' ? docxTableHtmlCode :
                activeCodeSnippet === 'docx-python' ? PYTHON_DOCX_SCRIPT :
                activeCodeSnippet === 'pdf-client' ? clientPdfCode :
                PUPPETEER_SERVER_SCRIPT;
              copyToClipboard(code, activeCodeSnippet);
            }}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all z-10"
          >
            {copiedKey === activeCodeSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === activeCodeSnippet ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>

          <pre>
            {activeCodeSnippet === 'pipeline' && endToEndPipelineCode}
            {activeCodeSnippet === 'docx-client' && clientDocxCode}
            {activeCodeSnippet === 'docx-table-html' && docxTableHtmlCode}
            {activeCodeSnippet === 'docx-python' && PYTHON_DOCX_SCRIPT}
            {activeCodeSnippet === 'pdf-client' && clientPdfCode}
            {activeCodeSnippet === 'pdf-server' && PUPPETEER_SERVER_SCRIPT}
          </pre>
        </div>
      </section>

      {/* Comparison Matrix: Client-Side vs Server-Side Puppeteer */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-amber-400" />
          <span>Perbandingan Teknis Solusi PDF & DOCX</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Metode</th>
                <th className="py-2.5 px-3">Presisi Layout</th>
                <th className="py-2.5 px-3">Beban Server</th>
                <th className="py-2.5 px-3">Dukungan CSS/Fonts</th>
                <th className="py-2.5 px-3">Rekomendasi Pemakaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-amber-400">Client-side (jsPDF + html-to-image)</td>
                <td className="py-2.5 px-3 text-emerald-400">Tinggi (300 DPI raster)</td>
                <td className="py-2.5 px-3 text-emerald-400">Nol (100% di browser pengguna)</td>
                <td className="py-2.5 px-3">Sesuai tampilan DOM</td>
                <td className="py-2.5 px-3">Aplikasi web tanpa backend berat atau offline mode.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-cyan-400">Server-side (Puppeteer Chromium)</td>
                <td className="py-2.5 px-3 text-emerald-400">Pixel-Perfect (Vector PDF)</td>
                <td className="py-2.5 px-3 text-amber-400">Menengah (~30-80MB RAM per instance)</td>
                <td className="py-2.5 px-3 text-emerald-400">100% Dukungan CSS Paged Media</td>
                <td className="py-2.5 px-3">Enterprise printing, vector text selectable, batch generation.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-indigo-400">DOCX Generator (docx library)</td>
                <td className="py-2.5 px-3 text-emerald-400">2-Column Table Word XML</td>
                <td className="py-2.5 px-3 text-emerald-400">Sangat Rendah (Client & Server)</td>
                <td className="py-2.5 px-3">Dapat diedit di MS Word/Google Docs</td>
                <td className="py-2.5 px-3">Pengguna yang perlu mengedit teks CV secara manual di Word.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
