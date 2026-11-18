import { CVData } from './types';

export const sampleNeutralCV: CVData = {
  language: "id",
  personal_info: {
    name: "Nadia Kusuma",
    title: "Product Operations & Data Analyst",
    contact: {
      phone: "+62 811-0000-1234",
      email: "nadia.kusuma@contoh-cv.id",
      address: "Jakarta, Indonesia",
      github: "https://github.com/contoh-profil",
      linkedin: "https://linkedin.com/in/nadia-kusuma-contoh",
      website: ""
    },
    summary: "Profesional Product Operations dan Data Analyst berpengalaman lebih dari 6 tahun dalam pengelolaan analitik produk digital, otomasi pelaporan operasional, dan optimalisasi alur kerja lintas tim. Terbiasa menerjemahkan data pengguna menjadi insight terukur untuk meningkatkan efisiensi layanan serta retensi pelanggan.",
    profile_picture_placeholder: ""
  },
  core_skills: [
    {
      skill_name: "Product Analytics & Funnel Optimization",
      proficiency_level: "Mahir"
    },
    {
      skill_name: "SQL Querying & Data Warehouse Modeling",
      proficiency_level: "Mahir"
    },
    {
      skill_name: "Business Intelligence Dashboarding",
      proficiency_level: "Mahir"
    },
    {
      skill_name: "Workflow Automation & API Integration",
      proficiency_level: "Menengah"
    },
    {
      skill_name: "Cross-Functional Project Management",
      proficiency_level: "Mahir"
    },
    {
      skill_name: "Experimentation & A/B Testing Analysis",
      proficiency_level: "Menengah"
    }
  ],
  tech_stack: [
    {
      category: "Data & Analytics",
      tool: "PostgreSQL, BigQuery, Python (Pandas), dbt",
      description: "Pemrosesan dataset transaksi, pemodelan metrik retensi, dan validasi kualitas data operasional",
      level: "Mahir"
    },
    {
      category: "BI & Visualization",
      tool: "Looker Studio, Metabase, Tableau",
      description: "Perancangan dasbor KPI eksekutif dan pemantauan performa operasional secara real-time",
      level: "Mahir"
    },
    {
      category: "Automation & Web",
      tool: "TypeScript, REST API, Apps Script, Git",
      description: "Otomasi sinkronisasi laporan mingguan serta integrasi webhook antar platform internal",
      level: "Menengah"
    },
    {
      category: "Product & Collaboration",
      tool: "Jira, Notion, Figma, Amplitude",
      description: "Dokumentasi alur kerja produk, pelacakan event pengguna, dan koordinasi rilis lintas divisi",
      level: "Mahir"
    }
  ],
  work_experience: [
    {
      position: "Lead Product Operations Analyst",
      company: "PT Niaga Digital Nusantara",
      period: "2022 – Sekarang",
      highlights: [
        "Merancang sistem pemantauan SLA operasional dan dasbor metrik produk yang digunakan oleh lebih dari 40 pemangku kepentingan.",
        "Mengotomasi proses rekonsiliasi laporan mingguan berbasis SQL dan skrip API, memangkas waktu kerja manual tim hingga 55%.",
        "Menginisiasi kerangka eksperimen A/B untuk alur onboarding pengguna yang berkontribusi pada kenaikan aktivasi sebesar 18%."
      ]
    },
    {
      position: "Business & Data Analyst",
      company: "PT Solusi Data Sentosa",
      period: "2020 – 2022",
      highlights: [
        "Membangun pipeline pelaporan kohort pelanggan dan analisis churn untuk mendukung tim produk dan pemasaran.",
        "Berkolaborasi dengan tim rekayasa perangkat lunak untuk menstandarkan skema tracking event pada aplikasi web dan mobile.",
        "Menyusun evaluasi performa kampanye kuartalan dengan rekomendasi alokasi anggaran berbasis ROI."
      ]
    },
    {
      position: "Junior Operations Analyst",
      company: "PT Karya Informatika Mandiri",
      period: "2019 – 2020",
      highlights: [
        "Mengelola kebersihan basis data layanan pelanggan dan menyusun laporan tren tiket bantuan bulanan.",
        "Mendukung penyusunan SOP layanan digital untuk mempercepat penyelesaian kendala tingkat pertama."
      ]
    }
  ],
  digital_portfolio: [
    {
      project_name: "OpsMetrics KPI Dashboard",
      description: "Portal analitik internal untuk memantau konversi funnel harian, latensi pemrosesan layanan, dan peringatan anomali otomatis.",
      tech_used: ["PostgreSQL", "Metabase", "TypeScript", "Docker"],
      link: "https://github.com/contoh-profil/ops-metrics-dashboard"
    },
    {
      project_name: "Automated Cohort Reporting Pipeline",
      description: "Skrip terjadwal untuk mengagregasi metrik retensi mingguan dan mendistribusikan ringkasan ke kanal tim secara otomatis.",
      tech_used: ["Python", "BigQuery", "GitHub Actions"]
    },
    {
      project_name: "Service Ticket Taxonomy Classifier",
      description: "Standardisasi kategorisasi umpan balik pengguna guna mempercepat identifikasi prioritas perbaikan fitur produk.",
      tech_used: ["Python", "SQL", "Looker Studio"]
    }
  ],
  education: [
    {
      degree: "Sarjana Komputer (S.Kom.) - Sistem Informasi",
      institution: "Universitas Nusantara Jaya",
      year: "2015 – 2019",
      details: "Fokus studi pada Manajemen Basis Data, Analisis Sistem Bisnis, dan Visualisasi Informasi."
    }
  ],
  languages: [
    {
      language: "Bahasa Indonesia",
      level: "Penutur Asli (Native)"
    },
    {
      language: "Bahasa Inggris",
      level: "Kemahiran Profesional (Fluent)"
    }
  ],
  certifications: [
    {
      name: "Google Data Analytics Professional Certificate",
      detail: "Pemrosesan data, SQL analitik, dan visualisasi metrik bisnis",
      year: "2022"
    },
    {
      name: "Product Operations & Agile Delivery Specialist",
      detail: "Tata kelola rilis produk, OKR, dan standardisasi proses lintas tim",
      year: "2023"
    }
  ],
  references: [
    {
      name: "Bima Santoso",
      title: "Head of Product Operations, PT Niaga Digital Nusantara",
      contact_info: "bima.santoso@contoh-cv.id"
    },
    {
      name: "Rina Maharani",
      title: "Data Analytics Manager, PT Solusi Data Sentosa",
      contact_info: "rina.maharani@contoh-cv.id"
    }
  ]
};
