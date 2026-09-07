import { CVData, WorkExperience, DigitalPortfolioItem, Education, LanguageItem, Certification, CoreSkill, TechStackItem } from './types';

export type SpacingDensity = 'compact' | 'normal' | 'spacious';
export type LayoutPageMode = 'auto' | '1-page' | '2-page';

export interface PageSidebarContent {
  showPhoto: boolean;
  showContact: boolean;
  showMiniHeader?: boolean;
  coreSkills: CoreSkill[];
  techStack: TechStackItem[];
  languages: LanguageItem[];
  certifications: Certification[];
}

export interface PageMainContent {
  showHeader: boolean;
  showSummary: boolean;
  showContinuationHeader?: boolean;
  workExperience: WorkExperience[];
  workExperienceIsContinuation?: boolean;
  digitalPortfolio: DigitalPortfolioItem[];
  portfolioIsContinuation?: boolean;
  education: Education[];
  references: { name: string; title: string; contact_info: string }[];
}

export interface CvPageData {
  pageNumber: number;
  totalPages: number;
  sidebar: PageSidebarContent;
  main: PageMainContent;
}

/**
 * Menghitung perkiraan tinggi konten (dalam arbitrary units / mm)
 * untuk menentukan apakah konten secara alami muat dalam 1 halaman A4 atau butuh 2 halaman.
 */
export function estimateCvContentHeight(data: CVData): number {
  let score = 0;

  // Header & Summary
  score += 35; // Name, title, spacing
  if (data.personal_info.summary) {
    score += 15 + Math.min(35, Math.ceil(data.personal_info.summary.length / 55) * 4);
  }

  // Pengalaman Kerja
  if (data.work_experience && data.work_experience.length > 0) {
    score += 12; // Header section
    data.work_experience.forEach(exp => {
      score += 16; // Title, company, period
      score += (exp.highlights || []).length * 5; // Highlight bullets
    });
  }

  // Portofolio Digital
  if (data.digital_portfolio && data.digital_portfolio.length > 0) {
    score += 12; // Header section
    data.digital_portfolio.forEach(p => {
      score += 18; // Project name, tech badges, link
      if (p.description) {
        score += Math.min(15, Math.ceil(p.description.length / 60) * 4);
      }
    });
  }

  // Pendidikan
  if (data.education && data.education.length > 0) {
    score += 10;
    score += data.education.length * 12;
  }

  // Referensi
  if (data.references && data.references.length > 0) {
    score += 10;
    score += Math.ceil(data.references.length / 2) * 16;
  }

  return score;
}

/**
 * Menentukan jumlah halaman otomatis berdasarkan isi data dan densitas spasi
 */
export function calculateAutoPageCount(data: CVData, density: SpacingDensity = 'normal'): number {
  const score = estimateCvContentHeight(data);
  const workCount = (data.work_experience || []).length;
  const portCount = (data.digital_portfolio || []).length;
  const techCount = (data.tech_stack || []).length;

  // Ambang batas 1 halaman A4 adalah ~240 unit
  let threshold = 230;
  if (density === 'compact') threshold = 260;
  if (density === 'spacious') threshold = 205;

  // Indikator kuat multi-halaman
  if (workCount >= 4 && portCount >= 2) return 2;
  if (workCount >= 5) return 2;
  if (portCount >= 5) return 2;
  if (score > threshold) return 2;

  return 1;
}

/**
 * Mempartisi data CV ke dalam 1 atau 2 halaman dengan pembagian section
 * yang cerdas sehingga TIDAK ADA card, paragraf, atau node yang terpotong di tengah lembar.
 */
