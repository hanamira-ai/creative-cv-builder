import { CVData } from './types';
import { CV_THEMES, CVTheme } from './themes';

export function generateStandaloneCVHtml(
  data: CVData, 
  selectedThemeId: string = 'navy-gold',
  sidebarTheme: 'light' | 'dark' = 'dark',
  badgeTheme: 'light' | 'dark' = 'dark'
): string {
  const activeTheme: CVTheme = CV_THEMES[selectedThemeId] || CV_THEMES['navy-gold'];
  const activeSidebarMode = sidebarTheme || 'dark';
  const sidebarConfig = activeTheme.sidebar?.[activeSidebarMode] || activeTheme.sidebar?.dark || {
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
  };

  const activeBadgeMode = badgeTheme || 'dark';
  const badgeConfig = activeTheme.badges?.[activeBadgeMode] || activeTheme.badges?.dark || {
    bg: '#182634',
    color: '#FFFFFF',
    border: '#C08A3E'
  };

  const isEn = data.language === 'en';
  const labels = {
    contact: isEn ? 'Contact' : 'Kontak',
    coreSkills: isEn ? 'Core Skills' : 'Keahlian Inti',
    techStack: isEn ? 'Tech Stack' : 'Tech Stack',
    languages: isEn ? 'Languages' : 'Bahasa',
    certifications: isEn ? 'Certifications' : 'Sertifikasi',
    summary: isEn ? 'Professional Summary' : 'Profil Profesional',
    workExp: isEn ? 'Work Experience' : 'Pengalaman Kerja',
    portfolio: isEn ? 'Digital Portfolio' : 'Portofolio Digital',
    education: isEn ? 'Formal Education' : 'Pendidikan Formal',
    references: isEn ? 'Professional References' : 'Referensi Profesional'
  };

  // Helper for proficiency percentage
  const getProficiencyPercent = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'mahir':
      case 'expert':
      case 'advanced': return 95;
      case 'menengah':
      case 'intermediate': return 75;
      case 'dasar':
      case 'beginner':
      case 'basic': return 45;
      default: return 70;
    }
  };

  const coreSkillsHtml = (data.core_skills || []).map(skill => `
    <div class="skill-item">
      <div class="skill-header">
        <span class="skill-name">${escapeHtml(skill.skill_name)}</span>
        <span class="skill-level">${escapeHtml(skill.proficiency_level)}</span>
      </div>
      <div class="skill-track">
        <div class="skill-fill" style="width: ${getProficiencyPercent(skill.proficiency_level)}%;"></div>
      </div>
    </div>
  `).join('');

  const techStackHtml = (data.tech_stack || []).map(item => `
    <div class="tech-item">
      <div class="tech-head">
        <strong class="tech-category">${escapeHtml(item.category || '')}</strong>
        ${item.level ? `<span class="tech-level">${escapeHtml(item.level)}</span>` : ''}
      </div>
      <div class="tech-tool">${escapeHtml(item.tool || '')}</div>
      ${item.description ? `<p class="tech-desc">${escapeHtml(item.description)}</p>` : ''}
    </div>
  `).join('');

  const languagesHtml = (data.languages || []).map(lang => `
    <div class="lang-item">
      <span class="lang-name">${escapeHtml(lang.language)}</span>
      <span class="lang-level">${escapeHtml(lang.level)}</span>
    </div>
  `).join('');

  const certificationsHtml = (data.certifications || []).map(cert => `
    <div class="cert-item">
      <div class="cert-name">${escapeHtml(cert.name)}</div>
      <div class="cert-detail">${escapeHtml(cert.detail)}${cert.year ? ` | <span class="cert-year">${escapeHtml(cert.year)}</span>` : ''}</div>
    </div>
  `).join('');

  const workExperienceHtml = (data.work_experience || []).map(exp => `
    <div class="timeline-node timeline-item">
      <div class="node-bullet"></div>
      <div class="node-content">
        <div class="node-header">
          <div class="node-role">${escapeHtml(exp.position)}</div>
          <div class="node-period">${escapeHtml(exp.period)}</div>
        </div>
        <div class="node-company">${escapeHtml(exp.company)}</div>
        <ul class="node-highlights">
          ${(exp.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');

  const portfolioHtml = (data.digital_portfolio || []).map(p => `
    <div class="portfolio-item portfolio-card">
      <div class="portfolio-head">
        <h4 class="portfolio-title">${escapeHtml(p.project_name)}</h4>
      </div>
      <p class="portfolio-desc">${escapeHtml(p.description)}</p>
      <div class="portfolio-tags">
        ${(p.tech_used || []).map(t => `<span class="portfolio-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>
  `).join('');

  const educationHtml = (data.education || []).map(edu => `
    <div class="edu-item education-item">
      <div class="edu-head">
        <strong class="edu-degree">${escapeHtml(edu.degree)}</strong>
        <span class="edu-year">${escapeHtml(edu.year)}</span>
      </div>
      <div class="edu-inst">${escapeHtml(edu.institution)}</div>
      ${edu.details ? `<p class="edu-details">${escapeHtml(edu.details)}</p>` : ''}
    </div>
  `).join('');

  const referencesHtml = (data.references || []).map(ref => `
    <div class="ref-item reference-item">
      <div class="ref-name">${escapeHtml(ref.name)}</div>
      <div class="ref-title">${escapeHtml(ref.title)}</div>
      <div class="ref-contact">${escapeHtml(ref.contact_info)}</div>
    </div>
  `).join('');

  const photoHtml = data.personal_info.profile_picture_placeholder 
    ? `<img src="${escapeHtml(data.personal_info.profile_picture_placeholder)}" alt="${escapeHtml(data.personal_info.name)}" class="profile-photo" />`
    : `<div class="profile-photo-avatar">${data.personal_info.name.charAt(0)}</div>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CV - ${escapeHtml(data.personal_info.name)} (A4 Resume)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* =========================================================
       CSS VARIABLES & THEME DEFINITIONS
       ========================================================= */
    :root {
      --primary-navy: #182634;  /* Navy Gelap */
      --accent-gold: #C08A3E;   /* Amber / Gold */
      --text-dark: #2c3e50;
      --bg-sidebar: ${sidebarConfig.bgSidebar};

      /* Default Theme: Corporate Dark Navy + Gold/Amber */
      --primary-color: var(--primary-navy);
      --accent-color: var(--accent-gold);
      --text-light: #FFFFFF;
      --border-muted: #E2E8F0;
      --sidebar-width: 32%;
      --main-width: 68%;

      /* Dynamic Sidebar Theme: ${activeSidebarMode} */
      --sidebar-bg: ${sidebarConfig.bgSidebar};
      --sidebar-text: ${sidebarConfig.textMain};
      --sidebar-muted: ${sidebarConfig.textMuted};
      --sidebar-heading: ${sidebarConfig.headingColor};
      --sidebar-border: ${sidebarConfig.borderSubtle};
      --sidebar-icon: ${sidebarConfig.iconColor};
      --sidebar-badge-bg: ${sidebarConfig.badgeBg};
      --sidebar-badge-color: ${sidebarConfig.badgeColor};
      --sidebar-badge-border: ${sidebarConfig.badgeBorder};
      --sidebar-bar-track: ${sidebarConfig.progressBarTrack};
      --sidebar-bar-fill: ${sidebarConfig.progressBarFill};

      /* Dynamic Badge Theme: ${activeBadgeMode} */
      --badge-bg: ${badgeConfig.bg};
      --badge-color: ${badgeConfig.color};
      --badge-border: ${badgeConfig.border};
    }

    /* Theme 1: Navy + Gold (Professional Elegant) */
    .theme-navy-gold {
      --primary-navy: #182634;
      --accent-gold: #C08A3E;
      --primary-color: #182634;
      --accent-color: #C08A3E;
      --bg-sidebar: #F4F6F8;
      --text-dark: #2C3E50;
      --text-light: #FFFFFF;
      --border-muted: #E2E8F0;
    }

    /* Theme 2: Emerald + Slate (Modern Tech / GIS Specialist) */
    .theme-emerald-slate {
      --primary-color: #064E3B;
      --accent-color: #059669;
      --bg-sidebar: #F0FDF4;
      --text-dark: #1E293B;
      --text-light: #FFFFFF;
      --border-muted: #D1FAE5;
    }

    /* Theme 3: Monochrome Charcoal + Accent Orange (Creative Agency) */
    .theme-charcoal-orange {
      --primary-color: #1E1E24;
      --accent-color: #EA580C;
      --bg-sidebar: #F8FAFC;
      --text-dark: #18181B;
      --text-light: #FFFFFF;
      --border-muted: #E4E4E7;
    }

    /* =========================================================
       PAGE & PRINT ARCHITECTURE (A4 EXACT SPECIFICATIONS)
       ========================================================= */
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: var(--text-dark);
      background-color: #E2E8F0;
      padding: 20px 0;
    }

    /* 1. Atur Container Utama menjadi 2 Kolom Fixed A4 (CSS GRID 32% 68%) */
    .cv-paper,
    #cv-paper-target,
    .cv-layout,
    .cv-container, 
    .cv-page-container {
      display: grid !important;
      grid-template-columns: 32% 68% !important; /* 32% Sidebar, 68% Konten Utama */
      width: 210mm !important;
      min-width: 210mm !important;
      max-width: 210mm !important;
      min-height: 297mm !important;
      height: auto !important;
      box-sizing: border-box !important;
      padding: 12mm 10mm !important; /* Safe zone 12mm atas & bawah */
      background-color: #ffffff !important;
      margin: 0 auto !important;
      position: relative !important;
      align-items: stretch !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }

    /* Sidebar Styling (Kolom Kiri 32%) - Memanjang seimbang */
    .sidebar {
      background-color: var(--sidebar-bg, var(--bg-sidebar, #f4f6f8));
      color: var(--sidebar-text, var(--text-dark));
      padding: 12px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 4mm;
      height: 100% !important;
      min-height: 100% !important;
      align-self: stretch !important;
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Page Break Control Rules */
    .timeline-item, 
    .portfolio-card, 
    .education-item, 
    .reference-item, 
    .section-block,
    .timeline-node,
    .portfolio-item,
    .edu-item,
    .ref-item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    h2, h3, .section-title {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    .sidebar .section-title {
      color: var(--sidebar-heading, var(--primary-navy));
      border-bottom: 2px solid var(--accent-gold);
    }

    .sidebar .contact-row {
      color: var(--sidebar-text, var(--text-dark));
    }

    .sidebar .contact-icon {
      color: var(--sidebar-icon, var(--accent-color));
    }

    .sidebar .skill-name {
      color: var(--sidebar-text, var(--text-dark));
      line-height: 1.25;
      word-break: break-word;
    }

    .sidebar .skill-level,
    .sidebar .tech-level {
      color: var(--sidebar-icon, var(--accent-color));
      text-transform: uppercase;
      font-weight: 700;
      font-size: 6.8pt;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }

    .sidebar .skill-badge {
      background-color: var(--sidebar-badge-bg, var(--badge-bg));
      color: var(--sidebar-badge-color, var(--badge-color));
      border-color: var(--sidebar-badge-border, var(--badge-border));
    }

    .sidebar .skill-track {
      background-color: var(--sidebar-bar-track, var(--border-muted));
    }

    .sidebar .skill-fill {
      background: var(--sidebar-bar-fill, linear-gradient(90deg, var(--primary-color), var(--accent-color)));
    }

    .sidebar .tech-item {
      border-bottom-color: var(--sidebar-border, var(--border-muted));
    }

    .sidebar .tech-category {
      color: var(--sidebar-heading, var(--primary-color));
    }

    .sidebar .tech-tool {
      color: var(--sidebar-text, var(--text-dark));
    }

    .sidebar .tech-desc {
      color: var(--sidebar-muted, #64748B);
    }

    .sidebar .lang-item,
    .sidebar .cert-item {
      color: var(--sidebar-text, var(--text-dark));
    }

    .sidebar .lang-level,
    .sidebar .cert-detail {
      color: var(--sidebar-muted, #64748B);
    }

    /* Main Content Styling (Kolom Kanan 68%) */
    .content,
    .main-content {
      padding-left: 14px;
      display: flex;
      flex-direction: column;
      gap: 4mm;
      background: #ffffff;
    }

    /* Penerapan pada Section Title & Header */
    h1, h2, .section-header, .section-title {
      color: var(--primary-navy);
      border-bottom: 2px solid var(--accent-gold);
      padding-bottom: 4px;
      margin-bottom: 12px;
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section-title .accent-dot,
    .section-header .accent-dot {
      width: 6px;
      height: 6px;
      background-color: var(--accent-gold);
      border-radius: 50%;
      display: inline-block;
    }

    /* =========================================================
       SIDEBAR COMPONENTS (LEFT ~32%)
       ========================================================= */
    .profile-photo-wrapper {
      text-align: center;
      margin-bottom: 2mm;
    }

    .profile-photo {
      width: 32mm;
      height: 32mm;
      border-radius: 50%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      margin: 0 auto;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      display: block;
    }

    .profile-photo-avatar {
      width: 32mm;
      height: 32mm;
      border-radius: 50%;
      aspect-ratio: 1 / 1;
      background: var(--primary-color);
      color: var(--text-light);
      font-size: 24pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 2.2mm;
      font-size: 8.5pt;
    }

    .contact-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      word-break: break-word;
      color: var(--text-dark);
      text-decoration: none;
    }

    .contact-icon {
      color: var(--accent-color);
      font-size: 8.5pt;
      font-weight: bold;
      line-height: 1.4;
      flex-shrink: 0;
    }

    /* Core Skills & Skill Bars */
    .skill-item {
      margin-bottom: 2.5mm;
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 6px;
      margin-bottom: 2px;
    }

    .skill-name {
      font-size: 7.8pt;
      font-weight: 600;
      color: var(--text-dark);
      line-height: 1.25;
      flex: 1;
      word-break: break-word;
    }

    .skill-level {
      font-size: 6.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent-gold);
      white-space: nowrap;
      margin-top: 1px;
    }

    /* Badge / Skill Tag / Level with Dynamic Light & Dark Theme */
    .skill-badge {
      background-color: var(--badge-bg);
      color: var(--badge-color);
      border: 1px solid var(--badge-border);
      border-radius: 4px;
      font-weight: 600;
      font-size: 7.2pt;
      padding: 1px 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .skill-track {
      width: 100%;
      height: 4.5px;
      background-color: var(--border-muted);
      border-radius: 999px;
      overflow: hidden;
    }

    .skill-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      border-radius: 999px;
    }

    /* Tech Stack */
    .tech-item {
      margin-bottom: 2.5mm;
      padding-bottom: 2mm;
      border-bottom: 1px dashed var(--border-muted);
    }

    .tech-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .tech-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 6px;
    }

    .tech-category {
      font-size: 7.8pt;
      color: var(--primary-color);
      font-weight: 700;
      line-height: 1.25;
      word-break: break-word;
      flex: 1;
    }

    .tech-level {
      font-size: 6.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent-gold);
      white-space: nowrap;
      margin-top: 1px;
    }

    .tech-tool {
      font-size: 8pt;
      font-weight: 600;
      color: var(--text-dark);
      margin-top: 1px;
    }

    .tech-desc {
      font-size: 7.5pt;
      color: #64748B;
      line-height: 1.35;
      margin-top: 1px;
    }

    /* Languages & Certifications */
    .lang-item {
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      padding: 1.5mm 0;
      border-bottom: 1px solid var(--border-muted);
    }

    .lang-item:last-child {
      border-bottom: none;
    }

    .lang-name {
      font-weight: 600;
    }

    .lang-level {
      color: #64748B;
      font-size: 7.5pt;
    }

    .cert-item {
      margin-bottom: 2mm;
    }

    .cert-name {
      font-size: 8pt;
      font-weight: 600;
      color: var(--primary-color);
      line-height: 1.3;
    }

    .cert-detail {
      font-size: 7.5pt;
      color: #64748B;
      line-height: 1.35;
    }

    .cert-year {
      font-weight: 600;
      color: var(--accent-color);
    }

    /* =========================================================
       MAIN CONTENT (RIGHT ~68%)
       ========================================================= */
    .header-block {
      border-bottom: 2px solid var(--border-muted);
      padding-bottom: 4.5mm;
      margin-bottom: 1mm;
    }

    .candidate-name {
      font-size: 20pt;
      font-weight: 800;
      color: var(--primary-color);
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .candidate-title {
      font-size: 11.5pt;
      font-weight: 600;
      color: var(--accent-color);
      letter-spacing: 0.02em;
      margin-top: 1.5mm;
    }

    .summary-text {
      font-size: 9pt;
      line-height: 1.55;
      color: #334155;
      text-align: justify;
    }

    /* Work Experience Timeline (Bertitik / Node Line) */
    .timeline-container {
      position: relative;
      margin-left: 2mm;
      padding-left: 4.5mm;
      border-left: 2px solid var(--accent-gold);
    }

    .timeline-node {
      position: relative;
      margin-bottom: 3.5mm;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .timeline-node:last-child {
      margin-bottom: 0;
    }

    .node-bullet {
      position: absolute;
      left: calc(-4.5mm - 6px);
      top: 3px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary-navy);
      border: 2px solid var(--accent-gold);
      box-shadow: 0 0 0 1.5px #FFFFFF;
      z-index: 2;
    }

    .node-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 2mm;
    }

    .node-role {
      font-size: 9.5pt;
      font-weight: 700;
      color: var(--primary-navy);
    }

    .node-period {
      font-size: 8pt;
      font-weight: 600;
      color: var(--accent-gold);
      font-family: inherit;
      white-space: nowrap;
    }

    .node-company {
      font-size: 8.5pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 1mm;
    }

    /* Highlights tanpa simbol bullet point ('•') */
    .node-highlights {
      list-style-type: none !important;
      padding: 0 !important;
      margin: 1mm 0 0 0 !important;
      display: flex;
      flex-direction: column;
      gap: 0.8mm;
    }

    .node-highlights li {
      font-size: 8.2pt;
      line-height: 1.4;
      color: #334155;
      position: relative;
      padding-left: 0 !important;
      list-style: none !important;
    }

    .node-highlights li::before {
      content: none !important;
      display: none !important;
    }

    /* Digital Portfolio */
    .portfolio-grid {
      display: flex;
      flex-direction: column;
      gap: 2.5mm;
    }

    .portfolio-item {
      background: var(--bg-sidebar);
      border: 1px solid var(--border-muted);
      border-left: 3px solid var(--accent-color);
      padding: 2.5mm 3.5mm;
      border-radius: 6px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .portfolio-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .portfolio-title {
      font-size: 9pt;
      font-weight: 700;
      color: var(--primary-color);
    }

    .portfolio-link {
      font-size: 7.5pt;
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
    }

    .portfolio-desc {
      font-size: 8pt;
      line-height: 1.4;
      color: #475569;
      margin: 1mm 0 1.5mm 0;
    }

    .portfolio-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
    }

    .portfolio-tag {
      font-size: 6.8pt;
      font-weight: 600;
      background: #FFFFFF;
      color: var(--primary-color);
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid var(--border-muted);
    }

    /* Education & References */
    .edu-item {
      margin-bottom: 2mm;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .edu-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .edu-degree {
      font-size: 9pt;
      font-weight: 700;
      color: var(--primary-color);
    }

    .edu-year {
      font-size: 8pt;
      font-weight: 600;
      color: var(--accent-color);
    }

    .edu-inst {
      font-size: 8.5pt;
      font-weight: 600;
      color: #475569;
    }

    .edu-details {
      font-size: 7.8pt;
      color: #64748B;
      line-height: 1.35;
      margin-top: 0.5mm;
    }

    .ref-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3mm;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .ref-item {
      background: #FFFFFF;
      border: 1px solid var(--border-muted);
      padding: 2.2mm 3mm;
      border-radius: 6px;
    }

    .ref-name {
      font-size: 8.5pt;
      font-weight: 700;
      color: var(--primary-color);
    }

    .ref-title {
      font-size: 7.5pt;
      color: #475569;
      line-height: 1.25;
      margin: 0.5mm 0;
    }

    .ref-contact {
      font-size: 7.5pt;
      color: var(--accent-color);
      font-family: monospace;
    }

    /* =========================================================
       PRINT RULES (@media print)
       ========================================================= */
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }

      body {
        background-color: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        height: auto !important;
      }

      .cv-paper,
      #cv-paper-target,
      .cv-layout,
      .cv-container,
      .cv-page-container {
        box-shadow: none !important;
        border: none !important;
        margin: 0 auto !important;
        width: 210mm !important;
        min-width: 210mm !important;
        max-width: 210mm !important;
        height: auto !important;
        min-height: 297mm !important;
        max-height: none !important;
        padding: 12mm 10mm !important;
        box-sizing: border-box !important;
        overflow: visible !important;
        page-break-after: always;
        break-after: page;
      }

      .sidebar {
        height: 100% !important;
        min-height: 100% !important;
        align-self: stretch !important;
        background-color: var(--sidebar-bg, var(--bg-sidebar, #f4f6f8)) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .timeline-item, 
      .portfolio-card, 
      .education-item, 
      .reference-item, 
      .section-block,
      .timeline-node,
      .portfolio-item,
      .edu-item,
      .ref-item {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      h2, h3, .section-title {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
    }
  </style>
</head>
<body class="${escapeHtml(activeTheme.cssClass)} sidebar-theme-${escapeHtml(activeSidebarMode)} badge-theme-${escapeHtml(activeBadgeMode)}">
  <div id="cv-paper-target" class="cv-paper cv-layout cv-container">
    
    <!-- SIDEBAR KIRI (~32%) -->
    <aside class="sidebar sidebar-${escapeHtml(activeSidebarMode)}">
      <!-- Foto Profil -->
      <div class="profile-photo-wrapper">
        ${photoHtml}
      </div>

      <!-- Kontak -->
      <section class="sidebar-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.contact)}</h3>
        <div class="contact-list">
          ${data.personal_info.contact.phone ? `
            <div class="contact-row">
              <span class="contact-icon">☎</span>
              <span>${escapeHtml(data.personal_info.contact.phone)}</span>
            </div>` : ''}
          ${data.personal_info.contact.email ? `
            <div class="contact-row">
              <span class="contact-icon">✉</span>
              <span>${escapeHtml(data.personal_info.contact.email)}</span>
            </div>` : ''}
          ${data.personal_info.contact.address ? `
            <div class="contact-row">
              <span class="contact-icon">⚲</span>
              <span>${escapeHtml(data.personal_info.contact.address)}</span>
            </div>` : ''}
          ${data.personal_info.contact.linkedin ? `
            <div class="contact-row">
              <span class="contact-icon">in</span>
              <span>${escapeHtml(data.personal_info.contact.linkedin.replace('https://', ''))}</span>
            </div>` : ''}
          ${data.personal_info.contact.github ? `
            <div class="contact-row">
              <span class="contact-icon">⌨</span>
              <span>${escapeHtml(data.personal_info.contact.github.replace('https://', ''))}</span>
            </div>` : ''}
        </div>
      </section>

      <!-- Kompetensi Inti (Skill Bar & Badge) -->
      <section class="sidebar-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.coreSkills)}</h3>
        <div class="skills-list">
          ${coreSkillsHtml}
        </div>
      </section>

      <!-- Tech Stack -->
      <section class="sidebar-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.techStack)}</h3>
        <div class="tech-list">
          ${techStackHtml}
        </div>
      </section>

      <!-- Bahasa -->
      ${data.languages && data.languages.length > 0 ? `
      <section class="sidebar-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.languages)}</h3>
        <div class="lang-list">
          ${languagesHtml}
        </div>
      </section>` : ''}

      <!-- Sertifikasi -->
      ${data.certifications && data.certifications.length > 0 ? `
      <section class="sidebar-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.certifications)}</h3>
        <div class="cert-list">
          ${certificationsHtml}
        </div>
      </section>` : ''}
    </aside>

    <!-- KONTEN UTAMA KANAN (~68%) -->
    <main class="content main-content">
      <!-- Header Nama & Title -->
      <header class="header-block section-block">
        <h1 class="candidate-name">${escapeHtml(data.personal_info.name)}</h1>
        <div class="candidate-title">${escapeHtml(data.personal_info.title)}</div>
      </header>

      <!-- Ringkasan Profesional -->
      <section class="content-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.summary)}</h3>
        <p class="summary-text">${escapeHtml(data.personal_info.summary)}</p>
      </section>

      <!-- Pengalaman Kerja (Timeline Node Bertitik) -->
      <section class="content-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.workExp)}</h3>
        <div class="timeline-container">
          ${workExperienceHtml}
        </div>
      </section>

      <!-- Portofolio Digital -->
      ${data.digital_portfolio && data.digital_portfolio.length > 0 ? `
      <section class="content-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.portfolio)}</h3>
        <div class="portfolio-grid">
          ${portfolioHtml}
        </div>
      </section>` : ''}

      <!-- Pendidikan -->
      <section class="content-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.education)}</h3>
        <div class="edu-list">
          ${educationHtml}
        </div>
      </section>

      <!-- Referensi -->
      ${data.references && data.references.length > 0 ? `
      <section class="content-section section-block">
        <h3 class="section-title"><span class="accent-dot"></span> ${escapeHtml(labels.references)}</h3>
        <div class="ref-grid">
          ${referencesHtml}
        </div>
      </section>` : ''}
    </main>

  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
