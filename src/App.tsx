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
  RotateCcw,
  Globe
} from 'lucide-react';
import { sampleNeutralCV } from './sampleData';
import { validateCVJson, normalizeWebsiteUrl } from './validator';
import { CVData, ContactInfo } from './types';
import { CV_THEMES } from './themes';
import { A4ResumePreview } from './components/A4ResumePreview';
import { generateStandaloneCVHtml } from './templateHtmlGenerator';
import { ExportEnginePanel, SHOW_HTML_EXPORT } from './components/ExportEnginePanel';
import { openInNewTabAndPrint } from './exportPdf';
import { generateAndDownloadDocx, generateDocxBlob, generateWordHtmlBlob } from './exportDocx';
import { ProfilePhotoUploader } from './components/ProfilePhotoUploader';
import { DocumentParserPanel } from './components/DocumentParserPanel';
import { DocumentUploadCard } from './components/DocumentUploadCard';
import { ContactEditorCard } from './components/ContactEditorCard';
import { LayoutPageMode, SpacingDensity } from './paginationUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'parser' | 'export' | 'htmlcode' | 'schema' | 'validator'>('preview');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('navy-gold');
  const [sidebarTheme, setSidebarTheme] = useState<'light' | 'dark'>('dark');
  const [badgeTheme, setBadgeTheme] = useState<'light' | 'dark'>('dark');
  const [layoutMode, setLayoutMode] = useState<LayoutPageMode>('auto');
  const [spacingDensity, setSpacingDensity] = useState<SpacingDensity>('normal');
  const [zoomLevel, setZoomLevel] = useState<number>(0.92);
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(sampleNeutralCV, null, 2));
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [isQuickExportingPdf, setIsQuickExportingPdf] = useState<boolean>(false);
  const [isQuickExportingDocx, setIsQuickExportingDocx] = useState<boolean>(false);
  const [isLoadingGuruhSample, setIsLoadingGuruhSample] = useState<boolean>(false);
  const [lastGeneratedTimestamp, setLastGeneratedTimestamp] = useState<string | null>(null);
  const [showGeneratedSuccessAlert, setShowGeneratedSuccessAlert] = useState<boolean>(false);
  const [contactSyncRevision, setContactSyncRevision] = useState<number>(0);

  const currentTheme = CV_THEMES[selectedThemeId] || CV_THEMES['navy-gold'];

  // Derived current CV data and validation
  const { currentCVData, validationResult } = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      const res = validateCVJson(parsed);
      const hasStructuralContact = Boolean(
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        parsed.personal_info &&
        typeof parsed.personal_info === 'object' &&
        parsed.personal_info.contact &&
        typeof parsed.personal_info.contact === 'object'
      );
      return {
        currentCVData: (res.isValid || hasStructuralContact) ? (parsed as CVData) : sampleNeutralCV,
        validationResult: res
      };
    } catch {
      return {
        currentCVData: sampleNeutralCV,
        validationResult: { isValid: false, errors: ['Format JSON tidak valid.'], warnings: [] }
      };
    }
  }, [jsonInput]);

  // Generated Standalone HTML5 + CSS3 Code string
  const standaloneHtmlCode = useMemo(() => {
    return generateStandaloneCVHtml(currentCVData, selectedThemeId, sidebarTheme, badgeTheme);
  }, [currentCVData, selectedThemeId, sidebarTheme, badgeTheme]);

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleQuickDownloadPdf = async () => {
    try {
      setIsQuickExportingPdf(true);
      setExportNotice(null);
      console.log('[App] handleQuickDownloadPdf dipanggil -> membuka tab baru untuk cetak PDF');
      if (activeTab !== 'preview') {
        setActiveTab('preview');
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const fullName = (currentCVData.personal_info as any).full_name || currentCVData.personal_info.name || 'Candidate';
      const cleanName = fullName.trim().replace(/\s+/g, '_');
      await openInNewTabAndPrint('cv-paper-target', {
        filename: `CV_${cleanName}.pdf`,
      });
    } catch (e: any) {
      console.error('[App] Gagal mengunduh PDF:', e);
      setExportNotice(e?.message || 'Gagal menyiapkan dokumen cetak PDF.');
    } finally {
      setIsQuickExportingPdf(false);
    }
  };

  const handleExportPDF = handleQuickDownloadPdf;

  const handleQuickDownloadDocx = async () => {
    try {
      setIsQuickExportingDocx(true);
      await generateAndDownloadDocx(
        currentCVData,
        selectedThemeId,
        sidebarTheme === 'light' ? 'light' : 'dark',
        badgeTheme === 'light' ? 'light' : 'dark'
      );
    } catch (e) {
      console.error('Gagal mengunduh file DOCX:', e);
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

  const handleContactChange = (updatedContact: ContactInfo) => {
    try {
      const parsed = JSON.parse(jsonInput);
      parsed.personal_info = {
        ...parsed.personal_info,
        contact: updatedContact,
      };
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch {
      const updated = {
        ...currentCVData,
        personal_info: {
          ...currentCVData.personal_info,
          contact: updatedContact,
        },
      };
      setJsonInput(JSON.stringify(updated, null, 2));
    }
  };

  const handleCVGenerated = (generatedData: CVData) => {
    // Pertahankan foto profil kustom yang sudah diunggah jika CV hasil generate belum memilikinya
    const currentPhoto = currentCVData.personal_info.profile_picture_placeholder;
    const websiteCheck = normalizeWebsiteUrl(generatedData.personal_info?.contact?.website);
    const sanitizedWebsite = websiteCheck.isValid ? websiteCheck.normalizedUrl : '';

    const finalData: CVData = {
      ...generatedData,
      personal_info: {
        ...generatedData.personal_info,
        profile_picture_placeholder: generatedData.personal_info.profile_picture_placeholder || currentPhoto || '',
        contact: {
          ...(generatedData.personal_info?.contact || {
            phone: '',
            email: '',
            address: '',
            linkedin: '',
            github: ''
          }),
          website: sanitizedWebsite
        }
      }
    };
    setJsonInput(JSON.stringify(finalData, null, 2));
    setContactSyncRevision((prev) => prev + 1);
    setLastGeneratedTimestamp(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setShowGeneratedSuccessAlert(true);
    setActiveTab('preview');
  };

  const handleResetToSample = () => {
    setJsonInput(JSON.stringify(sampleNeutralCV, null, 2));
    setContactSyncRevision((prev) => prev + 1);
    setShowGeneratedSuccessAlert(false);
  };

  const handleLoadGuruhSample = async () => {
    try {
      setIsLoadingGuruhSample(true);
      const { sampleGuruhWicaksonoCV } = await import('./sampleDataGuruh');
      setJsonInput(JSON.stringify(sampleGuruhWicaksonoCV, null, 2));
      setContactSyncRevision((prev) => prev + 1);
      setShowGeneratedSuccessAlert(false);
    } finally {
      setIsLoadingGuruhSample(false);
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
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">creative-cv-builder</h1>
                <span className="hidden">
                  Tahap 3: PDF & DOCX Export Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Template Engine HTML5/CSS3 Responsive A4 & Multi-Format Exporter</p>
            </div>
          </div>

          {/* Quick Actions (Print & Instant Export) */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Quick Trigger: Import Dokumen & Generate CV (Hidden for clean UI) */}
            <button
              id="btn-nav-generate-cv"
              onClick={() => {
                const el = document.getElementById('document-upload-section');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="hidden"
              title="Unggah berkas PDF, DOCX, atau Teks untuk di-generate otomatis dengan Gemini AI"
            >
              <Wand2 className="w-4 h-4 text-slate-950" />
              <span>Import & Generate CV</span>
            </button>

            {/* Unified PDF Button */}
            <button
              id="btn-download-pdf"
              onClick={handleExportPDF}
              disabled={isQuickExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
              title="Cetak atau Unduh PDF A4 (Membuka tab baru untuk dialog cetak browser / Save as PDF)"
            >
              {isQuickExportingPdf ? (
                <Cpu className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 text-slate-950" />
              )}
              <span>{isQuickExportingPdf ? 'Membuka Tab...' : 'Cetak / Unduh PDF'}</span>
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

            {SHOW_HTML_EXPORT && (
              <button
                onClick={handleDownloadHtml}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer"
                title="Unduh file HTML standalone tunggal"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span className="hidden xl:inline">HTML</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Control Toolbar & Theme Switcher */}
      <section id="control-toolbar" className="bg-slate-900 border-b border-slate-800 py-3 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          
          {/* Main Tabs (Hidden for cleaner user experience) */}
          <div className="hidden">
            <button
              id="tab-btn-preview"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Live Preview A4</span>
            </button>

            <button
              id="tab-btn-parser"
              onClick={() => {
                if (activeTab !== 'preview') {
                  setActiveTab('preview');
                }
                setTimeout(() => {
                  const el = document.getElementById('document-upload-section');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Akses kolom unggah dokumen & generator CV di halaman utama"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Unggah Dokumen (Halaman 1)</span>
            </button>

            <button
              id="tab-btn-export"
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ekspor Engine (Tahap 3)</span>
            </button>

            {SHOW_HTML_EXPORT && (
              <button
                id="tab-btn-htmlcode"
                onClick={() => setActiveTab('htmlcode')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'htmlcode'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Kode HTML5/CSS3</span>
              </button>
            )}

            <button
              id="tab-btn-schema"
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON Data</span>
            </button>

            <button
              id="tab-btn-validator"
              onClick={() => setActiveTab('validator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'validator'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Validator</span>
            </button>
          </div>

          {/* Theme Selector (7 Theme Options) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Pilihan Tema:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {Object.values(CV_THEMES).map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    title={theme.name}
                    aria-label={theme.name}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span className="inline-flex items-center gap-0.5 shrink-0" aria-hidden="true">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/25"
                        style={{ backgroundColor: theme.vars.primary }}
                      ></span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/25"
                        style={{ backgroundColor: theme.vars.accent }}
                      ></span>
                    </span>
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

          {/* CV Language Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              Bahasa CV:
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonInput);
                    parsed.language = 'id';
                    setJsonInput(JSON.stringify(parsed, null, 2));
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  (currentCVData.language || 'id') === 'id'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Sajikan CV dalam Bahasa Indonesia"
              >
                <span>🇮🇩</span>
                <span>Indonesia</span>
              </button>
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonInput);
                    parsed.language = 'en';
                    setJsonInput(JSON.stringify(parsed, null, 2));
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentCVData.language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Sajikan CV dalam English"
              >
                <span>🇬🇧</span>
                <span>English</span>
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

        {/* Notice Banner jika ada kendala saat ekspor/print */}
        {exportNotice && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-rose-300 shadow-lg no-print">
            <div className="flex items-center gap-2">
              <strong className="text-white">Info Ekspor:</strong>
              <span>{exportNotice}</span>
            </div>
            <button
              onClick={() => setExportNotice(null)}
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================
            TAB 1: LIVE PREVIEW A4 CANVAS (Selalu di-mount agar #cv-paper-target ada di DOM)
            ========================================================= */}
        <div className={activeTab === 'preview' ? 'flex flex-col gap-6' : 'hidden print:block'}>
          {/* Success Alert if CV was just generated */}
          {showGeneratedSuccessAlert && activeTab === 'preview' && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300 shadow-lg no-print">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm font-bold">CV Berhasil Di-generate dari Dokumen!</strong>
                    {lastGeneratedTimestamp && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                        {lastGeneratedTimestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    Data kandidat <strong>{currentCVData.personal_info.name}</strong> ({currentCVData.personal_info.title}) telah terisi ke template A4 & Live Preview diperbarui secara instan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('schema')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Lihat JSON
                </button>
                <button
                  onClick={handleResetToSample}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                  title="Kembalikan ke data contoh netral"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Contoh</span>
                </button>
                <button
                  onClick={() => setShowGeneratedSuccessAlert(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Tutup notifikasi"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

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
              <span className="hidden 2xl:inline">•</span>
              <span className="hidden 2xl:inline">
                Tata Letak: <strong className="text-amber-400 capitalize">{layoutMode} ({spacingDensity})</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleLoadGuruhSample}
                disabled={isLoadingGuruhSample}
                className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition-all disabled:opacity-60"
                title="Muat data contoh CV Guruh Wicaksono"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isLoadingGuruhSample ? 'Memuat...' : 'Muat contoh Guruh'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToSample}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 transition-all"
                title="Kembalikan ke data contoh netral"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Contoh Netral</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('document-upload-section');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all shadow-sm"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Unggah Dokumen Baru</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer px-2.5 py-1.5"
              >
                <span>Opsi Ekspor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Profile Photo Uploader */}
          <div className="no-print">
            <ProfilePhotoUploader
              currentPhotoUrl={currentCVData.personal_info.profile_picture_placeholder}
              candidateName={currentCVData.personal_info.name}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoRemoved={handlePhotoRemoved}
            />
          </div>

          {/* Contact & Links Live Editor */}
          <div className="no-print">
            <ContactEditorCard
              contact={currentCVData.personal_info.contact}
              onChangeContact={handleContactChange}
              syncRevision={contactSyncRevision}
            />
          </div>

          {/* Document Upload & AI Generation (Halaman Pertama) */}
          <div className="no-print">
            <DocumentUploadCard
              onCVGenerated={handleCVGenerated}
              candidateName={currentCVData.personal_info.name}
              initialLanguage={currentCVData.language || 'id'}
            />
          </div>

          {/* A4 Sheet Container */}
          <div className="overflow-x-auto py-4 px-2 flex justify-center bg-slate-900/50 rounded-2xl border border-slate-800/80 print:p-0 print:m-0 print:border-none print:bg-transparent print:overflow-visible">
            <A4ResumePreview 
              data={currentCVData}
              themeId={selectedThemeId}
              sidebarTheme={sidebarTheme}
              onSidebarThemeChange={setSidebarTheme}
              badgeTheme={badgeTheme}
              onBadgeThemeChange={setBadgeTheme}
              zoomLevel={zoomLevel}
              layoutMode={layoutMode}
              onLayoutModeChange={setLayoutMode}
              spacingDensity={spacingDensity}
              onSpacingDensityChange={setSpacingDensity}
            />
          </div>
        </div>

        {/* =========================================================
            TAB: DOCUMENT PARSER & GENERATE CV (GEMINI AI)
            ========================================================= */}
        {activeTab === 'parser' && (
          <div className="no-print">
            <DocumentParserPanel 
              onCVGenerated={handleCVGenerated}
              onClose={() => setActiveTab('preview')}
            />
          </div>
        )}

        {/* =========================================================
            TAB 2: EXPORT ENGINE (TAHAP 3)
            ========================================================= */}
        {activeTab === 'export' && (
          <div className="no-print">
            <ExportEnginePanel 
              currentCVData={currentCVData}
              selectedThemeId={selectedThemeId}
              sidebarTheme={sidebarTheme}
              onSidebarThemeChange={setSidebarTheme}
              badgeTheme={badgeTheme}
              onBadgeThemeChange={setBadgeTheme}
              standaloneHtmlCode={standaloneHtmlCode}
              onDownloadPdf={handleQuickDownloadPdf}
            />
          </div>
        )}

        {/* =========================================================
            TAB 2: STANDALONE HTML5 + CSS3 CODE
            ========================================================= */}
        {activeTab === 'htmlcode' && (
          <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
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
          <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">
                  Data JSON CV ({currentCVData.personal_info?.name || 'Kandidat'})
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
          <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6">
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

        {/* Phase 3 Complete Banner Callout (Hidden for clean UI) */}
        <section className="hidden">
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