export function partitionCvData(
  data: CVData,
  mode: LayoutPageMode = 'auto',
  density: SpacingDensity = 'normal'
): CvPageData[] {
  const effectivePages = mode === 'auto' 
    ? calculateAutoPageCount(data, density) 
    : (mode === '2-page' ? 2 : 1);

  // KASUS 1: Single Page (1 Halaman Penuh)
  if (effectivePages === 1) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        sidebar: {
          showPhoto: true,
          showContact: true,
          coreSkills: data.core_skills || [],
          techStack: data.tech_stack || [],
          languages: data.languages || [],
          certifications: data.certifications || []
        },
        main: {
          showHeader: true,
          showSummary: true,
          workExperience: data.work_experience || [],
          digitalPortfolio: data.digital_portfolio || [],
          education: data.education || [],
          references: data.references || []
        }
      }
    ];
  }

  // KASUS 2: Two Pages (2 Halaman Terpisah dengan Batas Rapi)
  const workExp = data.work_experience || [];
  const portfolio = data.digital_portfolio || [];
  const techStack = data.tech_stack || [];
  const languages = data.languages || [];
  const certifications = data.certifications || [];
  const education = data.education || [];
  const references = data.references || [];

  // ==========================================
  // DISTRIBUSI KONTEN UTAMA (MAIN CONTENT)
  // ==========================================
  let p1WorkExp: WorkExperience[] = [];
  let p2WorkExp: WorkExperience[] = [];
  let p1Portfolio: DigitalPortfolioItem[] = [];
  let p2Portfolio: DigitalPortfolioItem[] = [];

  if (workExp.length <= 5) {
    // 1-5 pekerjaan muat dengan nyaman di Halaman 1
    p1WorkExp = workExp;
    p2WorkExp = [];
    // Seluruh portofolio masuk ke Halaman 2 sebagai showcase utama
    p1Portfolio = [];
    p2Portfolio = portfolio;
  } else {
    // Jika pekerjaan sangat banyak (> 5), bagi pekerjaan
    p1WorkExp = workExp.slice(0, 4);
    p2WorkExp = workExp.slice(4);
    p1Portfolio = [];
    p2Portfolio = portfolio;
  }

  // ==========================================
  // DISTRIBUSI SIDEBAR
  // ==========================================
  // Halaman 1: Foto + Kontak + Keahlian Inti + Sebagian Tech Stack (3 item pertama)
  // Halaman 2: Mini Header + Sisa Tech Stack + Bahasa + Sertifikasi
  let p1Tech: TechStackItem[] = [];
  let p2Tech: TechStackItem[] = [];

  if (techStack.length <= 3) {
    p1Tech = techStack;
    p2Tech = [];
  } else {
    p1Tech = techStack.slice(0, 3);
    p2Tech = techStack.slice(3);
  }

  const page1: CvPageData = {
    pageNumber: 1,
    totalPages: 2,
    sidebar: {
      showPhoto: true,
      showContact: true,
      showMiniHeader: false,
      coreSkills: data.core_skills || [],
      techStack: p1Tech,
      languages: [], // Pindah ke Halaman 2 agar sidebar Halaman 1 tidak kepenuhan
      certifications: [] // Pindah ke Halaman 2
    },
    main: {
      showHeader: true,
      showSummary: true,
      showContinuationHeader: false,
      workExperience: p1WorkExp,
      workExperienceIsContinuation: false,
      digitalPortfolio: p1Portfolio,
      portfolioIsContinuation: false,
      education: [], // Di Halaman 2
      references: [] // Di Halaman 2
    }
  };

  const page2: CvPageData = {
    pageNumber: 2,
    totalPages: 2,
    sidebar: {
      showPhoto: false,
      showContact: false,
      showMiniHeader: true, // Mini Avatar & Nama untuk identitas lembar ke-2
      coreSkills: [],
      techStack: p2Tech,
      languages: languages,
      certifications: certifications
    },
    main: {
      showHeader: false,
      showSummary: false,
      showContinuationHeader: true,
      workExperience: p2WorkExp,
      workExperienceIsContinuation: p2WorkExp.length > 0,
      digitalPortfolio: p2Portfolio,
      portfolioIsContinuation: false,
      education: education,
      references: references
    }
  };

  return [page1, page2];
}

/**
 * CSS classes dan konfigurasi spasi berdasarkan tingkat kepadatan
 */
export function getDensityStyles(density: SpacingDensity = 'normal') {
  switch (density) {
    case 'compact':
      return {
        paperPadding: '10mm 8mm',
        sidebarGap: 'gap-2.5',
        mainGap: 'gap-2.5',
        sectionHeaderMargin: 'mb-1',
        itemSpacing: 'space-y-1',
        titleSize: 'text-[18pt]',
        subtitleSize: 'text-[10pt]',
        bodyTextSize: 'text-[7.6pt]',
        headingTextSize: 'text-[9.5pt]',
        avatarSize: 'w-24 h-24',
        cardPadding: 'p-1.5'
      };
    case 'spacious':
      return {
        paperPadding: '14mm 11mm',
        sidebarGap: 'gap-4',
        mainGap: 'gap-3.5',
        sectionHeaderMargin: 'mb-1.5',
        itemSpacing: 'space-y-2',
        titleSize: 'text-[21pt]',
        subtitleSize: 'text-[11.5pt]',
        bodyTextSize: 'text-[8.5pt]',
        headingTextSize: 'text-[10.5pt]',
        avatarSize: 'w-28 h-28',
        cardPadding: 'p-2.5'
      };
    case 'normal':
    default:
      return {
        paperPadding: '12mm 10mm',
        sidebarGap: 'gap-3.5',
        mainGap: 'gap-3',
        sectionHeaderMargin: 'mb-1',
        itemSpacing: 'space-y-1.5',
        titleSize: 'text-[20pt]',
        subtitleSize: 'text-[11pt]',
        bodyTextSize: 'text-[8pt]',
        headingTextSize: 'text-[10pt]',
        avatarSize: 'w-28 h-28',
        cardPadding: 'p-2'
      };
  }
}
