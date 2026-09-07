export interface CVSidebarTheme {
  id: 'light' | 'dark';
  name: string;
  bgSidebar: string;
  textMain: string;
  textMuted: string;
  headingColor: string;
  borderSubtle: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  progressBarTrack: string;
  progressBarFill: string;
  description: string;
}

export interface CVBadgeTheme {
  id: 'light' | 'dark';
  name: string;
  bg: string;
  color: string;
  border: string;
  description: string;
}

export interface CVTheme {
  id: string;
  name: string;
  category: string;
  cssClass: string;
  vars: {
    primary: string;
    accent: string;
    bgSidebar: string;
    textDark: string;
    textLight: string;
    borderMuted: string;
  };
  sidebar: {
    light: CVSidebarTheme;
    dark: CVSidebarTheme;
  };
  badges: {
    light: CVBadgeTheme;
    dark: CVBadgeTheme;
  };
}

export const CV_THEMES: Record<string, CVTheme> = {
  'navy-gold': {
    id: 'navy-gold',
    name: 'Navy & Gold (Professional Elegant)',
    category: 'Corporate & Executive',
    cssClass: 'theme-navy-gold',
    vars: {
      primary: '#182634',
      accent: '#C08A3E',
      bgSidebar: '#F4F6F8',
      textDark: '#2C3E50',
      textLight: '#FFFFFF',
      borderMuted: '#E2E8F0',
    },
    sidebar: {
      light: {
        id: 'light',
        name: 'Light Cream / Slate',
        bgSidebar: '#F4F6F8',
        textMain: '#1E293B',
        textMuted: '#64748B',
        headingColor: '#182634',
        borderSubtle: '#E2E8F0',
        iconColor: '#C08A3E',
        badgeBg: 'rgba(192, 138, 62, 0.14)',
        badgeColor: '#182634',
        badgeBorder: '#C08A3E',
        progressBarTrack: '#E2E8F0',
        progressBarFill: 'linear-gradient(90deg, #182634, #C08A3E)',
        description: 'Latar abu-abu/krem terang dengan font gelap kontras tinggi'
      },
      dark: {
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
        description: 'Latar navy gelap pekat dengan font putih terang dan aksen emas'
      }
    },
    badges: {
      light: {
        id: 'light',
        name: 'Light Gold Tint',
        bg: 'rgba(192, 138, 62, 0.14)',
        color: '#182634',
        border: '#C08A3E',
        description: 'Latar emas lembut transparan dengan teks navy gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Navy Solid',
        bg: '#182634',
        color: '#FFFFFF',
        border: '#C08A3E',
        description: 'Latar navy gelap tegas dengan teks putih terang'
      }
    }
  },
  'emerald-slate': {
    id: 'emerald-slate',
    name: 'Emerald & Slate (Modern Tech)',
    category: 'Engineering & GIS Specialist',
    cssClass: 'theme-emerald-slate',
    vars: {
      primary: '#064E3B',
      accent: '#059669',
      bgSidebar: '#F0FDF4',
      textDark: '#1E293B',
      textLight: '#FFFFFF',
      borderMuted: '#D1FAE5',
    },
    sidebar: {
      light: {
        id: 'light',
        name: 'Light Emerald Mint',
        bgSidebar: '#F0FDF4',
        textMain: '#1E293B',
        textMuted: '#475569',
        headingColor: '#064E3B',
        borderSubtle: '#D1FAE5',
        iconColor: '#059669',
        badgeBg: 'rgba(5, 150, 105, 0.14)',
        badgeColor: '#064E3B',
        badgeBorder: '#059669',
        progressBarTrack: '#D1FAE5',
        progressBarFill: 'linear-gradient(90deg, #064E3B, #059669)',
        description: 'Latar hijau mint lembut dengan font gelap kontras'
      },
      dark: {
        id: 'dark',
        name: 'Dark Forest Emerald',
        bgSidebar: '#064E3B',
        textMain: '#FFFFFF',
        textMuted: '#D1FAE5',
        headingColor: '#FFFFFF',
        borderSubtle: 'rgba(255, 255, 255, 0.15)',
        iconColor: '#34D399',
        badgeBg: 'rgba(52, 211, 153, 0.22)',
        badgeColor: '#FFFFFF',
        badgeBorder: '#34D399',
        progressBarTrack: 'rgba(255, 255, 255, 0.22)',
        progressBarFill: 'linear-gradient(90deg, #34D399, #A7F3D0)',
        description: 'Latar hijau emerald hutan pekat dengan font putih terang'
      }
    },
    badges: {
      light: {
        id: 'light',
        name: 'Light Emerald Tint',
        bg: 'rgba(5, 150, 105, 0.14)',
        color: '#064E3B',
        border: '#059669',
        description: 'Latar emerald lembut dengan teks hijau gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Forest Emerald',
        bg: '#064E3B',
        color: '#FFFFFF',
        border: '#10B981',
        description: 'Latar emerald pekat dengan teks putih terang'
      }
    }
  },
  'charcoal-orange': {
    id: 'charcoal-orange',
    name: 'Charcoal & Orange (Creative Agency)',
    category: 'Creative & Digital Agency',
    cssClass: 'theme-charcoal-orange',
    vars: {
      primary: '#1E1E24',
      accent: '#EA580C',
      bgSidebar: '#F8FAFC',
      textDark: '#18181B',
      textLight: '#FFFFFF',
      borderMuted: '#E4E4E7',
    },
    sidebar: {
      light: {
        id: 'light',
        name: 'Light Cool Slate',
        bgSidebar: '#F8FAFC',
        textMain: '#18181B',
        textMuted: '#64748B',
        headingColor: '#18181B',
        borderSubtle: '#E4E4E7',
        iconColor: '#EA580C',
        badgeBg: 'rgba(234, 88, 12, 0.14)',
        badgeColor: '#18181B',
        badgeBorder: '#EA580C',
        progressBarTrack: '#E4E4E7',
        progressBarFill: 'linear-gradient(90deg, #1E1E24, #EA580C)',
        description: 'Latar slate lembut dengan font charcoal gelap kontras'
      },
      dark: {
        id: 'dark',
        name: 'Dark Charcoal Onyx',
        bgSidebar: '#18181B',
        textMain: '#FFFFFF',
        textMuted: '#D4D4D8',
        headingColor: '#FFFFFF',
        borderSubtle: 'rgba(255, 255, 255, 0.15)',
        iconColor: '#FB923C',
        badgeBg: 'rgba(251, 146, 60, 0.22)',
        badgeColor: '#FFFFFF',
        badgeBorder: '#FB923C',
        progressBarTrack: 'rgba(255, 255, 255, 0.22)',
        progressBarFill: 'linear-gradient(90deg, #FB923C, #FDBA74)',
        description: 'Latar charcoal gelap pekat dengan font putih terang dan aksen oranye'
      }
    },
    badges: {
      light: {
        id: 'light',
        name: 'Light Orange Tint',
        bg: 'rgba(234, 88, 12, 0.14)',
        color: '#1E1E24',
        border: '#EA580C',
        description: 'Latar amber/oranye lembut dengan teks charcoal gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Charcoal Solid',
        bg: '#1E1E24',
        color: '#FFFFFF',
        border: '#F97316',
        description: 'Latar charcoal pekat dengan teks putih terang'
      }
    }
  }
};
