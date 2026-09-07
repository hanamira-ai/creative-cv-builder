import { CVData } from './types';

export const sampleGuruhWicaksonoCV: CVData = {
  language: "id",
  personal_info: {
    name: "Guruh Wicaksono",
    title: "Digital Entrepreneur & GIS Specialist",
    contact: {
      phone: "+62 812-3456-7890",
      email: "mizumoto.id@gmail.com",
      address: "Bandung, Jawa Barat, Indonesia",
      github: "https://github.com/mizumoto-id",
      linkedin: "https://linkedin.com/in/guruh-wicaksono"
    },
    summary: "Professional Digital Entrepreneur dan GIS Specialist berpengalaman lebih dari 15 tahun dalam arsitektur spasial, kepemimpinan bisnis digital, dan rekayasa perangkat lunak modern. Memiliki rekam jejak solid dalam proyek internasional (ADB, Deltares, ITB) pada 2009–2013, kini memimpin Mizumoto Photography serta aktif mengembangkan sistem berbasis AI generatif (Gemini API) dan stack web kontemporer (React, Tailwind CSS).",
    profile_picture_placeholder: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  core_skills: [
    {
      skill_name: "Geographic Information Systems (GIS) & Spatial Analysis",
      proficiency_level: "Mahir"
    },
    {
      skill_name: "Creative Business Leadership & Photography Direction",
      proficiency_level: "Mahir"
    },
    {
      skill_name: "Fullstack Web Engineering (React, TypeScript, Tailwind)",
      proficiency_level: "Mahir"
    },
    {
      skill_name: "Generative AI Integration (Gemini API / LLM Orchestration)",
      proficiency_level: "Menengah"
    },
    {
      skill_name: "Hydro-Informatics Modeling & Environmental Cartography",
      proficiency_level: "Mahir"
    },
    {
      skill_name: "Cloud Architecture & Agile Project Management",
      proficiency_level: "Menengah"
    }
  ],
  tech_stack: [
    {
      category: "Geospatial & Remote Sensing",
      tool: "ArcGIS, QGIS, GDAL, PostGIS",
      description: "Analisis spasial vektor & raster, georeferencing, dan visualisasi pemetaan tematik presisi tinggi",
      level: "Mahir"
    },
    {
      category: "Frontend Development",
      tool: "React 19, TypeScript, Tailwind CSS, Vite",
      description: "Pengembangan antarmuka web interaktif, responsif, dan layout dokumen presisi A4",
      level: "Mahir"
    },
    {
      category: "Artificial Intelligence",
      tool: "Google Gemini API (@google/genai), Prompt Engineering",
      description: "Ekstraksi dokumen otomatis, restrukturisasi JSON skematik, dan automasi pemrosesan CV",
      level: "Menengah"
    },
    {
      category: "Backend & System",
      tool: "Node.js, Express, RESTful APIs, Git",
      description: "Pengembangan service API server-side aman dan manajemen repositori terdistribusi",
      level: "Menengah"
    }
  ],
  work_experience: [
    {
      position: "Chief Executive Officer & Founder",
      company: "Mizumoto Photography",
      period: "2014 – Sekarang",
      highlights: [
        "Membangun dan mengarahkan strategi operasional serta ekspansi studio fotografi komersial & event berskala nasional.",
        "Mengembangkan platform digital internal untuk manajemen booking klien, alur kurasi aset media, dan efisiensi produksi.",
        "Mengintegrasikan automasi workflow kreatif berbasis web untuk memangkas waktu delivery hasil foto hingga 40%."
      ]
    },
    {
      position: "Lead GIS Specialist & Spatial Data Consultant",
      company: "Kerja Sama Konsorsium ADB / Deltares / ITB (Institut Teknologi Bandung)",
      period: "2009 – 2013",
      highlights: [
        "Bertanggung jawab atas pemodelan sistem informasi geografis dan manajemen basis data spasial untuk mitigasi bencana banjir dan tata kelola hidrologi.",
        "Mengolah citra satelit resolusi tinggi, data elevasi digital (DEM), serta data hidrometri bekerja sama dengan peneliti internasional Deltares Belanda dan pakar ITB.",
        "Menyusun laporan teknis kartografi komprehensif yang diadopsi oleh Asian Development Bank (ADB) dan kementerian terkait sebagai acuan kebijakan infrastruktur."
      ]
    },
    {
      position: "Geospatial Analyst & Cartographer",
      company: "Laboratorium Geodesi & Geomatika ITB",
      period: "2008 – 2009",
      highlights: [
        "Melakukan survei lapangan geodetik GPS frekuensi ganda serta validasi ground-truth untuk rekayasa topografi.",
        "Mengembangkan otomasi skrip data spasial untuk percepatan konversi format peta kadastral."
      ]
    }
  ],
  digital_portfolio: [
    {
      project_name: "Interactive A4 CV Generator Engine",
      description: "Aplikasi generator resume profesional satu lembar A4 dengan fitur live preview, parsing dokumen PDF/Word via Gemini API, serta export PDF high-res.",
      tech_used: ["React", "TypeScript", "Tailwind CSS", "Gemini API", "Vite"],
      link: "https://github.com/mizumoto-id/cv-generator-a4"
    },
    {
      project_name: "Mizumoto Creative Client Portal",
      description: "Aplikasi web manajemen proyek klien, galeri foto interaktif berbasis cloud, dan pelacak status pengerjaan pesanan otomatis.",
      tech_used: ["React", "Node.js", "Tailwind CSS", "Cloudflare R2"]
    },
    {
      project_name: "Hydro-Spatial Flood Vulnerability Assessment Tool",
      description: "Sistem analitik spasial berbasis GIS untuk pemetaan kerentanan banjir perkotaan dalam inisiatif riset konsorsium ADB-Deltares-ITB.",
      tech_used: ["ArcGIS", "Python", "Deltares SOBEK", "PostGIS"]
    }
  ],
  education: [
    {
      degree: "Sarjana Teknik (S.T.) - Teknik Geodesi & Geomatika",
      institution: "Institut Teknologi Bandung (ITB)",
      year: "2004 – 2008",
      details: "Fokus spesialisasi pada Sistem Informasi Geografis (GIS), Analisis Data Spasial, Pemetaan Digital, dan Fotogrametri."
    }
  ],
  languages: [
    {
      language: "Bahasa Indonesia",
      level: "Penutur Asli (Native / Mahir)"
    },
    {
      language: "Bahasa Inggris",
      level: "Kemahiran Profesional (Fluent / Mahir)"
    }
  ],
  certifications: [
    {
      name: "Certified GIS Professional (GISP) & Spatial Modeler",
      detail: "Spesialisasi analisis data geospasial multiskala dan cartographic rendering",
      year: "2012"
    },
    {
      name: "Modern Fullstack Web Architecture & Cloud Integration",
      detail: "Sertifikasi rekayasa frontend berbasis komponen dan arsitektur REST/API",
      year: "2023"
    },
    {
      name: "Google Generative AI Engineer Specialization",
      detail: "Pemanfaatan Gemini API, multimodal prompting, dan skematisasi JSON terstruktur",
      year: "2024"
    }
  ],
  references: [
    {
      name: "Prof. Dr. Ir. Hasanuddin Z. Abidin",
      title: "Senior Geodesy & Geospatial Expert, Institut Teknologi Bandung (ITB)",
      contact_info: "hzabidin@geodesy.itb.ac.id"
    },
    {
      name: "Dr. Mark van der Linden",
      title: "Senior Hydrologist & Project Lead, Deltares The Netherlands",
      contact_info: "mark.vanderlinden@deltares.nl"
    }
  ]
};
