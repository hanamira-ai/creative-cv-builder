import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Code2, 
  FileJson, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  Palette,
  Maximize2,
  FileText,
  Layers,
  Layout,
  ExternalLink,
  FileDown,
  Cpu,
  Tag,
  Moon,
  Sun,
  Wand2,
  FileUp,
  RotateCcw
} from 'lucide-react';
import { sampleGuruhWicaksonoCV } from './sampleData';
import { validateCVJson } from './validator';
import { CVData } from './types';
import { CV_THEMES } from './themes';
import { A4ResumePreview } from './components/A4ResumePreview';
import { generateStandaloneCVHtml } from './templateHtmlGenerator';
import { ExportEnginePanel } from './components/ExportEnginePanel';
import { exportToPdfClient } from './exportPdf';
import { generateDocxBlob } from './exportDocx';
import { ProfilePhotoUploader } from './components/ProfilePhotoUploader';
import { DocumentParserPanel } from './components/DocumentParserPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'parser' | 'export' | 'htmlcode' | 'schema' | 'validator'>('preview');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('navy-gold');
  const [sidebarTheme, setSidebarTheme] = useState<'light' | 'dark'>('dark');
  const [badgeTheme, setBadgeTheme] = useState<'light' | 'dark'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(0.92);
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(sampleGuruhWicaksonoCV, null, 2));
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [isQuickExportingPdf, setIsQuickExportingPdf] = useState<boolean>(false);
  const [isQuickExportingDocx, setIsQuickExportingDocx] = useState<boolean>(false);
  const [lastGeneratedTimestamp, setLastGeneratedTimestamp] = useState<string | null>(null);
  const [showGeneratedSuccessAlert, setShowGeneratedSuccessAlert] = useState<boolean>(false);

  const currentTheme = CV_THEMES[selectedThemeId] || CV_THEMES['navy-gold'];

  // Derived current CV data and validation
  const { currentCVData, validationResult } = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      const res = validateCVJson(parsed);
      return {
        currentCVData: res.isValid ? (parsed as CVData) : sampleGuruhWicaksonoCV,
        validationResult: res
      };
    } catch {
      return {
        currentCVData: sampleGuruhWicaksonoCV,
        validationResult: { isValid: false, errors: ['Format JSON tidak valid.'], warnings: [] }
      };
    }
  }, [jsonInput]);

  // Generated Standalone HTML5 + CSS3 Code string
  const standaloneHtmlCode = useMemo(() => {
    return generateStandaloneCVHtml(currentCVData, selectedThemeId, sidebarTheme, badgeTheme);
  }, [currentCVData, selectedThemeId, sidebarTheme, badgeTheme]);

  const handlePrint = () => {
    window.print();
  };

  const handleQuickDownloadPdf = async () => {
    try {
      setIsQuickExportingPdf(true);
      const cleanName = currentCVData.personal_info.name.replace(/\s+/g, '_');
      await exportToPdfClient('printable-cv-sheet', {
        filename: `CV_${cleanName}_A4.pdf`,
        quality: 2.5
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuickExportingPdf(false);
    }
  };

  const handleQuickDownloadDocx = async () => {
    try {
      setIsQuickExportingDocx(true);
      const cleanName = currentCVData.personal_info.name.replace(/\s+/g, '_');
      const blob = await generateDocxBlob(currentCVData, selectedThemeId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${cleanName}_Word.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuickExportingDocx(false);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([standaloneHtmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CV_${currentCVData.personal_info.name.replace(/\s+/g, '_')}_A4.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(standaloneHtmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handlePhotoUploaded = (dataUrl: string) => {
    try {
      const parsed = JSON.parse(jsonInput);
      parsed.personal_info = {
        ...parsed.personal_info,
        profile_picture_placeholder: dataUrl,
      };
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch {
      const updated = {
        ...currentCVData,
        personal_info: {
          ...currentCVData.personal_info,
          profile_picture_placeholder: dataUrl,
        },
      };
      setJsonInput(JSON.stringify(updated, null, 2));
    }
  };

  const handlePhotoRemoved = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      parsed.personal_info = {
        ...parsed.personal_info,
        profile_picture_placeholder: '',
      };
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch {
      const updated = {
        ...currentCVData,
        personal_info: {
          ...currentCVData.personal_info,
          profile_picture_placeholder: '',
        },
      };
      setJsonInput(JSON.stringify(updated, null, 2));
    }
  };

  return (
    <div id="cv-engine-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">AI CV Generator Engine A4</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tahap 3: PDF & DOCX Export Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Template Engine HTML5/CSS3 Responsive A4 & Multi-Format Exporter</p>
            </div>
          </div>

          {/* Quick Actions (Print & Instant Export) */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Quick PDF button */}
            <button
              onClick={handleQuickDownloadPdf}
              disabled={isQuickExportingPdf}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
              title="Unduh file PDF dengan resolusi tinggi (300 DPI)"
            >
              {isQuickExportingPdf ? (
                <Cpu className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isQuickExportingPdf ? 'Exporting...' : 'Unduh PDF'}</span>
            </button>

            {/* Quick DOCX button */}
            <button
              onClick={handleQuickDownloadDocx}
              disabled={isQuickExportingDocx}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-cyan-500/10 active:scale-95 cursor-pointer"
              title="Unduh file Microsoft Word (.docx) 2-kolom"
            >
              {isQuickExportingDocx ? (
                <Cpu className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>{isQuickExportingDocx ? 'Exporting...' : 'Unduh DOCX'}</span>
            </button>

            {/* Native Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer"
              title="Buka dialog cetak browser (Ctrl+P / Cmd+P)"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Cetak</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer"
              title="Unduh file HTML standalone tunggal"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">HTML</span>
            </button>
          </div>
        </div>
      </header>

      {/* Control Toolbar & Theme Switcher */}
      <section id="control-toolbar" className="bg-slate-900 border-b border-slate-800 py-3 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          
          {/* Main Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Live Preview A4</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'export'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ekspor Engine (Tahap 3)</span>
            </button>

            <button
              onClick={() => setActiveTab('htmlcode')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'htmlcode'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Kode HTML5/CSS3</span>
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'schema'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON Data</span>
            </button>

            <button
              onClick={() => setActiveTab('validator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'validator'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Validator</span>
            </button>
          </div>

          {/* Theme Selector (3 Theme Options) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Pilihan Tema:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {Object.values(CV_THEMES).map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected 
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: theme.vars.accent }}
                    ></span>
                    <span className="hidden sm:inline">{theme.name.split(' (')[0]}</span>
                    <span className="sm:hidden">{theme.name.split(' & ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Theme Selector (Background Belakang Foto Sampai Bawah - Light vs Dark) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              {sidebarTheme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              Tema Sidebar:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSidebarTheme('light')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  sidebarTheme === 'light'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title={currentTheme.sidebar?.light?.description || 'Light Theme Sidebar (Latar Terang, Font Gelap)'}
              >
                <span 
                  className="w-3 h-3 rounded-full border border-slate-400/40 shrink-0"
                  style={{ 
                    backgroundColor: currentTheme.sidebar?.light?.bgSidebar || '#F4F6F8'
                  }}
                ></span>
                <span>Light Theme</span>
                <span className="text-[10px] text-slate-400 hidden lg:inline font-mono">
                  (Font Gelap)
                </span>
              </button>
              <button
                onClick={() => setSidebarTheme('dark')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  sidebarTheme === 'dark'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title={currentTheme.sidebar?.dark?.description || 'Dark Theme Sidebar (Latar Gelap Pekat, Font Putih)'}
              >
                <span 
                  className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                  style={{ 
                    backgroundColor: currentTheme.sidebar?.dark?.bgSidebar || '#182634'
                  }}
                ></span>
                <span>Dark Theme</span>
                <span className="text-[10px] text-slate-400 hidden lg:inline font-mono">
                  (Font Putih)
                </span>
              </button>
            </div>
          </div>

          {/* Badge Theme Selector (Light Theme vs Dark Theme) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Warna Badge:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setBadgeTheme('light')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  badgeTheme === 'light'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title={currentTheme.badges?.light?.description || 'Light Theme Badge (Latar Lembut, Font Gelap)'}
              >
                <span 
                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                  style={{ 
                    backgroundColor: currentTheme.badges?.light?.bg || 'rgba(192,138,62,0.15)',
                    borderColor: currentTheme.badges?.light?.border || '#C08A3E'
                  }}
                ></span>
                <span>Light Theme</span>
                <span className="text-[10px] text-slate-400 hidden lg:inline font-mono">
                  (Font Gelap)
                </span>
              </button>
              <button
                onClick={() => setBadgeTheme('dark')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  badgeTheme === 'dark'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title={currentTheme.badges?.dark?.description || 'Dark Theme Badge (Latar Gelap, Font Putih Terang)'}
              >
                <span 
                  className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                  style={{ 
                    backgroundColor: currentTheme.badges?.dark?.bg || '#182634',
                    borderColor: currentTheme.badges?.dark?.border || '#C08A3E'
                  }}
                ></span>
                <span>Dark Theme</span>
                <span className="text-[10px] text-slate-400 hidden lg:inline font-mono">
                  (Font Putih)
                </span>
              </button>
            </div>
          </div>

          {/* Zoom controls for preview */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.6, Number((prev - 0.1).toFixed(2))))}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono text-slate-300 w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(1.2, Number((prev + 0.1).toFixed(2))))}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setZoomLevel(0.92)}
                className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 px-1 cursor-pointer"
                title="Reset Zoom"
              >
                Fit
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Main App Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">

        {/* =========================================================
            TAB 1: LIVE PREVIEW A4 CANVAS
            ========================================================= */}
        {activeTab === 'preview' ? (
          <div className="flex flex-col gap-6">
            {/* Specs Summary Pill */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 no-print">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  Spesifikasi A4 Presisi
                </span>
                <span>Dimensi: <strong>210mm x 297mm</strong></span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Margin @page: <strong>10mm</strong></span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Sidebar: <strong>~32%</strong> / Utama: <strong>~68%</strong></span>
                <span className="hidden lg:inline">•</span>
                <span className="hidden lg:inline">
                  Sidebar: <strong className="text-amber-300">{sidebarTheme === 'dark' ? 'Dark Theme (Font Putih)' : 'Light Theme (Font Gelap)'}</strong>
                </span>
                <span className="hidden xl:inline">•</span>
                <span className="hidden xl:inline">
                  Badge: <strong className="text-cyan-300">{badgeTheme === 'dark' ? 'Dark Theme (Font Putih)' : 'Light Theme (Font Gelap)'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('export')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Opsi Ekspor Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Profile Photo Uploader */}
            <ProfilePhotoUploader
              currentPhotoUrl={currentCVData.personal_info.profile_picture_placeholder}
              candidateName={currentCVData.personal_info.name}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoRemoved={handlePhotoRemoved}
            />

            {/* A4 Sheet Container */}
            <div className="overflow-x-auto py-4 px-2 flex justify-center bg-slate-900/50 rounded-2xl border border-slate-800/80">
              <A4ResumePreview 
                data={currentCVData}
                themeId={selectedThemeId}
                sidebarTheme={sidebarTheme}
                onSidebarThemeChange={setSidebarTheme}
                badgeTheme={badgeTheme}
                onBadgeThemeChange={setBadgeTheme}
                zoomLevel={zoomLevel}
              />
            </div>
          </div>
        ) : (
          /* Preserved offscreen in DOM for instant PDF export and @media print from other tabs */
          <div 
            className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none print:static print:opacity-100 print:pointer-events-auto"
            aria-hidden="true"
          >
            <A4ResumePreview 
              data={currentCVData}
              themeId={selectedThemeId}
              sidebarTheme={sidebarTheme}
              badgeTheme={badgeTheme}
              zoomLevel={1.0}
            />
          </div>
        )}

        {/* =========================================================
            TAB 2: EXPORT ENGINE (TAHAP 3)
            ========================================================= */}
        {activeTab === 'export' && (
          <ExportEnginePanel 
            currentCVData={currentCVData}
            selectedThemeId={selectedThemeId}
            sidebarTheme={sidebarTheme}
            onSidebarThemeChange={setSidebarTheme}
            badgeTheme={badgeTheme}
            onBadgeThemeChange={setBadgeTheme}
            standaloneHtmlCode={standaloneHtmlCode}
          />
        )}

        {/* =========================================================
            TAB 2: STANDALONE HTML5 + CSS3 CODE
            ========================================================= */}
        {activeTab === 'htmlcode' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  cv_template_a4_modular.html (HTML5 + CSS Variables + @media print)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .html</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950/90 font-mono text-xs text-slate-300 overflow-auto max-h-[640px] leading-relaxed">
              <pre>{standaloneHtmlCode}</pre>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: JSON DATA SOURCE
            ========================================================= */}
        {activeTab === 'schema' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">
                  Data JSON Ekstraksi (Guruh Wicaksono)
                </span>
              </div>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Tersalin!' : 'Salin JSON'}</span>
              </button>
            </div>
            <div className="p-4 bg-slate-950/90 font-mono text-xs text-slate-300 overflow-auto max-h-[600px] leading-relaxed">
              <pre>{JSON.stringify(currentCVData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: VALIDATOR PLAYGROUND
            ========================================================= */}
        {activeTab === 'validator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">Input Data JSON untuk Diuji</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  validationResult.isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {validationResult.isValid ? 'Skema Valid' : 'Skema Kurang/Error'}
                </span>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-[480px] bg-slate-950 text-slate-200 font-mono text-xs p-4 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
                spellCheck={false}
              />
            </div>

            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Hasil Diagnostik Integritas</span>
              </h3>
              {validationResult.errors.length > 0 ? (
                <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-300 space-y-1">
                  <div className="font-bold text-rose-400">Ditemukan {validationResult.errors.length} Error:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {validationResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-300">
                  Semua 9 modul (personal_info, core_skills, tech_stack, work_experience, digital_portfolio, education, languages, certifications, references) lengkap dan memenuhi syarat render!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3 Complete Banner Callout */}
        <section className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl no-print">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Tahap 3 Selesai: PDF & DOCX Export Engine Siap</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Ekspor Multi-Format Berpresisi Tinggi Berfungsi Penuh
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Tersedia ekspor PDF client-side (300 DPI), script server-side Puppeteer untuk pixel-perfect vector print, dan dokumen Microsoft Word (.docx) berbasis tabel 2-kolom native yang dapat langsung diedit.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('export')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Buka Panel Ekspor</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
