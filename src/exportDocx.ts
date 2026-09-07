import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  TableBorders,
} from 'docx';
import { saveAs } from 'file-saver';
import { CVData } from './types';
import { CV_THEMES } from './themes';

/**
 * ============================================================================
 * 1. FUNGSI generateDocxHTML()
 * ============================================================================
 * Mengubah data JSON CV menjadi struktur HTML berbasis Tabel 2-Kolom Native:
 * <table width="100%">
 *   <tr>
 *     <td width="32%" valign="top">...sidebar...</td>
 *     <td width="68%" valign="top">...main content...</td>
 *   </tr>
 * </table>
 * Dilengkapi atribut inline styling & XML Header Microsoft Word (MSO)
 * agar 100% kompatibel dan tidak corrupt saat dibuka di Microsoft Word.
 */
export function generateDocxHTML(
  data: CVData,
  themeId: string = 'navy-gold',
  sidebarTheme: 'light' | 'dark' = 'dark',
  badgeTheme: 'light' | 'dark' = 'dark'
): string {
  const currentTheme = CV_THEMES[themeId] || CV_THEMES['navy-gold'];

  // Konfigurasi tema sidebar
  const activeSidebarMode = sidebarTheme || 'dark';
  const sidebarConfig = currentTheme.sidebar?.[activeSidebarMode] || {
    bgSidebar: activeSidebarMode === 'dark' ? '#182634' : '#F4F6F8',
    textMain: activeSidebarMode === 'dark' ? '#FFFFFF' : '#1E293B',
    textMuted: activeSidebarMode === 'dark' ? '#CBD5E1' : '#64748B',
    headingColor: activeSidebarMode === 'dark' ? '#FFFFFF' : '#0F172A',
    iconColor: '#E5A93C',
    badgeBg: activeSidebarMode === 'dark' ? 'rgba(229, 169, 60, 0.22)' : 'rgba(24, 38, 52, 0.08)',
    badgeColor: activeSidebarMode === 'dark' ? '#FFFFFF' : '#182634',
    badgeBorder: '#E5A93C'
  };

  const primaryColor = currentTheme.vars.primary || '#182634';
  const accentColor = currentTheme.vars.accent || '#C08A3E';
  const sidebarBg = sidebarConfig.bgSidebar;
  const sidebarText = sidebarConfig.textMain;
  const sidebarMuted = sidebarConfig.textMuted;
  const sidebarHeading = sidebarConfig.headingColor;

  const isEn = data.language === 'en';
  const labels = {
    contact: isEn ? 'CONTACT' : 'KONTAK',
    phone: isEn ? 'Phone' : 'Telepon',
    email: 'Email',
    location: isEn ? 'Location' : 'Lokasi',
    coreSkills: isEn ? 'CORE SKILLS' : 'KEAHLIAN INTI',
    techStack: 'TECH STACK',
    languages: isEn ? 'LANGUAGES' : 'BAHASA',
    certifications: isEn ? 'CERTIFICATIONS' : 'SERTIFIKASI',
    summary: isEn ? 'PROFESSIONAL SUMMARY' : 'RINGKASAN PROFESIONAL',
    workExp: isEn ? 'WORK EXPERIENCE' : 'PENGALAMAN KERJA',
    portfolio: isEn ? 'DIGITAL PORTFOLIO & PROJECTS' : 'PORTOFOLIO DIGITAL & PROYEK',
    education: isEn ? 'EDUCATION' : 'PENDIDIKAN FORMAL',
    references: isEn ? 'PROFESSIONAL REFERENCES' : 'REFERENSI PROFESIONAL',
  };

  // Helper escape string dengan aman
  const esc = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Render Core Skills HTML
  const coreSkillsHtml = (data.core_skills || [])
    .map((skill: any) => {
      const name = typeof skill === 'string' ? skill : (skill.skill_name || '');
      const level = typeof skill === 'object' && skill.proficiency_level ? ` (${skill.proficiency_level})` : '';
      return `<span style="display:inline-block; background-color:${sidebarConfig.badgeBg}; color:${sidebarConfig.badgeColor}; border:1px solid ${sidebarConfig.badgeBorder}; padding:3px 8px; margin:2px 3px 2px 0; border-radius:4px; font-size:8pt; font-weight:600;">${esc(name)}${esc(level)}</span>`;
    })
    .join(' ');

  // Render Tech Stack HTML (Mendukung format kategori/tool)
  const techStackHtml = (data.tech_stack || [])
    .map((stack: any) => {
      const cat = stack.category || 'Tools';
      const items = Array.isArray(stack.items)
        ? stack.items.map(esc).join(' • ')
        : (stack.tool ? `${esc(stack.tool)}${stack.description ? ` (${esc(stack.description)})` : ''}` : '');
      return `
      <div style="margin-bottom:6px;">
        <div style="font-size:8.5pt; font-weight:bold; color:${accentColor}; margin-bottom:1px;">${esc(cat)}:</div>
        <div style="font-size:8pt; color:${sidebarMuted}; line-height:1.35;">${items}</div>
      </div>
    `;
    })
    .join('');

  // Render Bahasa HTML
  const languagesHtml = (data.languages || [])
    .map((lang: any) => {
      const lName = lang.language || '';
      const lLevel = lang.level || lang.proficiency || '';
      return `
      <div style="margin-bottom:5px; font-size:8.5pt;">
        <strong style="color:${sidebarText};">${esc(lName)}:</strong>
        <span style="color:${sidebarMuted};"> ${esc(lLevel)}</span>
      </div>
    `;
    })
    .join('');

  // Render Sertifikasi HTML
  const certsHtml = (data.certifications || [])
    .map((cert: any) => {
      const cName = cert.name || '';
      const cDetail = cert.detail || cert.issuer || '';
      const cYear = cert.year ? ` (${cert.year})` : '';
      return `
      <div style="margin-bottom:6px; font-size:8pt;">
        <div style="font-weight:bold; color:${sidebarText};">${esc(cName)}</div>
        <div style="color:${sidebarMuted}; font-size:7.5pt;">${esc(cDetail)}${esc(cYear)}</div>
      </div>
    `;
    })
    .join('');

  // Render Work Experience HTML
  const workExpHtml = (data.work_experience || [])
    .map((exp: any) => {
      const role = exp.position || exp.role || '';
      const company = exp.company || '';
      const period = exp.period || '';
      const achievements: string[] = exp.highlights || exp.key_achievements || [];

      return `
      <div style="margin-bottom:12px; page-break-inside:avoid;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-bottom:2px;">
          <tr>
            <td align="left" style="font-size:10.5pt; font-weight:bold; color:${primaryColor};">
              ${esc(role)}
            </td>
            <td align="right" style="font-size:8.5pt; font-weight:bold; color:${accentColor}; text-align:right;">
              ${esc(period)}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="font-size:9pt; color:#475569; font-style:italic; padding-bottom:4px;">
              ${esc(company)}
            </td>
          </tr>
        </table>
        <ul style="margin:2px 0 6px 16px; padding:0; font-size:8.5pt; color:#334155; line-height:1.45;">
          ${achievements.map((ach) => `<li style="margin-bottom:2px;">${esc(ach)}</li>`).join('')}
        </ul>
      </div>
    `;
    })
    .join('');

  // Render Portfolio HTML
  const portfolioHtml = (data.digital_portfolio || [])
    .map((port: any) => {
      const pName = port.project_name || '';
      const pLink = port.link ? `<span style="font-size:8pt; font-weight:normal; color:${accentColor};"> (${esc(port.link)})</span>` : '';
      const pDesc = port.description || '';
      const pTech: string[] = port.tech_used || port.tech_stack || [];

      return `
      <div style="margin-bottom:10px; page-break-inside:avoid;">
        <div style="font-size:9.5pt; font-weight:bold; color:${primaryColor};">
          ${esc(pName)}${pLink}
        </div>
        <div style="font-size:8.5pt; color:#334155; margin-top:2px; line-height:1.4;">
          ${esc(pDesc)}
        </div>
        ${
          pTech.length > 0
            ? `<div style="font-size:7.5pt; color:#64748b; margin-top:2px;"><strong>Tech:</strong> ${pTech.map(esc).join(', ')}</div>`
            : ''
        }
      </div>
    `;
    })
    .join('');

  // Render Education HTML
  const educationHtml = (data.education || [])
    .map((edu: any) => {
      const deg = edu.degree || '';
      const inst = edu.institution || '';
      const yr = edu.year || '';
      const det = edu.details || '';

      return `
      <div style="margin-bottom:8px; page-break-inside:avoid;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="left" style="font-size:9.5pt; font-weight:bold; color:${primaryColor};">
              ${esc(deg)}
            </td>
            <td align="right" style="font-size:8.5pt; font-weight:bold; color:${accentColor}; text-align:right;">
              ${esc(yr)}
            </td>
          </tr>
        </table>
        <div style="font-size:8.5pt; color:#475569; font-weight:600;">${esc(inst)}</div>
        ${det ? `<div style="font-size:8pt; color:#64748b; font-style:italic; margin-top:2px;">${esc(det)}</div>` : ''}
      </div>
    `;
    })
    .join('');

  // Render References HTML
  const referencesHtml =
    data.references && data.references.length > 0
      ? `
      <div style="margin-top:14px; page-break-inside:avoid;">
        <div style="font-size:10pt; font-weight:bold; color:${primaryColor}; border-bottom:1.5px solid ${accentColor}; padding-bottom:3px; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">
          ${labels.references}
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
          ${data.references
            .map(
              (ref: any) => `
            <tr>
              <td style="padding-bottom:6px; font-size:8.5pt;">
                <strong style="color:${primaryColor};">${esc(ref.name)}</strong>
                <span style="color:#64748b;"> | ${esc(ref.title)}</span>
                <span style="color:${accentColor}; font-weight:600;"> (${esc(ref.contact_info)})</span>
              </td>
            </tr>
          `
            )
            .join('')}
        </table>
      </div>
    `
      : '';

  // Return Full HTML document dengan XML namespace Word
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>CV_${esc(data.personal_info.name)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
      <w:DrawingGridHorizontalSpacing>6 pt</w:DrawingGridHorizontalSpacing>
      <w:DrawingGridVerticalSpacing>6 pt</w:DrawingGridVerticalSpacing>
      <w:DisplayHorizontalDrawingGridEvery>0</w:DisplayHorizontalDrawingGridEvery>
      <w:DisplayVerticalDrawingGridEvery>2</w:DisplayVerticalDrawingGridEvery>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 210mm 297mm; /* A4 */
      margin: 10mm 10mm 10mm 10mm;
      mso-header-margin: 36pt;
      mso-footer-margin: 36pt;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      color: #1e293b;
    }
    table.cv-native-table {
      width: 100%;
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      margin: 0;
      padding: 0;
    }
    td.sidebar-cell {
      width: 32%;
      background-color: ${sidebarBg};
      color: ${sidebarText};
      vertical-align: top;
      padding: 16px 14px;
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
    }
    td.main-cell {
      width: 68%;
      background-color: #ffffff;
      color: #1e293b;
      vertical-align: top;
      padding: 16px 20px;
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
    }
    .sidebar-heading {
      font-size: 9pt;
      font-weight: bold;
      color: ${sidebarHeading};
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 14px;
      margin-bottom: 6px;
      border-bottom: 1px solid ${accentColor};
      padding-bottom: 3px;
    }
    .main-heading {
      font-size: 10.5pt;
      font-weight: bold;
      color: ${primaryColor};
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-top: 14px;
      margin-bottom: 8px;
      border-bottom: 1.5px solid ${accentColor};
      padding-bottom: 3px;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- TABEL UTAMA 2-KOLOM (NATIVE 32% SIDEBAR & 68% MAIN CONTENT) -->
    <table class="cv-native-table" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
      <tr>
        <!-- ================= KOLOM KIRI: SIDEBAR (~32%) ================= -->
        <td class="sidebar-cell" width="32%" valign="top" style="width:32%; background-color:${sidebarBg}; color:${sidebarText}; vertical-align:top; padding:16px 14px;">
          
          <!-- Inisial / Nama Singkat Sidebar -->
          <div style="text-align:center; margin-bottom:14px;">
            <div style="display:inline-block; width:52px; height:52px; line-height:52px; text-align:center; border-radius:50%; background-color:${accentColor}; color:#ffffff; font-size:18pt; font-weight:bold; font-family:Arial, sans-serif;">
              ${esc(data.personal_info.name ? data.personal_info.name.charAt(0) : 'CV')}
            </div>
            <div style="font-size:11.5pt; font-weight:bold; color:${sidebarHeading}; margin-top:8px; line-height:1.2;">
              ${esc(data.personal_info.name)}
            </div>
            <div style="font-size:8pt; color:${accentColor}; font-weight:600; margin-top:2px;">
              ${esc(data.personal_info.title)}
            </div>
          </div>

          <!-- KONTAK -->
          <div class="sidebar-heading">${labels.contact}</div>
          <div style="font-size:8pt; line-height:1.5; color:${sidebarMuted};">
            ${data.personal_info.contact.phone ? `<div><strong style="color:${sidebarText};">${labels.phone}:</strong> ${esc(data.personal_info.contact.phone)}</div>` : ''}
            ${data.personal_info.contact.email ? `<div><strong style="color:${sidebarText};">${labels.email}:</strong> ${esc(data.personal_info.contact.email)}</div>` : ''}
            ${data.personal_info.contact.address ? `<div><strong style="color:${sidebarText};">${labels.location}:</strong> ${esc(data.personal_info.contact.address)}</div>` : ''}
            ${data.personal_info.contact.linkedin ? `<div><strong style="color:${sidebarText};">LinkedIn:</strong> ${esc(data.personal_info.contact.linkedin)}</div>` : ''}
            ${data.personal_info.contact.github ? `<div><strong style="color:${sidebarText};">GitHub:</strong> ${esc(data.personal_info.contact.github)}</div>` : ''}
          </div>

          <!-- KEAHLIAN INTI -->
          ${data.core_skills && data.core_skills.length > 0 ? `
            <div class="sidebar-heading">${labels.coreSkills}</div>
            <div style="line-height:1.8;">
              ${coreSkillsHtml}
            </div>
          ` : ''}

          <!-- TECH STACK -->
          ${data.tech_stack && data.tech_stack.length > 0 ? `
            <div class="sidebar-heading">${labels.techStack}</div>
            ${techStackHtml}
          ` : ''}

          <!-- BAHASA -->
          ${data.languages && data.languages.length > 0 ? `
            <div class="sidebar-heading">${labels.languages}</div>
            ${languagesHtml}
          ` : ''}

          <!-- SERTIFIKASI -->
          ${data.certifications && data.certifications.length > 0 ? `
            <div class="sidebar-heading">${labels.certifications}</div>
            ${certsHtml}
          ` : ''}

        </td>

        <!-- ================= KOLOM KANAN: MAIN CONTENT (~68%) ================= -->
        <td class="main-cell" width="68%" valign="top" style="width:68%; background-color:#ffffff; color:#1e293b; vertical-align:top; padding:16px 20px;">
          
          <!-- Header Utama Kandidat -->
          <div style="border-bottom:2px solid ${primaryColor}; padding-bottom:10px; margin-bottom:12px;">
            <div style="font-size:18pt; font-weight:bold; color:${primaryColor}; letter-spacing:-0.3px; line-height:1.2;">
              ${esc(data.personal_info.name)}
            </div>
            <div style="font-size:10.5pt; font-weight:bold; color:${accentColor}; margin-top:2px;">
              ${esc(data.personal_info.title)}
            </div>
          </div>

          <!-- RINGKASAN PROFESIONAL -->
          ${data.personal_info.summary ? `
            <div class="main-heading" style="margin-top:0;">${labels.summary}</div>
            <div style="font-size:8.5pt; color:#334155; line-height:1.5; text-align:justify; margin-bottom:12px;">
              ${esc(data.personal_info.summary)}
            </div>
          ` : ''}

          <!-- PENGALAMAN KERJA -->
          ${data.work_experience && data.work_experience.length > 0 ? `
            <div class="main-heading">${labels.workExp}</div>
            ${workExpHtml}
          ` : ''}

          <!-- PORTOFOLIO & PROYEK -->
          ${data.digital_portfolio && data.digital_portfolio.length > 0 ? `
            <div class="main-heading">${labels.portfolio}</div>
            ${portfolioHtml}
          ` : ''}

          <!-- PENDIDIKAN FORMAL -->
          ${data.education && data.education.length > 0 ? `
            <div class="main-heading">${labels.education}</div>
            ${educationHtml}
          ` : ''}

          <!-- REFERENSI PROFESIONAL -->
          ${referencesHtml}

        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * ============================================================================
 * 2. PEMBUATAN BLOB WORD (NATIVE OPENXML .DOCX & MSO XML BLOB)
 * ============================================================================
 */

/**
 * Menghasilkan file Word HTML Document Blob yang dapat dibuka langsung di MS Word
 * dengan mempertahankan tata letak tabel 2-kolom dan CSS inline.
 */
export function generateWordHtmlBlob(
  data: CVData,
  themeId: string = 'navy-gold',
  sidebarTheme: 'light' | 'dark' = 'dark',
  badgeTheme: 'light' | 'dark' = 'dark'
): Blob {
  const htmlContent = generateDocxHTML(data, themeId, sidebarTheme, badgeTheme);
  return new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
}

/**
 * ============================================================================
 * 2. ENGINE GENERATOR DOCX NATIVE BERBASIS DOCX.JS
 * ============================================================================
 * Membangun dokumen Word .docx native 2-kolom A4 (32% sidebar, 68% main content)
 * menggunakan library 'docx' dengan spasi paragraf terkontrol (line: 276, before: 120, after: 120),
 * font standar Word (Calibri), border tersembunyi (TableBorders.NONE), dan margin A4 567 DXA.
 */

const FONT_FAMILY = 'Calibri';
const DEFAULT_PARAGRAPH_SPACING = { line: 276, before: 120, after: 120 };
const SECTION_HEADING_SPACING = { line: 276, before: 240, after: 80 };
const LIST_ITEM_SPACING = { line: 276, before: 40, after: 40 };

export function buildDocxDocument(
  data: CVData,
  themeId: string = 'navy-gold',
  sidebarTheme: 'light' | 'dark' = 'dark',
  badgeTheme: 'light' | 'dark' = 'dark'
): Document {
  const currentTheme = CV_THEMES[themeId] || CV_THEMES['navy-gold'];

  // Warna Hex tema (tanpa '#')
  const primaryHex = (currentTheme.vars.primary || '#182634').replace('#', '');
  const accentHex = (currentTheme.vars.accent || '#C08A3E').replace('#', '');
  const sidebarBgHex = (sidebarTheme === 'light' ? '#F4F6F8' : '#182634').replace('#', '');
  const sidebarTextHex = sidebarTheme === 'light' ? '1E293B' : 'FFFFFF';
  const sidebarMutedHex = sidebarTheme === 'light' ? '64748B' : 'CBD5E1';

  const isEn = data.language === 'en';
  const labels = {
    contact: isEn ? 'CONTACT' : 'KONTAK',
    phone: isEn ? 'Phone: ' : 'Telp: ',
    email: 'Email: ',
    location: isEn ? 'Location: ' : 'Lokasi: ',
    coreSkills: isEn ? 'CORE SKILLS' : 'KEAHLIAN INTI',
    techStack: 'TECH STACK',
    languages: isEn ? 'LANGUAGES' : 'BAHASA',
    certifications: isEn ? 'CERTIFICATIONS' : 'SERTIFIKASI',
    summary: isEn ? 'PROFESSIONAL SUMMARY' : 'RINGKASAN PROFESIONAL',
    workExp: isEn ? 'WORK EXPERIENCE' : 'PENGALAMAN KERJA',
    portfolio: isEn ? 'DIGITAL PORTFOLIO & PROJECTS' : 'PORTOFOLIO DIGITAL & PROYEK',
    education: isEn ? 'FORMAL EDUCATION' : 'PENDIDIKAN FORMAL',
    references: isEn ? 'PROFESSIONAL REFERENCES' : 'REFERENSI PROFESIONAL',
  };

  const candidateName = (data.personal_info as any).full_name || data.personal_info.name || 'Candidate';

  // --------------------------------------------------------------------------
  // CELL 1: SIDEBAR ELEMENTS (Width 32% / 3,447 DXA)
  // Shading: #F4F6F8 (light) atau #182634 (dark)
  // --------------------------------------------------------------------------
  const sidebarElements: Paragraph[] = [
    // Avatar Initial Placeholder
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 276, before: 80, after: 80 },
      children: [
        new TextRun({
          text: `[ ${candidateName.charAt(0)} ]`,
          bold: true,
          size: 36,
          color: accentHex,
          font: FONT_FAMILY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 276, before: 0, after: 40 },
      children: [
        new TextRun({
          text: candidateName,
          bold: true,
          size: 22,
          color: sidebarTextHex,
          font: FONT_FAMILY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 276, before: 0, after: 160 },
      children: [
        new TextRun({
          text: data.personal_info.title,
          size: 16,
          bold: true,
          color: accentHex,
          font: FONT_FAMILY,
        }),
      ],
    }),

    // SECTION: KONTAK
    new Paragraph({
      spacing: SECTION_HEADING_SPACING,
      children: [
        new TextRun({
          text: labels.contact,
          bold: true,
          size: 18,
          color: accentHex,
          font: FONT_FAMILY,
        }),
      ],
    }),
  ];

  if (data.personal_info.contact.phone) {
    sidebarElements.push(
      new Paragraph({
        spacing: LIST_ITEM_SPACING,
        children: [
          new TextRun({ text: labels.phone, bold: true, size: 15, color: sidebarTextHex, font: FONT_FAMILY }),
          new TextRun({ text: data.personal_info.contact.phone, size: 15, color: sidebarMutedHex, font: FONT_FAMILY }),
        ],
      })
    );
  }

  if (data.personal_info.contact.email) {
    sidebarElements.push(
      new Paragraph({
        spacing: LIST_ITEM_SPACING,
        children: [
          new TextRun({ text: labels.email, bold: true, size: 15, color: sidebarTextHex, font: FONT_FAMILY }),
          new TextRun({ text: data.personal_info.contact.email, size: 15, color: sidebarMutedHex, font: FONT_FAMILY }),
        ],
      })
    );
  }

  if (data.personal_info.contact.address) {
    sidebarElements.push(
      new Paragraph({
        spacing: LIST_ITEM_SPACING,
        children: [
          new TextRun({ text: labels.location, bold: true, size: 15, color: sidebarTextHex, font: FONT_FAMILY }),
          new TextRun({ text: data.personal_info.contact.address, size: 15, color: sidebarMutedHex, font: FONT_FAMILY }),
        ],
      })
    );
  }

  if (data.personal_info.contact.linkedin) {
    sidebarElements.push(
      new Paragraph({
        spacing: LIST_ITEM_SPACING,
        children: [
          new TextRun({ text: 'LinkedIn: ', bold: true, size: 15, color: sidebarTextHex, font: FONT_FAMILY }),
          new TextRun({ text: data.personal_info.contact.linkedin, size: 15, color: sidebarMutedHex, font: FONT_FAMILY }),
        ],
      })
    );
  }

  if (data.personal_info.contact.github) {
    sidebarElements.push(
      new Paragraph({
        spacing: LIST_ITEM_SPACING,
        children: [
          new TextRun({ text: 'GitHub: ', bold: true, size: 15, color: sidebarTextHex, font: FONT_FAMILY }),
          new TextRun({ text: data.personal_info.contact.github, size: 15, color: sidebarMutedHex, font: FONT_FAMILY }),
        ],
      })
    );
  }

  // SECTION: KEAHLIAN INTI
  if (data.core_skills && data.core_skills.length > 0) {
    sidebarElements.push(
      new Paragraph({
        spacing: SECTION_HEADING_SPACING,
        children: [
          new TextRun({
            text: labels.coreSkills,
            bold: true,
            size: 18,
            color: accentHex,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    data.core_skills.forEach((skill: any) => {
      const sName = typeof skill === 'string' ? skill : (skill.skill_name || '');
      const sLevel = typeof skill === 'object' && skill.proficiency_level ? ` (${skill.proficiency_level})` : '';
      sidebarElements.push(
        new Paragraph({
          spacing: LIST_ITEM_SPACING,
          children: [
            new TextRun({ text: '• ', bold: true, size: 15, color: accentHex, font: FONT_FAMILY }),
            new TextRun({ text: `${sName}${sLevel}`, size: 15, color: sidebarTextHex, font: FONT_FAMILY }),
          ],
        })
      );
    });
  }

  // SECTION: TECH STACK
  if (data.tech_stack && data.tech_stack.length > 0) {
    sidebarElements.push(
      new Paragraph({
        spacing: SECTION_HEADING_SPACING,
        children: [
          new TextRun({
            text: labels.techStack,
            bold: true,
            size: 18,
            color: accentHex,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    data.tech_stack.forEach((stack: any) => {
      const cat = stack.category || 'Tech';
      const items = Array.isArray(stack.items)
        ? stack.items.join(' • ')
        : (stack.tool ? `${stack.tool}${stack.description ? ` (${stack.description})` : ''}` : '');

      sidebarElements.push(
        new Paragraph({
          spacing: LIST_ITEM_SPACING,
          children: [
            new TextRun({ text: `${cat}: `, bold: true, size: 14, color: accentHex, font: FONT_FAMILY }),
            new TextRun({ text: items, size: 14, color: sidebarMutedHex, font: FONT_FAMILY }),
          ],
        })
      );
    });
  }

  // SECTION: BAHASA
  if (data.languages && data.languages.length > 0) {
    sidebarElements.push(
      new Paragraph({
        spacing: SECTION_HEADING_SPACING,
        children: [
          new TextRun({
            text: labels.languages,
            bold: true,
            size: 18,
            color: accentHex,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    data.languages.forEach((lang: any) => {
      const lName = lang.language || '';
      const lLevel = lang.level || lang.proficiency || '';
      sidebarElements.push(
        new Paragraph({
          spacing: LIST_ITEM_SPACING,
          children: [
            new TextRun({ text: `${lName}: `, bold: true, size: 15, color: sidebarTextHex, font: FONT_FAMILY }),
            new TextRun({ text: lLevel, size: 15, color: sidebarMutedHex, font: FONT_FAMILY }),
          ],
        })
      );
    });
  }

  // SECTION: SERTIFIKASI
  if (data.certifications && data.certifications.length > 0) {
    sidebarElements.push(
      new Paragraph({
        spacing: SECTION_HEADING_SPACING,
        children: [
          new TextRun({
            text: labels.certifications,
            bold: true,
            size: 18,
            color: accentHex,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    data.certifications.forEach((cert: any) => {
      const cName = cert.name || '';
      const cDetail = cert.detail || cert.issuer || '';
      const cYear = cert.year ? ` (${cert.year})` : '';
      sidebarElements.push(
        new Paragraph({
          spacing: LIST_ITEM_SPACING,
          children: [
            new TextRun({ text: cName, bold: true, size: 14, color: sidebarTextHex, font: FONT_FAMILY }),
            new TextRun({ text: ` - ${cDetail}${cYear}`, size: 13, color: sidebarMutedHex, font: FONT_FAMILY }),
          ],
        })
      );
    });
  }

  // --------------------------------------------------------------------------
  // CELL 2: MAIN CONTENT ELEMENTS (Width 68% / 7,325 DXA)
  // Header Nama, Summary, Pengalaman Kerja, Portofolio, Pendidikan
  // --------------------------------------------------------------------------
  const mainElements: Paragraph[] = [
    // Header Nama Utama
    new Paragraph({
      spacing: { line: 276, before: 60, after: 40 },
      children: [
        new TextRun({
          text: candidateName,
          bold: true,
          size: 34,
          color: primaryHex,
          font: FONT_FAMILY,
        }),
      ],
    }),
    new Paragraph({
      spacing: { line: 276, before: 0, after: 120 },
      children: [
        new TextRun({
          text: data.personal_info.title,
          bold: true,
          size: 20,
          color: accentHex,
          font: FONT_FAMILY,
        }),
      ],
    }),

    // SECTION: RINGKASAN PROFESIONAL
    new Paragraph({
      spacing: SECTION_HEADING_SPACING,
      children: [
        new TextRun({
          text: labels.summary,
          bold: true,
          size: 19,
          color: primaryHex,
          font: FONT_FAMILY,
        }),
      ],
    }),
    new Paragraph({
      spacing: DEFAULT_PARAGRAPH_SPACING,
      children: [
        new TextRun({
          text: data.personal_info.summary,
          size: 18,
          font: FONT_FAMILY,
          color: '334155',
        }),
      ],
    }),

    // SECTION: PENGALAMAN KERJA
    new Paragraph({
      spacing: SECTION_HEADING_SPACING,
      children: [
        new TextRun({
          text: labels.workExp,
          bold: true,
          size: 19,
          color: primaryHex,
          font: FONT_FAMILY,
        }),
      ],
    }),
  ];

  data.work_experience.forEach((exp: any) => {
    const role = exp.position || exp.role || '';
    const company = exp.company || '';
    const period = exp.period || '';
    const achievements: string[] = exp.highlights || exp.key_achievements || [];

    mainElements.push(
      new Paragraph({
        spacing: { line: 276, before: 120, after: 40 },
        children: [
          new TextRun({ text: role, bold: true, size: 18, color: primaryHex, font: FONT_FAMILY }),
          new TextRun({ text: ` | ${company}`, bold: true, size: 16, color: '475569', font: FONT_FAMILY }),
          new TextRun({ text: ` (${period})`, bold: true, size: 15, color: accentHex, font: FONT_FAMILY }),
        ],
      })
    );

    achievements.forEach((ach) => {
      mainElements.push(
        new Paragraph({
          spacing: LIST_ITEM_SPACING,
          children: [
            new TextRun({ text: '• ', size: 15, color: accentHex, font: FONT_FAMILY }),
            new TextRun({ text: ach, size: 15, font: FONT_FAMILY, color: '334155' }),
          ],
        })
      );
    });
  });

  // SECTION: PORTOFOLIO & PROYEK
  if (data.digital_portfolio && data.digital_portfolio.length > 0) {
    mainElements.push(
      new Paragraph({
        spacing: SECTION_HEADING_SPACING,
        children: [
          new TextRun({
            text: labels.portfolio,
            bold: true,
            size: 19,
            color: primaryHex,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    data.digital_portfolio.forEach((proj: any) => {
      const pName = proj.project_name || '';
      const pLink = proj.link ? ` (${proj.link})` : '';
      const pDesc = proj.description || '';

      mainElements.push(
        new Paragraph({
          spacing: { line: 276, before: 100, after: 30 },
          children: [
            new TextRun({ text: pName, bold: true, size: 17, color: primaryHex, font: FONT_FAMILY }),
            new TextRun({ text: pLink, size: 14, color: accentHex, font: FONT_FAMILY }),
          ],
        }),
        new Paragraph({
          spacing: DEFAULT_PARAGRAPH_SPACING,
          children: [
            new TextRun({ text: pDesc, size: 15, font: FONT_FAMILY, color: '334155' }),
          ],
        })
      );
    });
  }

  // SECTION: PENDIDIKAN FORMAL
  if (data.education && data.education.length > 0) {
    mainElements.push(
      new Paragraph({
        spacing: SECTION_HEADING_SPACING,
        children: [
          new TextRun({
            text: labels.education,
            bold: true,
            size: 19,
            color: primaryHex,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    data.education.forEach((edu: any) => {
      const deg = edu.degree || '';
      const inst = edu.institution || '';
      const yr = edu.year ? ` (${edu.year})` : '';
      const det = edu.details || '';

      mainElements.push(
        new Paragraph({
          spacing: { line: 276, before: 80, after: 30 },
          children: [
            new TextRun({ text: deg, bold: true, size: 17, color: primaryHex, font: FONT_FAMILY }),
            new TextRun({ text: ` - ${inst}`, bold: true, size: 16, color: '475569', font: FONT_FAMILY }),
            new TextRun({ text: yr, bold: true, size: 15, color: accentHex, font: FONT_FAMILY }),
          ],
        })
      );
      if (det) {
        mainElements.push(
          new Paragraph({
            spacing: { line: 276, before: 20, after: 60 },
            children: [
              new TextRun({ text: det, size: 14, font: FONT_FAMILY, color: '64748B', italics: true }),
            ],
          })
        );
      }
    });
  }

  // SECTION: REFERENSI
  if (data.references && data.references.length > 0) {
    mainElements.push(
      new Paragraph({
        spacing: SECTION_HEADING_SPACING,
        children: [
          new TextRun({
            text: labels.references,
            bold: true,
            size: 19,
            color: primaryHex,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    data.references.forEach((ref: any) => {
      mainElements.push(
        new Paragraph({
          spacing: LIST_ITEM_SPACING,
          children: [
            new TextRun({ text: ref.name, bold: true, size: 16, color: primaryHex, font: FONT_FAMILY }),
            new TextRun({ text: ` | ${ref.title}`, size: 15, color: '475569', font: FONT_FAMILY }),
            new TextRun({ text: ` (${ref.contact_info})`, size: 14, color: accentHex, font: FONT_FAMILY }),
          ],
        })
      );
    });
  }

  // --------------------------------------------------------------------------
  // TABEL 2-KOLOM A4 BERBASIS DOCX NATIVE (DOCX.JS)
  // Total Width: 10,772 DXA (Printable Width A4)
  // Column 1 (Sidebar): 3,447 DXA (32%)
  // Column 2 (Main): 7,325 DXA (68%)
  // Borders: docx.TableBorders.NONE
  // --------------------------------------------------------------------------
  const SIDEBAR_WIDTH_DXA = 3447;
  const MAIN_WIDTH_DXA = 7325;
  const TOTAL_WIDTH_DXA = SIDEBAR_WIDTH_DXA + MAIN_WIDTH_DXA;

  const table = new Table({
    width: {
      size: TOTAL_WIDTH_DXA,
      type: WidthType.DXA,
    },
    columnWidths: [SIDEBAR_WIDTH_DXA, MAIN_WIDTH_DXA],
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          // Cell 1: Sidebar (Width 32% / 3,447 DXA)
          new TableCell({
            width: {
              size: SIDEBAR_WIDTH_DXA,
              type: WidthType.DXA,
            },
            shading: {
              fill: sidebarBgHex,
            },
            margins: {
              top: 240,
              bottom: 240,
              left: 200,
              right: 200,
            },
            children: sidebarElements,
          }),
          // Cell 2: Main Content (Width 68% / 7,325 DXA, padding kiri 200 DXA)
          new TableCell({
            width: {
              size: MAIN_WIDTH_DXA,
              type: WidthType.DXA,
            },
            margins: {
              top: 240,
              bottom: 240,
              left: 200, // padding kiri 200 DXA agar ada jarak antar kolom
              right: 200,
            },
            children: mainElements,
          }),
        ],
      }),
    ],
  });

  // Dokumen dengan Margin A4 Resmi 567 DXA (~10mm) & Spasi Default
  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: 20, // 10pt default
          },
          paragraph: {
            spacing: DEFAULT_PARAGRAPH_SPACING,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // 210mm A4
              height: 16838, // 297mm A4
            },
            margin: {
              top: 567,
              right: 567,
              bottom: 567,
              left: 567,
            },
          },
        },
        children: [table],
      },
    ],
  });
}

/**
 * Menghasilkan file Microsoft Word (.docx) murni berbasis OpenXML
 * dengan tipe MIME eksplisit:
 * 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
 */
export async function generateDocxBlob(
  data: CVData,
  themeId: string = 'navy-gold',
  sidebarTheme: 'light' | 'dark' = 'dark',
  badgeTheme: 'light' | 'dark' = 'dark'
): Promise<Blob> {
  const doc = buildDocxDocument(data, themeId, sidebarTheme, badgeTheme);
  const rawBlob = await Packer.toBlob(doc);
  return new Blob([rawBlob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/**
 * ============================================================================
 * FUNGSI UTAMA: generateAndDownloadDocx(cvData)
 * ============================================================================
 * 1. Paksa MIME Type:
 *    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
 * 2. Ekstensi eksplisit: CV_${name}.docx
 * 3. Tabel 2-Kolom (32% Sidebar / 68% Main Content)
 * 4. Kontrol spasi: { line: 276, before: 120, after: 120 }
 * 5. Download via file-saver (saveAs) dengan fallback link <a>
 */
export async function generateAndDownloadDocx(
  data: CVData,
  themeId: string = 'navy-gold',
  sidebarTheme: 'light' | 'dark' = 'dark',
  badgeTheme: 'light' | 'dark' = 'dark'
): Promise<void> {
  const docxBlob = await generateDocxBlob(data, themeId, sidebarTheme, badgeTheme);

  // Ambil nama lengkap dari full_name atau name
  const fullName = (data.personal_info as any).full_name || data.personal_info.name || 'Candidate';
  const cleanName = fullName.trim().replace(/\s+/g, '_');
  const fileName = `CV_${cleanName}.docx`;

  try {
    saveAs(docxBlob, fileName);
  } catch (err) {
    console.warn('saveAs failed, falling back to anchor click', err);
    const url = URL.createObjectURL(docxBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

/**
 * Handler ekspor berkas dokumen Word (.docx / .doc)
 */
export async function downloadDocxFile(
  data: CVData,
  themeId: string = 'navy-gold',
  options: {
    sidebarTheme?: 'light' | 'dark';
    badgeTheme?: 'light' | 'dark';
    format?: 'docx' | 'doc';
  } = {}
): Promise<void> {
  const { sidebarTheme = 'dark', badgeTheme = 'dark', format = 'docx' } = options;
  const fullName = (data.personal_info as any).full_name || data.personal_info.name || 'Candidate';
  const cleanName = fullName.trim().replace(/\s+/g, '_');

  if (format === 'doc') {
    const blob = generateWordHtmlBlob(data, themeId, sidebarTheme, badgeTheme);
    const fileName = `CV_${cleanName}.doc`;
    saveAs(blob, fileName);
  } else {
    await generateAndDownloadDocx(data, themeId, sidebarTheme, badgeTheme);
  }
}

/**
 * ============================================================================
 * 4. OPSI ALTERNATIF: PYTHON-DOCX BACKEND SCRIPT
 * ============================================================================
 * Skrip Python siap pakai menggunakan library `python-docx` untuk membuat
 * tabel 1-baris 2-kolom (32% & 68%) dengan shading sidebar Navy/Grey.
 */
export const PYTHON_DOCX_SCRIPT = `# ==============================================================================
# BACKEND PYTHON-DOCX CV GENERATOR (A4 2-COLUMN NATIVE TABLE)
# Instalasi: pip install python-docx
# ==============================================================================
import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def generate_cv_docx(json_data_path: str, output_path: str = "CV_Export.docx"):
    # 1. Baca data JSON
    with open(json_data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 2. Inisialisasi dokumen baru & konfigurasi A4 Margin 10mm (0.393 inch)
    doc = Document()
    for section in doc.sections:
        section.page_width = Inches(8.27)    # 210mm A4
        section.page_height = Inches(11.69)  # 297mm A4
        section.top_margin = Inches(0.39)
        section.bottom_margin = Inches(0.39)
        section.left_margin = Inches(0.39)
        section.right_margin = Inches(0.39)

    # 3. Hitung lebar area cetak (Total width: 7.49 inches)
    total_printable_width = Inches(7.49)
    sidebar_width = total_printable_width * 0.32  # 32% (~2.40 inches)
    main_width = total_printable_width * 0.68     # 68% (~5.09 inches)

    # 4. Tambah Tabel 1-Row 2-Column Native
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Hilangkan border tabel agar presisi
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(
        r'<w:tblBorders %s><w:top w:val="none"/><w:left w:val="none"/>'
        r'<w:bottom w:val="none"/><w:right w:val="none"/>'
        r'<w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders>' % nsdecls('w')
    )
    tblPr.append(tblBorders)

    row = table.rows[0]
    cell_sidebar = row.cells[0]
    cell_main = row.cells[1]

    # Tetapkan lebar kolom
    cell_sidebar.width = sidebar_width
    cell_main.width = main_width
    table.columns[0].width = sidebar_width
    table.columns[1].width = main_width

    # 5. Shading Cell Sidebar (Deep Navy: #182634 / Slate Grey: #F4F6F8)
    shd = parse_xml(r'<w:shd %s w:fill="182634"/>' % nsdecls('w'))
    cell_sidebar._tc.get_or_add_tcPr().append(shd)

    # Padding internal sel (dxa)
    tcMar = parse_xml(r'<w:tcMar %s><w:top w:w="240" w:type="dxa"/><w:bottom w:w="240" w:type="dxa"/><w:left w:w="240" w:type="dxa"/><w:right w:w="240" w:type="dxa"/></w:tcMar>' % nsdecls('w'))
    cell_sidebar._tc.get_or_add_tcPr().append(tcMar)

    # 6. Konten Sidebar Kiri
    p_side = cell_sidebar.paragraphs[0]
    p_side.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_avatar = p_side.add_run(f"[{data['personal_info']['name'][0]}]\\n")
    r_avatar.font.size = Pt(28)
    r_avatar.font.bold = True
    r_avatar.font.color.rgb = RGBColor(229, 169, 60) # E5A93C Accent

    r_side_name = p_side.add_run(f"{data['personal_info']['name']}\\n")
    r_side_name.font.size = Pt(12)
    r_side_name.font.bold = True
    r_side_name.font.color.rgb = RGBColor(255, 255, 255)

    r_side_title = p_side.add_run(f"{data['personal_info']['title']}\\n")
    r_side_title.font.size = Pt(9)
    r_side_title.font.color.rgb = RGBColor(229, 169, 60)

    # Kontak di Sidebar
    p_contact = cell_sidebar.add_paragraph()
    r_c_head = p_contact.add_run("KONTAK\\n")
    r_c_head.font.bold = True
    r_c_head.font.size = Pt(10)
    r_c_head.font.color.rgb = RGBColor(229, 169, 60)
    
    for k, v in data['personal_info']['contact'].items():
        if v:
            r_item = p_contact.add_run(f"{k.capitalize()}: {v}\\n")
            r_item.font.size = Pt(8.5)
            r_item.font.color.rgb = RGBColor(203, 213, 225)

    # 7. Konten Utama Kanan
    p_main = cell_main.paragraphs[0]
    r_name = p_main.add_run(f"{data['personal_info']['name']}\\n")
    r_name.font.size = Pt(20)
    r_name.font.bold = True
    r_name.font.color.rgb = RGBColor(24, 38, 52)

    r_title = p_main.add_run(f"{data['personal_info']['title']}\\n")
    r_title.font.size = Pt(12)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(192, 138, 62)

    p_summary_head = cell_main.add_paragraph()
    r_s_head = p_summary_head.add_run("RINGKASAN PROFESIONAL")
    r_s_head.font.bold = True
    r_s_head.font.size = Pt(11)
    r_s_head.font.color.rgb = RGBColor(24, 38, 52)

    p_summary = cell_main.add_paragraph(data['personal_info']['summary'])
    p_summary.runs[0].font.size = Pt(9)
    p_summary.runs[0].font.color.rgb = RGBColor(51, 65, 85)

    # Simpan berkas Word
    doc.save(output_path)
    print(f"[OK] Berkas .docx berhasil digenerate: {output_path}")

if __name__ == "__main__":
    import sys
    json_path = sys.argv[1] if len(sys.argv) > 1 else "cv_data.json"
    generate_cv_docx(json_path)
`;
