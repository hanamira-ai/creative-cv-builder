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
        textMain: '#1E293B',
        textMuted: '#64748B',
        headingColor: '#1E1E24',
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
  },
  'burgundy-champagne': {
    id: 'burgundy-champagne',
    name: 'Burgundy & Champagne (Legal & Finance)',
    category: 'Legal, Finance & Executive',
    cssClass: 'theme-burgundy-champagne',
    vars: {
      primary: '#581C2C',
      accent: '#7C5826',
      bgSidebar: '#FAF4EA',
      textDark: '#1E293B',
      textLight: '#FFFFFF',
      borderMuted: '#E6D8C5',
    },
    sidebar: {
      light: {
        id: 'light',
        name: 'Light Soft Champagne',
        bgSidebar: '#FAF4EA',
        textMain: '#1E293B',
        textMuted: '#57483A',
        headingColor: '#581C2C',
        borderSubtle: '#E6D8C5',
        iconColor: '#7C5826',
        badgeBg: 'rgba(124, 88, 38, 0.14)',
        badgeColor: '#581C2C',
        badgeBorder: '#7C5826',
        progressBarTrack: '#DFCDBA',
        progressBarFill: 'linear-gradient(90deg, #581C2C, #7C5826)',
        description: 'Latar champagne krem lembut dengan teks burgundy gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Deep Burgundy',
        bgSidebar: '#4A1525',
        textMain: '#FFFFFF',
        textMuted: '#F2E2D2',
        headingColor: '#FFFFFF',
        borderSubtle: 'rgba(255, 255, 255, 0.18)',
        iconColor: '#F3D39C',
        badgeBg: 'rgba(243, 211, 156, 0.22)',
        badgeColor: '#FFFFFF',
        badgeBorder: '#F3D39C',
        progressBarTrack: 'rgba(255, 255, 255, 0.24)',
        progressBarFill: 'linear-gradient(90deg, #F3D39C, #FDF1D6)',
        description: 'Latar burgundy gelap pekat dengan teks putih dan aksen champagne'
      }
    },
    badges: {
      light: {
        id: 'light',
        name: 'Light Champagne Tint',
        bg: 'rgba(124, 88, 38, 0.14)',
        color: '#581C2C',
        border: '#7C5826',
        description: 'Latar champagne lembut dengan teks burgundy gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Burgundy Solid',
        bg: '#581C2C',
        color: '#FFFFFF',
        border: '#C69D5E',
        description: 'Latar burgundy tegas dengan teks putih terang'
      }
    }
  },
  'ocean-coral': {
    id: 'ocean-coral',
    name: 'Ocean Blue & Coral (Tech & Creative)',
    category: 'Product, Tech & Creative',
    cssClass: 'theme-ocean-coral',
    vars: {
      primary: '#0F3460',
      accent: '#B83B28',
      bgSidebar: '#F0F7FC',
      textDark: '#1E293B',
      textLight: '#FFFFFF',
      borderMuted: '#CFE3F2',
    },
    sidebar: {
      light: {
        id: 'light',
        name: 'Light Ocean Mist',
        bgSidebar: '#F0F7FC',
        textMain: '#1E293B',
        textMuted: '#475569',
        headingColor: '#0F3460',
        borderSubtle: '#CFE3F2',
        iconColor: '#B83B28',
        badgeBg: 'rgba(184, 59, 40, 0.13)',
        badgeColor: '#0F3460',
        badgeBorder: '#B83B28',
        progressBarTrack: '#C5DDF0',
        progressBarFill: 'linear-gradient(90deg, #0F3460, #B83B28)',
        description: 'Latar biru kabut lembut dengan teks biru laut gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Deep Ocean',
        bgSidebar: '#0C2D48',
        textMain: '#FFFFFF',
        textMuted: '#D6E8F5',
        headingColor: '#FFFFFF',
        borderSubtle: 'rgba(255, 255, 255, 0.18)',
        iconColor: '#FF9682',
        badgeBg: 'rgba(255, 150, 130, 0.22)',
        badgeColor: '#FFFFFF',
        badgeBorder: '#FF9682',
        progressBarTrack: 'rgba(255, 255, 255, 0.24)',
        progressBarFill: 'linear-gradient(90deg, #FF9682, #FFD2C9)',
        description: 'Latar biru samudra pekat dengan teks putih dan aksen koral'
      }
    },
    badges: {
      light: {
        id: 'light',
        name: 'Light Coral Tint',
        bg: 'rgba(184, 59, 40, 0.13)',
        color: '#0F3460',
        border: '#B83B28',
        description: 'Latar koral lembut dengan teks biru laut gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Ocean Solid',
        bg: '#0F3460',
        color: '#FFFFFF',
        border: '#E0604D',
        description: 'Latar biru laut tegas dengan teks putih terang'
      }
    }
  },
  'forest-cream': {
    id: 'forest-cream',
    name: 'Forest Green & Cream (Eco & Social)',
    category: 'Environment, NGO & Research',
    cssClass: 'theme-forest-cream',
    vars: {
      primary: '#1B4332',
      accent: '#735622',
      bgSidebar: '#F7F3E6',
      textDark: '#1E293B',
      textLight: '#FFFFFF',
      borderMuted: '#E2DAC4',
    },
    sidebar: {
      light: {
        id: 'light',
        name: 'Light Warm Cream',
        bgSidebar: '#F7F3E6',
        textMain: '#1E293B',
        textMuted: '#4A5240',
        headingColor: '#1B4332',
        borderSubtle: '#E2DAC4',
        iconColor: '#735622',
        badgeBg: 'rgba(115, 86, 34, 0.14)',
        badgeColor: '#1B4332',
        badgeBorder: '#735622',
        progressBarTrack: '#DCD1B6',
        progressBarFill: 'linear-gradient(90deg, #1B4332, #735622)',
        description: 'Latar krem hangat lembut dengan teks hijau hutan gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Forest Pine',
        bgSidebar: '#163829',
        textMain: '#FFFFFF',
        textMuted: '#E7E3D3',
        headingColor: '#FFFFFF',
        borderSubtle: 'rgba(255, 255, 255, 0.18)',
        iconColor: '#F3E5AB',
        badgeBg: 'rgba(243, 229, 171, 0.22)',
        badgeColor: '#FFFFFF',
        badgeBorder: '#F3E5AB',
        progressBarTrack: 'rgba(255, 255, 255, 0.24)',
        progressBarFill: 'linear-gradient(90deg, #F3E5AB, #FFF9DB)',
        description: 'Latar hijau hutan pekat dengan teks putih dan aksen krem'
      }
    },
    badges: {
      light: {
        id: 'light',
        name: 'Light Cream Ochre Tint',
        bg: 'rgba(115, 86, 34, 0.14)',
        color: '#1B4332',
        border: '#735622',
        description: 'Latar krem lembut dengan teks hijau hutan gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Forest Solid',
        bg: '#1B4332',
        color: '#FFFFFF',
        border: '#C9B376',
        description: 'Latar hijau hutan tegas dengan teks putih terang'
      }
    }
  },
  'slate-teal': {
    id: 'slate-teal',
    name: 'Slate Gray & Teal (Minimalist Corporate)',
    category: 'Minimalist & Corporate',
    cssClass: 'theme-slate-teal',
    vars: {
      primary: '#334155',
      accent: '#0F766E',
      bgSidebar: '#F1F5F9',
      textDark: '#1E293B',
      textLight: '#FFFFFF',
      borderMuted: '#CBD5E1',
    },
    sidebar: {
      light: {
        id: 'light',
        name: 'Light Cool Slate',
        bgSidebar: '#F1F5F9',
        textMain: '#1E293B',
        textMuted: '#475569',
        headingColor: '#334155',
        borderSubtle: '#CBD5E1',
        iconColor: '#0F766E',
        badgeBg: 'rgba(15, 118, 110, 0.13)',
        badgeColor: '#1E293B',
        badgeBorder: '#0F766E',
        progressBarTrack: '#CBD5E1',
        progressBarFill: 'linear-gradient(90deg, #334155, #0F766E)',
        description: 'Latar abu-abu slate sejuk dengan teks gelap kontras tinggi'
      },
      dark: {
        id: 'dark',
        name: 'Dark Deep Slate',
        bgSidebar: '#1E293B',
        textMain: '#FFFFFF',
        textMuted: '#CBD5E1',
        headingColor: '#FFFFFF',
        borderSubtle: 'rgba(255, 255, 255, 0.18)',
        iconColor: '#5EEAD4',
        badgeBg: 'rgba(94, 234, 212, 0.22)',
        badgeColor: '#FFFFFF',
        badgeBorder: '#5EEAD4',
        progressBarTrack: 'rgba(255, 255, 255, 0.24)',
        progressBarFill: 'linear-gradient(90deg, #5EEAD4, #CCFBF1)',
        description: 'Latar abu-abu slate gelap pekat dengan teks putih dan aksen teal'
      }
    },
    badges: {
      light: {
        id: 'light',
        name: 'Light Teal Tint',
        bg: 'rgba(15, 118, 110, 0.13)',
        color: '#1E293B',
        border: '#0F766E',
        description: 'Latar teal lembut dengan teks slate gelap'
      },
      dark: {
        id: 'dark',
        name: 'Dark Slate Solid',
        bg: '#334155',
        color: '#FFFFFF',
        border: '#14B8A6',
        description: 'Latar slate tegas dengan teks putih terang'
      }
    }
  }
};
