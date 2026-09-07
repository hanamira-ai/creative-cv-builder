import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Globe, 
  ExternalLink,
  Users,
  Moon,
  Sun
} from 'lucide-react';
import { CVData } from '../types';
import { CV_THEMES } from '../themes';

interface A4ResumePreviewProps {
  data: CVData;
  themeId: string;
  sidebarTheme?: 'light' | 'dark';
  onSidebarThemeChange?: (newTheme: 'light' | 'dark') => void;
  badgeTheme?: 'light' | 'dark';
  onBadgeThemeChange?: (newTheme: 'light' | 'dark') => void;
  zoomLevel: number;
}

export const A4ResumePreview: React.FC<A4ResumePreviewProps> = ({ 
  data, 
  themeId, 
  sidebarTheme = 'dark',
  onSidebarThemeChange,
  badgeTheme = 'dark',
  onBadgeThemeChange,
  zoomLevel 
}) => {
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
    switch (level) {
      case 'Mahir': return 95;
      case 'Menengah': return 75;
      case 'Dasar': return 50;
      default: return 70;
    }
  };

  return (
    <div 
      className="flex justify-center transition-all duration-200"
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top center',
        marginBottom: `${(zoomLevel - 1) * 320}mm`
      }}
    >
      {/* Exact A4 Sheet: 210mm width x min-height 297mm */}
      <div 
        id="printable-cv-sheet"
        className={`cv-layout cv-container text-slate-800 shadow-2xl relative font-sans leading-relaxed selection:bg-amber-400 selection:text-slate-900 ${currentTheme.cssClass} badge-theme-${activeBadgeMode} sidebar-theme-${activeSidebarMode}`}
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
        } as React.CSSProperties}
      >
        {/* =========================================================
            SIDEBAR KIRI (32% DENGAN LATAR & PADDING 12PX)
            ========================================================= */}
        <aside 
          id="cv-sidebar-aside"
          className={`sidebar flex flex-col gap-3.5 transition-colors duration-200 ${
            activeSidebarMode === 'dark' ? 'sidebar-dark' : 'sidebar-light'
          }`}
          style={{ 
            backgroundColor: sidebarConfig.bgSidebar,
            color: sidebarConfig.textMain,
          }}
        >
          {/* Quick Sidebar Theme Selector (No Print) */}
          {onSidebarThemeChange && (
            <div 
              className="no-print flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[7.5pt] transition-all shadow-2xs -mb-1"
              style={{
                backgroundColor: activeSidebarMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                borderColor: sidebarConfig.borderSubtle
              }}
            >
              <div className="flex items-center gap-1.5 font-medium" style={{ color: sidebarConfig.textMain }}>
                {activeSidebarMode === 'dark' ? (
                  <Moon className="w-3 h-3 text-amber-300 shrink-0" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                )}
                <span>Sidebar: <strong className="uppercase">{activeSidebarMode}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => onSidebarThemeChange(activeSidebarMode === 'dark' ? 'light' : 'dark')}
                className="px-2 py-0.5 rounded text-[7pt] font-semibold border cursor-pointer transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: activeSidebarMode === 'dark' ? 'rgba(255,255,255,0.18)' : '#ffffff',
                  color: activeSidebarMode === 'dark' ? '#ffffff' : '#1e293b',
                  borderColor: sidebarConfig.borderSubtle
                }}
                title={`Klik untuk mengganti tema sidebar ke ${activeSidebarMode === 'dark' ? 'Light Theme (Font Gelap)' : 'Dark Theme (Font Putih)'}`}
              >
                Ganti ke {activeSidebarMode === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          )}

          {/* Profile Picture */}
          <div className="flex justify-center mb-1">
            {data.personal_info.profile_picture_placeholder ? (
              <img 
                src={data.personal_info.profile_picture_placeholder} 
                alt={data.personal_info.name} 
                className="profile-photo w-28 h-28 object-cover rounded-full border-2 border-white shadow-md aspect-square"
              />
            ) : (
              <div 
                className="profile-photo-avatar w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-white shadow-md aspect-square"
                style={{ backgroundColor: currentTheme.vars.primary }}
              >
                {data.personal_info.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Kontak Section */}
          <div className="space-y-2">
            <h3 
              className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
              Kontak
            </h3>
            <div className="space-y-1.5 text-[8pt]" style={{ color: sidebarConfig.textMain }}>
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
                  <span className="truncate font-mono text-[7.5pt]">
                    {data.personal_info.contact.linkedin.replace('https://', '')}
                  </span>
                </div>
              )}
              {data.personal_info.contact.github && (
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 shrink-0" style={{ color: sidebarConfig.iconColor }} />
                  <span className="truncate font-mono text-[7.5pt]">
                    {data.personal_info.contact.github.replace('https://', '')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Core Skills (Skill Bar & Badges) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 
                className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
                Keahlian Inti
              </h3>
            </div>
            <div className="space-y-2">
              {data.core_skills.map((skill, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-start text-[7.6pt] font-medium gap-1.5" style={{ color: sidebarConfig.textMain }}>
                    <span className="leading-tight font-semibold break-words flex-1">{skill.skill_name}</span>
                    <span 
                      className="uppercase font-bold text-[6.8pt] tracking-wider shrink-0 mt-0.5"
                      style={{
                        color: currentTheme.vars.accent
                      }}
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

          {/* Tech Stack */}
          <div className="space-y-2">
            <h3 
              className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
              Tech Stack
            </h3>
            <div className="space-y-2">
              {data.tech_stack.map((item, idx) => (
                <div 
                  key={idx} 
                  className="text-[7.8pt] pb-1.5 border-b last:border-0 last:pb-0"
                  style={{ borderColor: sidebarConfig.borderSubtle }}
                >
                  <div 
                    className="flex justify-between items-start font-bold gap-1.5" 
                    style={{ color: activeSidebarMode === 'dark' ? currentTheme.vars.accent : currentTheme.vars.primary }}
                  >
                    <span className="leading-tight break-words flex-1">{item.category}</span>
                    {item.level && (
                      <span 
                        className="uppercase font-bold text-[6.8pt] tracking-wider shrink-0 mt-0.5"
                        style={{
                          color: currentTheme.vars.accent
                        }}
                      >
                        {item.level}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold mt-0.5" style={{ color: sidebarConfig.textMain }}>
                    {item.tool}
                  </div>
                  {item.description && (
                    <div className="text-[7.2pt] leading-snug mt-0.5" style={{ color: sidebarConfig.textMuted }}>
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bahasa */}
          {data.languages && data.languages.length > 0 && (
            <div className="space-y-1.5">
              <h3 
                className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
                Bahasa
              </h3>
              <div className="space-y-1">
                {data.languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[7.8pt]">
                    <span className="font-semibold" style={{ color: sidebarConfig.textMain }}>{lang.language}</span>
                    <span className="text-[7pt]" style={{ color: sidebarConfig.textMuted }}>{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sertifikasi */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="space-y-1.5">
              <h3 
                className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: sidebarConfig.headingColor, borderBottomColor: currentTheme.vars.accent }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.vars.accent }}></span>
                Sertifikasi
              </h3>
              <div className="space-y-1.5">
                {data.certifications.map((cert, idx) => (
                  <div key={idx} className="text-[7.5pt]">
                    <div className="font-bold leading-tight" style={{ color: sidebarConfig.textMain }}>
                      {cert.name}
                    </div>
                    <div className="text-[7pt] leading-tight" style={{ color: sidebarConfig.textMuted }}>
                      {cert.detail} {cert.year && <span className="font-bold" style={{ color: currentTheme.vars.accent }}>| {cert.year}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* =========================================================
            KONTEN UTAMA KANAN (68% DENGAN PADDING-LEFT 8PX)
            ========================================================= */}
        <main className="content main-content flex flex-col gap-3 bg-white">
          {/* Header Name & Title */}
          <div className="pb-1 mb-1">
            <h1 
              className="text-[20pt] font-extrabold tracking-tight leading-none"
              style={{ color: 'var(--primary-navy, #182634)' }}
            >
              {data.personal_info.name}
            </h1>
            <h2 
              className="text-[11pt] font-semibold tracking-wide mt-1.5 border-b-0 pb-0 mb-0"
              style={{ color: 'var(--accent-gold, #C08A3E)' }}
            >
              {data.personal_info.title}
            </h2>
          </div>

          {/* Summary */}
          <section className="space-y-1.5">
            <h3 
              className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
              Ringkasan Profesional
            </h3>
            <p className="text-[8.5pt] text-slate-700 leading-relaxed text-justify">
              {data.personal_info.summary}
            </p>
          </section>

          {/* Pengalaman Kerja (Timeline Node Line) */}
          <section className="space-y-2">
            <h3 
              className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
              Pengalaman Kerja
            </h3>
            
            {/* Timeline container with vertical line */}
            <div className="experience-timeline relative space-y-3">
              {data.work_experience.map((exp, idx) => (
                <div key={idx} className="relative break-inside-avoid">
                  {/* Node bullet (Round dot Gold/Navy) */}
                  <div className="experience-node-dot"></div>
                  
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="text-[9pt] font-bold" style={{ color: 'var(--primary-navy, #182634)' }}>
                      {exp.position}
                    </h4>
                    <span className="text-[7.5pt] font-semibold whitespace-nowrap" style={{ color: 'var(--accent-gold, #C08A3E)' }}>
                      {exp.period}
                    </span>
                  </div>

                  <div className="text-[8pt] font-semibold text-slate-600 mb-0.5">
                    {exp.company}
                  </div>

                  {/* Highlights without bullet points ('•') */}
                  <ul className="experience-highlights space-y-0.5 text-[8pt] text-slate-700">
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

          {/* Portofolio Digital */}
          {data.digital_portfolio && data.digital_portfolio.length > 0 && (
            <section className="space-y-2 break-inside-avoid">
              <h3 
                className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
                Portofolio Digital & Proyek
              </h3>
              <div className="space-y-2">
                {data.digital_portfolio.map((port, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 rounded-lg border text-[8pt] space-y-1"
                    style={{ 
                      backgroundColor: `${currentTheme.vars.bgSidebar}60`,
                      borderColor: currentTheme.vars.borderMuted,
                      borderLeftWidth: '3px',
                      borderLeftColor: currentTheme.vars.accent
                    }}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold" style={{ color: currentTheme.vars.primary }}>{port.project_name}</span>
                      {port.link && (
                        <span className="text-[7pt] font-semibold flex items-center gap-0.5" style={{ color: currentTheme.vars.accent }}>
                          Project Link <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[7.5pt] leading-snug">{port.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {port.tech_used.map((t, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="skill-badge text-[6.5pt] px-1.5 py-0.5 font-semibold border rounded transition-colors"
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
          <section className="space-y-1.5 break-inside-avoid">
            <h3 
              className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
              Pendidikan Formal
            </h3>
            <div className="space-y-1.5">
              {data.education.map((edu, idx) => (
                <div key={idx} className="text-[8pt]">
                  <div className="flex justify-between items-baseline font-bold" style={{ color: currentTheme.vars.primary }}>
                    <span>{edu.degree}</span>
                    <span className="text-[7.5pt] font-semibold" style={{ color: currentTheme.vars.accent }}>{edu.year}</span>
                  </div>
                  <div className="font-semibold text-slate-600 text-[7.8pt]">{edu.institution}</div>
                  {edu.details && (
                    <div className="text-[7.2pt] text-slate-500 leading-snug mt-0.5">{edu.details}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Referensi Profesional */}
          {data.references && data.references.length > 0 && (
            <section className="space-y-1.5 break-inside-avoid">
              <h3 
                className="section-header text-[10pt] font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
                Referensi Profesional
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {data.references.map((ref, idx) => (
                  <div key={idx} className="p-2 rounded border border-slate-200 bg-slate-50/50 text-[7.5pt]">
                    <div className="font-bold" style={{ color: currentTheme.vars.primary }}>{ref.name}</div>
                    <div className="text-slate-600 text-[7pt] leading-tight">{ref.title}</div>
                    <div className="font-mono text-[6.8pt] mt-0.5" style={{ color: currentTheme.vars.accent }}>{ref.contact_info}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
