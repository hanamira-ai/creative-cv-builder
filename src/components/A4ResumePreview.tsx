import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  ExternalLink,
  Moon,
  Sun,
  Layers,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { CVData } from '../types';
import { CV_THEMES } from '../themes';
import { 
  partitionCvData, 
  getDensityStyles, 
  SpacingDensity, 
  LayoutPageMode,
  calculateAutoPageCount
} from '../paginationUtils';

interface A4ResumePreviewProps {
  data: CVData;
  themeId: string;
  sidebarTheme?: 'light' | 'dark';
  onSidebarThemeChange?: (newTheme: 'light' | 'dark') => void;
  badgeTheme?: 'light' | 'dark';
  onBadgeThemeChange?: (newTheme: 'light' | 'dark') => void;
  zoomLevel: number;
  layoutMode?: LayoutPageMode;
  onLayoutModeChange?: (mode: LayoutPageMode) => void;
  spacingDensity?: SpacingDensity;
  onSpacingDensityChange?: (density: SpacingDensity) => void;
}

export const A4ResumePreview: React.FC<A4ResumePreviewProps> = ({ 
  data, 
  themeId, 
  sidebarTheme = 'dark',
  onSidebarThemeChange,
  badgeTheme = 'dark',
  zoomLevel,
  layoutMode: propLayoutMode,
  onLayoutModeChange,
  spacingDensity: propSpacingDensity,
  onSpacingDensityChange
}) => {
  // Local state fallbacks if not controlled from parent
  const [localLayoutMode, setLocalLayoutMode] = useState<LayoutPageMode>('auto');
  const [localSpacingDensity, setLocalSpacingDensity] = useState<SpacingDensity>('normal');

  const activeLayoutMode = propLayoutMode ?? localLayoutMode;
  const activeSpacingDensity = propSpacingDensity ?? localSpacingDensity;

  const handleLayoutModeChange = (mode: LayoutPageMode) => {
    setLocalLayoutMode(mode);
    onLayoutModeChange?.(mode);
  };

  const handleSpacingDensityChange = (density: SpacingDensity) => {
    setLocalSpacingDensity(density);
    onSpacingDensityChange?.(density);
  };

  const currentTheme = CV_THEMES[themeId] || CV_THEMES['navy-gold'];
  const activeSidebarMode = sidebarTheme || 'dark';
  const sidebarConfig = currentTheme.sidebar?.[activeSidebarMode] || currentTheme.sidebar?.dark || {
    id: 'dark',
    name: 'Dark Deep Navy',
    bgSidebar: '#182634',
    textMain: '#FFFFFF',
    textMuted: '#CBD5E1',
    headingColor: '#FFFFFF',
    borderSubtle: 'rgba(255, 255, 255, 0.15)',
    iconColor: '#E5A93C',
    badgeBg: 'rgba(229, 169, 60, 0.22)',
    badgeColor: '#FFFFFF',
    badgeBorder: '#E5A93C',
    progressBarTrack: 'rgba(255, 255, 255, 0.22)',
    progressBarFill: 'linear-gradient(90deg, #E5A93C, #FDE68A)',
    description: 'Latar gelap pekat dengan font putih terang'
  };

  const activeBadgeMode = badgeTheme || 'dark';
  const badgeStyleConfig = currentTheme.badges?.[activeBadgeMode] || currentTheme.badges?.dark || {
    bg: '#182634',
    color: '#FFFFFF',
    border: '#C08A3E'
  };

  const getSkillPercent = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'mahir':
      case 'expert':
      case 'advanced': return 95;
      case 'menengah':
      case 'intermediate': return 75;
      case 'dasar':
      case 'beginner':
      case 'basic': return 50;
      default: return 70;
    }
  };

  const isEn = data.language === 'en';
  const labels = {
    contact: isEn ? 'Contact' : 'Kontak',
    coreSkills: isEn ? 'Core Skills' : 'Keahlian Inti',
    techStack: isEn ? 'Tech Stack' : 'Tech Stack',
    techStackCont: isEn ? 'Tech Stack (Continued)' : 'Tech Stack (Lanjutan)',
    languages: isEn ? 'Languages' : 'Bahasa',
    certifications: isEn ? 'Certifications' : 'Sertifikasi',
    continuedQual: isEn ? 'Continued Qualifications' : 'Kualifikasi Lanjutan',
    summary: isEn ? 'Professional Summary' : 'Ringkasan Profesional',
    workExp: isEn ? 'Work Experience' : 'Pengalaman Kerja',
    workExpCont: isEn ? '(Continued)' : '(Lanjutan)',
    portfolio: isEn ? 'Digital Portfolio & Projects' : 'Portofolio Digital & Proyek',
    education: isEn ? 'Education' : 'Pendidikan Formal',
    references: isEn ? 'Professional References' : 'Referensi Profesional',
    sheetOf: (p: number, t: number) => isEn ? `Sheet ${p} of ${t}` : `Lembar ${p} dari ${t}`,
    pageOf: (p: number, t: number) => isEn ? `Page ${p} of ${t}` : `Halaman ${p} dari ${t}`,
    sheetBadge: (p: number, t: number) => isEn ? `Page ${p} / ${t}` : `Lembar ${p} / ${t}`,
    pageBreak: (p: number, n: number) => isEn ? `✂ A4 Page Break (Sheet ${p} ➔ Sheet ${n})` : `✂ Batas Halaman A4 (Lembar ${p} ➔ Lembar ${n})`
  };

  // Partisi data ke dalam halaman-halaman A4
  const pages = partitionCvData(data, activeLayoutMode, activeSpacingDensity);
  const densityStyles = getDensityStyles(activeSpacingDensity);
  const autoPageCalculated = calculateAutoPageCount(data, activeSpacingDensity);

  return (
    <div 
      className="flex flex-col items-center transition-all duration-200"
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top center',
        marginBottom: `${(zoomLevel - 1) * 320}mm`
      }}
    >
      {/* =========================================================
          TOOLBAR KONTROL PREVIEW (MODE HALAMAN, SPASI, SIDEBAR)
          ========================================================= */}
      <div 
        className="no-print flex flex-wrap items-center justify-between gap-2.5 w-[210mm] max-w-full px-4 py-2.5 mb-3 rounded-xl bg-slate-900/95 border border-slate-700/80 text-[8pt] text-slate-300 shadow-xl backdrop-blur-md"
      >
        {/* Kontrol Mode Pembagian Halaman */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Halaman:</span>
          </div>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => handleLayoutModeChange('auto')}
              className={`px-2 py-1 rounded text-[7.5pt] font-semibold cursor-pointer transition-all ${
                activeLayoutMode === 'auto'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Deteksi otomatis: 1 atau 2 lembar berdasarkan panjang konten"
            >
              Auto ({autoPageCalculated} Hal)
            </button>
            <button
              type="button"
              onClick={() => handleLayoutModeChange('1-page')}
              className={`px-2 py-1 rounded text-[7.5pt] font-semibold cursor-pointer transition-all ${
                activeLayoutMode === '1-page'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Paksa muat semua konten dalam 1 lembar A4 kompak"
            >
              1 Halaman
            </button>
            <button
              type="button"
              onClick={() => handleLayoutModeChange('2-page')}
              className={`px-2 py-1 rounded text-[7.5pt] font-semibold cursor-pointer transition-all ${
                activeLayoutMode === '2-page'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bagi rapi ke 2 lembar A4 tanpa potongan elemen"
            >
              2 Halaman
            </button>
          </div>
        </div>

        {/* Kontrol Kepadatan Spasi (Inteligen Spacing) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Spasi:</span>
          </div>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => handleSpacingDensityChange('compact')}
              className={`px-2 py-1 rounded text-[7.5pt] font-semibold cursor-pointer transition-all ${
                activeSpacingDensity === 'compact'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Spasi rapat / padat untuk menghemat ruang"
            >
              Rapat
            </button>
            <button
              type="button"
              onClick={() => handleSpacingDensityChange('normal')}
              className={`px-2 py-1 rounded text-[7.5pt] font-semibold cursor-pointer transition-all ${
                activeSpacingDensity === 'normal'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Spasi normal proporsional A4"
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => handleSpacingDensityChange('spacious')}
              className={`px-2 py-1 rounded text-[7.5pt] font-semibold cursor-pointer transition-all ${
                activeSpacingDensity === 'spacious'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Spasi leluasa dan elegan"
            >
              Lega
            </button>
          </div>
        </div>

        {/* Quick Sidebar Theme Selector */}
        {onSidebarThemeChange && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSidebarThemeChange(activeSidebarMode === 'dark' ? 'light' : 'dark')}
              className="px-2.5 py-1 rounded-lg text-[7.5pt] font-semibold border border-slate-600 bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-all flex items-center gap-1.5"
              title={`Klik untuk mengganti tema sidebar ke ${activeSidebarMode === 'dark' ? 'Light Theme (Font Gelap)' : 'Dark Theme (Font Putih)'}`}
            >
              {activeSidebarMode === 'dark' ? (
                <Moon className="w-3 h-3 text-amber-300 shrink-0" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <span>Sidebar: <strong className="uppercase text-amber-400">{activeSidebarMode}</strong></span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================
          TARGET EKSPOR & PREVIEW DISKRIT PER LEMBAR A4
          id="cv-paper-target" sebagai container utama
          ========================================================= */}
      <div 
        id="cv-paper-target"
        className="cv-pages-wrapper flex flex-col items-center w-[210mm] max-w-full"
      >
        {pages.map((page, pIdx) => {
          const isFirstPage = page.pageNumber === 1;
          const isLastPage = page.pageNumber === page.totalPages;

          return (
            <React.Fragment key={pIdx}>
              {/* Header Info Lembar di Preview (no-print) */}
              {pages.length > 1 && (
                <div className="no-print w-[210mm] max-w-full flex items-center justify-between px-3 py-1 mb-1.5 text-[7.5pt] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-slate-300 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Lembar {page.pageNumber} dari {page.totalPages}
                  </span>
                  <span className="text-slate-400">
                    {isFirstPage ? 'Profil, Keahlian & Riwayat Kerja' : 'Portofolio, Pendidikan & Referensi'}
                  </span>
                </div>
              )}

              {/* Exact A4 Sheet per page */}
              <div 
                id={`cv-page-${page.pageNumber}`}
                data-cv-page={page.pageNumber}
                className={`cv-paper cv-page-sheet cv-layout cv-container text-slate-800 shadow-2xl relative font-sans leading-relaxed selection:bg-amber-400 selection:text-slate-900 mb-2 ${currentTheme.cssClass} badge-theme-${activeBadgeMode} sidebar-theme-${activeSidebarMode}`}
                style={{
                  '--primary-navy': currentTheme.vars.primary || '#182634',
                  '--accent-gold': currentTheme.vars.accent || '#C08A3E',
                  '--text-dark': currentTheme.vars.textDark || '#2c3e50',
                  '--bg-sidebar': sidebarConfig.bgSidebar,
                  '--primary-color': currentTheme.vars.primary,
                  '--accent-color': currentTheme.vars.accent,
                  '--text-light': currentTheme.vars.textLight,
                  '--border-muted': currentTheme.vars.borderMuted,
                  '--badge-bg': badgeStyleConfig.bg,
                  '--badge-color': badgeStyleConfig.color,
                  '--badge-border': badgeStyleConfig.border,
                  width: '210mm',
                  minWidth: '210mm',
                  maxWidth: '210mm',
                  height: '297mm',
                  minHeight: '297mm',
                  maxHeight: '297mm',
                  boxSizing: 'border-box',
                  padding: densityStyles.paperPadding,
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '32% 68%'
                } as React.CSSProperties}
              >
                {/* =========================================================
                    SIDEBAR KIRI (32%)
                    ========================================================= */}
                <aside 
                  className={`sidebar flex flex-col ${densityStyles.sidebarGap} transition-colors duration-200 min-h-full h-full self-stretch ${
                    activeSidebarMode === 'dark' ? 'sidebar-dark' : 'sidebar-light'
                  }`}
                  style={{ 
                    backgroundColor: sidebarConfig.bgSidebar,
                    color: sidebarConfig.textMain,
                    minHeight: '100%',
                    height: '100%',
                    alignSelf: 'stretch'
                  }}
                >
                  {/* Foto Profil Utama (Halaman 1) */}
                  {page.sidebar.showPhoto && (
                    <div className="flex justify-center mb-0.5">
                      {data.personal_info.profile_picture_placeholder ? (
                        <img 
                          src={data.personal_info.profile_picture_placeholder} 
                          alt={data.personal_info.name} 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className={`profile-photo ${densityStyles.avatarSize} object-cover rounded-full border-2 border-white shadow-md aspect-square shrink-0`}
                          style={{
                            borderRadius: '9999px',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div 
                          className={`profile-photo-avatar ${densityStyles.avatarSize} rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-white shadow-md aspect-square shrink-0`}
                          style={{ 
                            backgroundColor: currentTheme.vars.primary,
                            borderRadius: '9999px'
                          }}
                        >
                          {data.personal_info.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mini Profile Card untuk Kontinuitas Lembar 2 */}
                  {page.sidebar.showMiniHeader && (
                    <div 
                      className="mini-profile-card flex items-center gap-2 pb-2 border-b"
                      style={{ borderColor: sidebarConfig.borderSubtle }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: currentTheme.vars.accent }}
                      >
                        {data.personal_info.name.charAt(0)}
                      </div>
                      <div className="leading-tight overflow-hidden">
                        <div className="font-bold text-[8.5pt] truncate" style={{ color: sidebarConfig.textMain }}>
                          {data.personal_info.name}
                        </div>
                        <div className="text-[7pt] truncate" style={{ color: currentTheme.vars.accent }}>
                          {labels.continuedQual}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kontak Section */}
                  {page.sidebar.showContact && (
                    <div className={`section-block ${densityStyles.itemSpacing}`}>
                      <h3 
                        className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}
                        style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
                        {labels.contact}
                      </h3>
                      <div className={`space-y-1 ${densityStyles.bodyTextSize}`} style={{ color: sidebarConfig.textMain }}>
                        {data.personal_info.contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: sidebarConfig.iconColor }} />
                            <span className="truncate">{data.personal_info.contact.phone}</span>
                          </div>
                        )}
                        {data.personal_info.contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: sidebarConfig.iconColor }} />
                            <span className="truncate">{data.personal_info.contact.email}</span>
                          </div>
                        )}
                        {data.personal_info.contact.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: sidebarConfig.iconColor }} />
                            <span className="leading-tight">{data.personal_info.contact.address}</span>
                          </div>
                        )}
                        {data.personal_info.contact.linkedin && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: sidebarConfig.iconColor }} />
                            <span className="truncate font-mono text-[7.2pt]">
                              {data.personal_info.contact.linkedin.replace('https://', '')}
                            </span>
                          </div>
                        )}
                        {data.personal_info.contact.github && (
                          <div className="flex items-center gap-2">
                            <Github className="w-3.5 h-3.5 shrink-0" style={{ color: sidebarConfig.iconColor }} />
                            <span className="truncate font-mono text-[7.2pt]">
                              {data.personal_info.contact.github.replace('https://', '')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Core Skills (Skill Bar & Badges) */}
                  {page.sidebar.coreSkills && page.sidebar.coreSkills.length > 0 && (
                    <div className={`section-block ${densityStyles.itemSpacing}`}>
                      <h3 
                        className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}
                        style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
                        {labels.coreSkills}
                      </h3>
                      <div className="space-y-1.5">
                        {page.sidebar.coreSkills.map((skill, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex justify-between items-start text-[7.5pt] font-medium gap-1" style={{ color: sidebarConfig.textMain }}>
                              <span className="leading-tight font-semibold break-words flex-1">{skill.skill_name}</span>
                              <span 
                                className="uppercase font-bold text-[6.5pt] tracking-wider shrink-0 mt-0.5"
                                style={{ color: currentTheme.vars.accent }}
                              >
                                {skill.proficiency_level}
                              </span>
                            </div>
                            <div 
                              className="w-full h-1.5 rounded-full overflow-hidden"
                              style={{ backgroundColor: sidebarConfig.progressBarTrack }}
                            >
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${getSkillPercent(skill.proficiency_level)}%`,
                                  background: sidebarConfig.progressBarFill 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {page.sidebar.techStack && page.sidebar.techStack.length > 0 && (
                    <div className={`section-block ${densityStyles.itemSpacing}`}>
                      <h3 
                        className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}
                        style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
                        {page.pageNumber > 1 ? labels.techStackCont : labels.techStack}
                      </h3>
                      <div className="space-y-1.5">
                        {page.sidebar.techStack.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="text-[7.6pt] pb-1 border-b last:border-0 last:pb-0"
                            style={{ borderColor: sidebarConfig.borderSubtle }}
                          >
                            <div 
                              className="flex justify-between items-start font-bold gap-1" 
                              style={{ color: activeSidebarMode === 'dark' ? currentTheme.vars.accent : currentTheme.vars.primary }}
                            >
                              <span className="leading-tight break-words flex-1">{item.category}</span>
                              {item.level && (
                                <span 
                                  className="uppercase font-bold text-[6.5pt] tracking-wider shrink-0"
                                  style={{ color: currentTheme.vars.accent }}
                                >
                                  {item.level}
                                </span>
                              )}
                            </div>
                            <div className="font-semibold mt-0.5 text-[7.5pt]" style={{ color: sidebarConfig.textMain }}>
                              {item.tool}
                            </div>
                            {item.description && (
                              <div className="text-[7pt] leading-snug mt-0.5 line-clamp-2" style={{ color: sidebarConfig.textMuted }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bahasa */}
                  {page.sidebar.languages && page.sidebar.languages.length > 0 && (
                    <div className={`section-block ${densityStyles.itemSpacing}`}>
                      <h3 
                        className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}
                        style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
                        {labels.languages}
                      </h3>
                      <div className="space-y-1">
                        {page.sidebar.languages.map((lang, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[7.6pt]">
                            <span className="font-semibold" style={{ color: sidebarConfig.textMain }}>{lang.language}</span>
                            <span className="text-[7pt]" style={{ color: sidebarConfig.textMuted }}>{lang.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sertifikasi */}
                  {page.sidebar.certifications && page.sidebar.certifications.length > 0 && (
                    <div className={`section-block ${densityStyles.itemSpacing}`}>
                      <h3 
                        className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}
                        style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
                        {labels.certifications}
                      </h3>
                      <div className="space-y-1.5">
                        {page.sidebar.certifications.map((cert, idx) => (
                          <div key={idx} className="text-[7.4pt]">
                            <div className="font-bold leading-tight" style={{ color: sidebarConfig.textMain }}>
                              {cert.name}
                            </div>
                            <div className="text-[6.8pt] leading-tight mt-0.5" style={{ color: sidebarConfig.textMuted }}>
                              {cert.detail} {cert.year && <span className="font-bold" style={{ color: currentTheme.vars.accent }}>| {cert.year}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>

                {/* =========================================================
                    KONTEN UTAMA KANAN (68%)
                    ========================================================= */}
                <main className={`content main-content flex flex-col ${densityStyles.mainGap} bg-white h-full`}>
                  {/* Header Nama & Title (Halaman 1) */}
                  {page.main.showHeader && (
                    <div className="section-block pb-0.5 mb-0.5">
                      <h1 
                        className={`${densityStyles.titleSize} font-extrabold tracking-tight leading-none`}
                        style={{ color: 'var(--primary-navy, #182634)' }}
                      >
                        {data.personal_info.name}
                      </h1>
                      <h2 
                        className={`${densityStyles.subtitleSize} font-semibold tracking-wide mt-1.5 border-b-0 pb-0 mb-0`}
                        style={{ color: 'var(--accent-gold, #C08A3E)' }}
                      >
                        {data.personal_info.title}
                      </h2>
                    </div>
                  )}

                  {/* Continuation Header (Halaman 2+) */}
                  {page.main.showContinuationHeader && (
                    <div 
                      className="continuation-header pb-1.5 mb-1 flex items-center justify-between border-b whitespace-nowrap overflow-hidden gap-2"
                      style={{ borderColor: currentTheme.vars.borderMuted }}
                    >
                      <div className="flex items-baseline gap-1.5 min-w-0 overflow-hidden whitespace-nowrap">
                        <span className="text-[9.5pt] font-extrabold tracking-tight shrink-0" style={{ color: currentTheme.vars.primary }}>
                          {data.personal_info.name}
                        </span>
                        <span className="text-[6.8pt] font-semibold text-slate-500 truncate">
                          | {data.personal_info.title}
                        </span>
                      </div>
                      <span 
                        className="text-[6.2pt] uppercase tracking-wider font-bold font-mono px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap"
                        style={{ backgroundColor: `${currentTheme.vars.accent}20`, color: currentTheme.vars.accent }}
                      >
                        {labels.sheetBadge(page.pageNumber, page.totalPages)}
                      </span>
                    </div>
                  )}

                  {/* Summary */}
                  {page.main.showSummary && data.personal_info.summary && (
                    <section className={`section-block ${densityStyles.itemSpacing}`}>
                      <h3 className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
                        {labels.summary}
                      </h3>
                      <p className={`${densityStyles.bodyTextSize} text-slate-700 leading-relaxed text-justify`}>
                        {data.personal_info.summary}
                      </p>
                    </section>
                  )}

                  {/* Pengalaman Kerja */}
                  {page.main.workExperience && page.main.workExperience.length > 0 && (
                    <section className={`section-block ${densityStyles.itemSpacing}`}>
                      <h3 className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
                        {labels.workExp} {page.main.workExperienceIsContinuation ? labels.workExpCont : ''}
                      </h3>
                      
                      {/* Timeline container */}
                      <div className="experience-timeline relative space-y-2.5">
                        {page.main.workExperience.map((exp, idx) => (
                          <div key={idx} className="timeline-item relative break-inside-avoid">
                            {/* Node bullet */}
                            <div className="experience-node-dot"></div>
                            
                            <div className="flex justify-between items-baseline gap-2">
                              <h4 className="text-[8.8pt] font-bold" style={{ color: 'var(--primary-navy, #182634)' }}>
                                {exp.position}
                              </h4>
                              <span className="text-[7.2pt] font-semibold whitespace-nowrap" style={{ color: 'var(--accent-gold, #C08A3E)' }}>
                                {exp.period}
                              </span>
                            </div>

                            <div className="text-[7.8pt] font-semibold text-slate-600 mb-0.5">
                              {exp.company}
                            </div>

                            {/* Highlights without bullet points */}
                            <ul className="experience-highlights space-y-0.5 text-[7.8pt] text-slate-700">
                              {exp.highlights.map((h, hIdx) => (
                                <li key={hIdx} className="leading-snug">
                                  {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Portofolio Digital */}
                  {page.main.digitalPortfolio && page.main.digitalPortfolio.length > 0 && (
                    <section className={`section-block ${densityStyles.itemSpacing} break-inside-avoid`}>
                      <h3 className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
                        {labels.portfolio}
                      </h3>
                      <div className="space-y-1.5">
                        {page.main.digitalPortfolio.map((port, idx) => (
                          <div 
                            key={idx} 
                            className={`portfolio-card ${densityStyles.cardPadding} rounded-lg border text-[7.8pt] space-y-1 break-inside-avoid`}
                            style={{ 
                              backgroundColor: `${currentTheme.vars.bgSidebar}60`,
                              borderColor: currentTheme.vars.borderMuted,
                              borderLeftWidth: '3px',
                              borderLeftColor: currentTheme.vars.accent
                            }}
                          >
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold" style={{ color: currentTheme.vars.primary }}>{port.project_name}</span>
                            </div>
                            <p className="text-slate-600 text-[7.2pt] leading-snug">{port.description}</p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {port.tech_used.map((t, tIdx) => (
                                <span 
                                  key={tIdx} 
                                  className="skill-badge text-[6.5pt] px-1.5 py-0.2 font-semibold border rounded transition-colors"
                                  style={{
                                    backgroundColor: badgeStyleConfig.bg,
                                    color: badgeStyleConfig.color,
                                    borderColor: badgeStyleConfig.border
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Pendidikan */}
                  {page.main.education && page.main.education.length > 0 && (
                    <section className={`section-block ${densityStyles.itemSpacing} break-inside-avoid`}>
                      <h3 className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
                        {labels.education}
                      </h3>
                      <div className="space-y-1">
                        {page.main.education.map((edu, idx) => (
                          <div key={idx} className="education-item text-[7.8pt]">
                            <div className="flex justify-between items-baseline font-bold" style={{ color: currentTheme.vars.primary }}>
                              <span>{edu.degree}</span>
                              <span className="text-[7.2pt] font-semibold" style={{ color: currentTheme.vars.accent }}>{edu.year}</span>
                            </div>
                            <div className="font-semibold text-slate-600 text-[7.5pt]">{edu.institution}</div>
                            {edu.details && (
                              <div className="text-[7pt] text-slate-500 leading-snug mt-0.5">{edu.details}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Referensi Profesional */}
                  {page.main.references && page.main.references.length > 0 && (
                    <section className={`section-block ${densityStyles.itemSpacing} break-inside-avoid`}>
                      <h3 className={`section-header ${densityStyles.headingTextSize} font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
                        {labels.references}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {page.main.references.map((ref, idx) => (
                          <div key={idx} className="reference-item p-1.5 rounded border border-slate-200 bg-slate-50/50 text-[7.2pt]">
                            <div className="font-bold" style={{ color: currentTheme.vars.primary }}>{ref.name}</div>
                            <div className="text-slate-600 text-[6.8pt] leading-tight">{ref.title}</div>
                            <div className="font-mono text-[6.5pt] mt-0.5" style={{ color: currentTheme.vars.accent }}>{ref.contact_info}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Footer Halaman A4 Presisi */}
                  <footer className="page-footer mt-auto pt-1.5 border-t border-slate-100 flex justify-between items-center text-[7pt] text-slate-400 font-mono">
                    <span className="truncate">{data.personal_info.name} — Curriculum Vitae</span>
                    <span className="shrink-0 font-semibold" style={{ color: currentTheme.vars.accent }}>
                      {labels.pageOf(page.pageNumber, page.totalPages)}
                    </span>
                  </footer>
                </main>
              </div>

              {/* Pemisah Batas Halaman Visual Antar Halaman A4 di Preview (no-print) */}
              {!isLastPage && (
                <div className="no-print my-5 flex items-center justify-center gap-3 w-[210mm] max-w-full text-xs text-slate-400 font-mono">
                  <div className="h-px bg-slate-700/80 flex-1"></div>
                  <div className="px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-amber-300 font-bold flex items-center gap-2 shadow-sm backdrop-blur-xs">
                    <span>{labels.pageBreak(page.pageNumber, page.pageNumber + 1)}</span>
                  </div>
                  <div className="h-px bg-slate-700/80 flex-1"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
