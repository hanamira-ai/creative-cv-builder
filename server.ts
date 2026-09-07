import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with support for large base64 file payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization for Google Gen AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "A4 CV Generator & Document Parser" });
});

// JSON Schema for CVData
const cvDataSchema = {
  type: Type.OBJECT,
  properties: {
    language: {
      type: Type.STRING,
      enum: ["id", "en"],
      description: "Kode bahasa target CV: 'id' untuk Bahasa Indonesia atau 'en' untuk English"
    },
    personal_info: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Nama lengkap kandidat" },
        title: { type: Type.STRING, description: "Gelar atau posisi profesional utama" },
        contact: {
          type: Type.OBJECT,
          properties: {
            phone: { type: Type.STRING, description: "Nomor telepon / WhatsApp aktif" },
            email: { type: Type.STRING, description: "Alamat email profesional" },
            address: { type: Type.STRING, description: "Domisili kota / provinsi / negara" },
            github: { type: Type.STRING, description: "URL atau username GitHub (opsional)" },
            linkedin: { type: Type.STRING, description: "URL atau username LinkedIn (opsional)" }
          },
          required: ["phone", "email", "address"]
        },
        summary: { type: Type.STRING, description: "Ringkasan eksekutif profesional 2-4 kalimat yang ringkas dan padat sesuai bahasa target" },
        profile_picture_placeholder: { type: Type.STRING, description: "URL atau string kosong" }
      },
      required: ["name", "title", "contact", "summary"]
    },
    core_skills: {
      type: Type.ARRAY,
      description: "Daftar keahlian teknis/profesional utama dengan tingkat kemahiran",
      items: {
        type: Type.OBJECT,
        properties: {
          skill_name: { type: Type.STRING, description: "Nama keahlian" },
          proficiency_level: {
            type: Type.STRING,
            description: "Tingkat kemahiran: 'Mahir', 'Menengah', atau 'Dasar' (Bahasa Indonesia) atau 'Advanced', 'Intermediate', 'Basic', 'Expert' (English)"
          }
        },
        required: ["skill_name", "proficiency_level"]
      }
    },
    tech_stack: {
      type: Type.ARRAY,
      description: "Daftar kategori teknologi, tools, dan penjelasan aplikasinya",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Kategori stack, misal 'Frontend', 'Backend', 'Database'" },
          tool: { type: Type.STRING, description: "Tools atau framework yang digunakan" },
          description: { type: Type.STRING, description: "Deskripsi singkat pengalaman atau konteks penggunaan" },
          level: { type: Type.STRING, description: "Level atau indikasi penguasaan" }
        },
        required: ["category", "tool", "description", "level"]
      }
    },
    work_experience: {
      type: Type.ARRAY,
      description: "Riwayat pengalaman kerja profesional terurut dari yang terbaru",
      items: {
        type: Type.OBJECT,
        properties: {
          position: { type: Type.STRING, description: "Posisi atau jabatan pekerjaan" },
          company: { type: Type.STRING, description: "Nama perusahaan atau organisasi" },
          period: { type: Type.STRING, description: "Periode kerja, misal '2021 - Sekarang' atau 'Jan 2020 - Des 2022'" },
          highlights: {
            type: Type.ARRAY,
            description: "Daftar poin pencapaian atau tanggung jawab utama yang berorientasi hasil",
            items: { type: Type.STRING }
          }
        },
        required: ["position", "company", "period", "highlights"]
      }
    },
    digital_portfolio: {
      type: Type.ARRAY,
      description: "Portofolio proyek unggulan",
      items: {
        type: Type.OBJECT,
        properties: {
          project_name: { type: Type.STRING, description: "Nama proyek atau aplikasi" },
          description: { type: Type.STRING, description: "Deskripsi dampak, fitur, atau solusi proyek" },
          tech_used: {
            type: Type.ARRAY,
            description: "Daftar teknologi yang digunakan dalam proyek",
            items: { type: Type.STRING }
          },
          link: { type: Type.STRING, description: "Tautan demo atau repositori (opsional)" }
        },
        required: ["project_name", "description", "tech_used"]
      }
    },
    education: {
      type: Type.ARRAY,
      description: "Riwayat pendidikan formal",
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING, description: "Gelar dan program studi" },
          institution: { type: Type.STRING, description: "Nama universitas, institut, atau sekolah" },
          year: { type: Type.STRING, description: "Tahun atau rentang tahun kelulusan" },
          details: { type: Type.STRING, description: "IPK, predikat kelulusan, atau catatan tesis/akademik" }
        },
        required: ["degree", "institution", "year"]
      }
    },
    languages: {
      type: Type.ARRAY,
      description: "Kemampuan bahasa dan tingkat kemahirannya",
      items: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING, description: "Nama bahasa" },
          level: { type: Type.STRING, description: "Tingkat kemahiran bahasa" }
        },
        required: ["language", "level"]
      }
    },
    certifications: {
      type: Type.ARRAY,
      description: "Daftar sertifikasi profesional atau lisensi",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nama sertifikasi" },
          detail: { type: Type.STRING, description: "Penerbit atau nomor kredensial" },
          year: { type: Type.STRING, description: "Tahun penerbitan" }
        },
        required: ["name", "detail"]
      }
    },
    references: {
      type: Type.ARRAY,
      description: "Kontak referensi profesional",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nama pemberi referensi" },
          title: { type: Type.STRING, description: "Jabatan dan perusahaan pemberi referensi" },
          contact_info: { type: Type.STRING, description: "Nomor telepon atau email kontak" }
        },
        required: ["name", "title", "contact_info"]
      }
    }
  },
  required: [
    "personal_info",
    "core_skills",
    "tech_stack",
    "work_experience",
    "digital_portfolio",
    "education",
    "languages",
    "certifications",
    "references"
  ]
};

// Circuit breaker state to gracefully route around temporary model cluster spikes
let lastHighDemandTime = 0;
const HIGH_DEMAND_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to generate CV structured JSON with automatic retry, circuit-breaker,
 * and resilient model fallback.
 * If gemini-3.8-flash is experiencing 503 (high demand) or 429, it seamlessly
 * routes to gemini-3.1-flash-lite with backoff.
 */
async function generateCVWithFallback(
  ai: GoogleGenAI,
  promptContents: any[],
  schema: any
): Promise<{ parsedJson: any; usedModel: string }> {
  // If recent requests encountered 503 high demand, prioritize gemini-3.1-flash-lite
  const isCoolingDown = Date.now() - lastHighDemandTime < HIGH_DEMAND_COOLDOWN_MS;
  const candidateModels = isCoolingDown
    ? ["gemini-3.1-flash-lite", "gemini-3.8-flash"]
    : ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

  let lastCaughtError: any = null;

  for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
    const modelName = candidateModels[mIdx];
    const maxAttempts = 2; // Up to 2 attempts per model with exponential backoff

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini API] Memproses dokumen dengan model: ${modelName} (Percobaan ${attempt}/${maxAttempts})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptContents,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
          }
        });

        const rawText = response.text?.trim();
        if (!rawText) {
          throw new Error("Model Gemini tidak mengembalikan respons teks.");
        }

        // Clean any accidental markdown code block wrap
        let cleaned = rawText;
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
        }

        const parsedJson = JSON.parse(cleaned);
        console.log(`[Gemini API] Sukses memproses CV dengan model: ${modelName}`);
        return { parsedJson, usedModel: modelName };
      } catch (err: any) {
        lastCaughtError = err;
        const msg = (err?.message || "").toLowerCase();
        const isDemandOrUnavailable =
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("unavailable") ||
          msg.includes("429") ||
          msg.includes("resource exhausted") ||
          err?.status === 503 ||
          err?.status === 429;

        if (isDemandOrUnavailable) {
          lastHighDemandTime = Date.now();
          console.log(
            `[Gemini API] Model ${modelName} sedang antrean padat/503. Menyiapkan peralihan mulus (Percobaan ${attempt})...`
          );

          // If attempt 1 failed with 503, wait briefly before next attempt or next model
          if (attempt < maxAttempts) {
            await sleep(800 * attempt);
            continue;
          }
        } else {
          // If error is not a transient 503/429 (e.g. invalid parameter), don't retry same model
          break;
        }
      }
    }
  }

  throw lastCaughtError || new Error("Semua server AI sedang mengalami antrean tinggi. Silakan coba kembali sesaat lagi.");
}

function formatFriendlyErrorMessage(err: any): string {
  if (!err) return "Terjadi kesalahan saat memproses dokumen dengan Gemini AI.";
  const rawMsg = err?.message || String(err);
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed?.error?.message) {
      if (parsed.error.code === 503 || parsed.error.status === "UNAVAILABLE" || parsed.error.message.includes("high demand")) {
        return "Server AI sedang mengalami lonjakan antrean sementara (High Demand / 503). Sistem telah mencoba server cadangan. Silakan klik tombol 'Generate CV' lagi dalam beberapa detik.";
      }
      if (parsed.error.code === 429 || parsed.error.message.includes("quota")) {
        return "Batas kuota sementara tercapai. Mohon tunggu beberapa saat sebelum mencoba kembali.";
      }
      return parsed.error.message;
    }
  } catch {
    // Not JSON
  }

  if (rawMsg.includes("503") || rawMsg.includes("high demand") || rawMsg.includes("UNAVAILABLE")) {
    return "Server AI sedang mengalami lonjakan antrean sementara (High Demand). Silakan coba klik tombol 'Generate CV' lagi dalam beberapa detik.";
  }

  return rawMsg;
}

// Document Parsing & CV Generation endpoint
app.post("/api/parse-cv", async (req, res) => {
  try {
    const {
      fileBase64,
      mimeType,
      fileName,
      textContent,
      optimizePhrasing = true,
      target_language,
      targetLanguage
    } = req.body;

    // Normalize target language: 'id' or 'en' (default: 'id')
    const rawLang = String(target_language || targetLanguage || "id").trim().toLowerCase();
    const targetLang: "id" | "en" = rawLang === "en" ? "en" : "id";
    const isEn = targetLang === "en";

    if (!fileBase64 && (!textContent || !textContent.trim())) {
      return res.status(400).json({
        success: false,
        error: "Harap unggah berkas (PDF, DOCX, TXT) atau masukkan teks isi CV."
      });
    }

    const ai = getGenAI();
    let promptContents: any[] = [];
    let extractedDocText = "";

    // Handle DOCX files
    const isDocx =
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      (fileName && fileName.toLowerCase().endsWith(".docx"));

    if (fileBase64 && isDocx) {
      try {
        const docBuffer = Buffer.from(fileBase64, "base64");
        const docxResult = await mammoth.extractRawText({ buffer: docBuffer });
        extractedDocText = docxResult.value || "";
      } catch (err: any) {
        console.warn("Gagal mengekstrak teks DOCX dengan mammoth:", err);
      }
    }

    const systemInstructionText = `
Anda adalah Pakar Penulisan CV Eksekutif & Ahli Penataan Format Standar A4 Internasional.
Tugas Anda adalah membedah dan mengekstrak seluruh informasi dari dokumen CV/teks berikut, kemudian memetakannya secara presisi ke dalam struktur JSON yang sesuai dengan skema yang diberikan.

PILIHAN BAHASA TARGET: ${isEn ? "ENGLISH (en)" : "BAHASA INDONESIA (id)"}
Instruksi Wajib: Terjemahkan dan susun isi data CV ini ke dalam bahasa: ${isEn ? "English" : "Bahasa Indonesia"}.

${
  isEn
    ? `ATURAN TRANSLASI & PENYUSUNAN STANDAR BAHASA INGGRIS (ENGLISH CV STANDARD):
- Terjemahkan dan sesuaikan seluruh teks hasil ekstraksi (Professional Summary, Work Experience Highlights, Project Portfolio Descriptions, Skills, Education details, Languages, dan References) ke dalam Bahasa Inggris standar CV profesional internasional.
- Pada poin pengalaman kerja (highlights), WAJIB gunakan action verbs profesional di awal setiap kalimat (contoh: "Managed", "Developed", "Spearheaded", "Implemented", "Designed", "Architected", "Engineered", "Optimized", "Streamlined", "Accelerated", "Formulated", "Delivered").
- PENTING / TETAP PERTAHANKAN:
  * Nama instansi, universitas, sekolah (contoh: "Institut Teknologi Bandung (ITB)", "Universitas Indonesia").
  * Nama perusahaan atau organisasi tempat bekerja (contoh: "PT Fintek Inovasi Nusantara", "Mizumoto Photography").
  * Nama gelar asli jika merupakan singkatan lokal (misal: "S.Kom.", "S.T.") atau padanan internasional jika dicantumkan.
  * Istilah teknis, bahasa pemrograman, framework, dan tools teknis (Tech Stack) sesuai bentuk aslinya tanpa diterjemahkan secara kaku (contoh: Go, TypeScript, PostgreSQL, Docker, Kubernetes, AWS, React, Tailwind CSS).
- Tingkat kemahiran 'core_skills' (proficiency_level) HARUS menggunakan Bahasa Inggris standar: 'Advanced', 'Intermediate', atau 'Basic' (atau 'Expert').
- Set nilai field 'language' bernilai "en".`
    : `ATURAN PENYUSUNAN STANDAR BAHASA INDONESIA:
- Sajikan seluruh teks hasil ekstraksi (Ringkasan, Pengalaman Kerja, Deskripsi Portofolio, Keahlian, Konteks Tech Stack, Pendidikan, Bahasa, dan Referensi) dalam Bahasa Indonesia yang baku dan profesional.
- Gunakan kata kerja aktif profesional (Action Verbs) pada poin pencapaian kerja (contoh: "Memimpin", "Mengembangkan", "Merancang", "Mengoptimalkan", "Mengimplementasikan").
- Tetap pertahankan nama instansi, nama perusahaan, nama gelar, dan istilah teknis (Tech Stack) sesuai bentuk aslinya tanpa diterjemahkan secara kaku (misal: Docker, Kubernetes, CI/CD, React, TypeScript).
- Tingkat kemahiran 'core_skills' (proficiency_level) HARUS salah satu dari: "Mahir", "Menengah", atau "Dasar".
- Set nilai field 'language' bernilai "id".`
}

PANDUAN EKSTRAKSI & OPTIMASI DATA:
1. INFORMASI PRIBADI:
   - Ekstrak Nama Lengkap, Gelar/Posisi Profesional, dan Kontak (Telepon, Email, Domisili, LinkedIn, GitHub jika ada).
   - Buat atau poles 'summary' (Ringkasan Eksekutif) menjadi 2-4 kalimat yang profesional, padat, dan berbobot dalam ${isEn ? "Bahasa Inggris" : "Bahasa Indonesia"}. Jika summary di berkas sumber kosong atau sangat singkat, formulasikan ringkasan eksekutif profesional yang merangkum keahlian dan riwayat kandidat secara elegan.
2. KEAHLIAN & TECH STACK:
   - Petakan keahlian ke 'core_skills' dengan tingkat kemahiran (${isEn ? "'Advanced', 'Intermediate', atau 'Basic'" : "'Mahir', 'Menengah', atau 'Dasar'"}).
   - Petakan perkakas, bahasa pemrograman, framework, atau tool ke 'tech_stack' (dengan category, tool, description, dan level). Jika deskripsi tool terlalu singkat, berikan keterangan konteks penggunaan profesional yang relevan dalam ${isEn ? "Bahasa Inggris" : "Bahasa Indonesia"}.
3. PENGALAMAN KERJA (WORK EXPERIENCE):
   - Ekstrak posisi, perusahaan, periode waktu secara faktual dan akurat.
   - Poin Pencapaian ('highlights'): ${
     optimizePhrasing
       ? isEn
         ? "Formulasikan dan optimalkan setiap poin pencapaian menggunakan strong action verbs + impact/metrics profesional dalam Bahasa Inggris (contoh: 'Spearheaded migration to microservices, boosting throughput by 40%') TANPA MENGUBAH fakta riwayat kerja, nama perusahaan, posisi, atau periode waktu sebenarnya."
         : "Formulasikan dan optimalkan kalimatnya menggunakan kata kerja aktif yang kuat dan gaya profesional (Action Verb + Context + Impact/Result) TANPA MENGUBAH fakta riwayat kerja, nama perusahaan, posisi jabatan, atau periode waktu sebenarnya."
       : isEn
         ? "Sesuaikan poin pencapaian ke Bahasa Inggris profesional dengan action verbs."
         : "Pertahankan poin pencapaian sesuai teks asli dalam Bahasa Indonesia yang rapi."
   }
4. PENYESUAIAN DATA OTOMATIS:
   - Jika ada bagian CV pengguna yang belum terisi atau terlalu singkat (seperti deskripsi proyek di portofolio, ringkasan profil, atau penjelasan stack), optimalkan kalimatnya agar tetap bernada profesional, berorientasi dampak, dan siap tampil di layout resume A4 dalam ${isEn ? "Bahasa Inggris" : "Bahasa Indonesia"} tanpa mengubah fakta riwayat kerja.
5. PORTOFOLIO DIGITAL & PROYEK:
   - Jika ada proyek yang disebutkan di CV, masukkan ke 'digital_portfolio'. Jika tidak ada secara eksplisit, ambil 1-2 inisiatif atau proyek utama dari riwayat kerja terbaru kandidat.
6. PENDIDIKAN, BAHASA, SERTIFIKASI, REFERENSI:
   - Ekstrak seluruh riwayat pendidikan, kemampuan bahasa (sertakan tingkat kemahiran seperti ${isEn ? "'Native Speaker', 'Professional Proficiency', 'Conversational'" : "'Penutur Asli', 'Profesional', dsb."}), sertifikasi berlisensi, dan referensi kerja (jika tidak ada di sumber, tulis ${isEn ? "'Available upon request'" : "'Tersedia berdasarkan permintaan'"}).

PERATURAN MUTLAK:
- Seluruh nilai 'proficiency_level' pada 'core_skills' HARUS berupa salah satu dari: ${isEn ? '"Expert", "Advanced", "Intermediate", "Basic"' : '"Mahir", "Menengah", "Dasar"'}.
- Jangan pernah mengosongkan array wajib.
- Jawaban HARUS selalu dalam format JSON murni yang valid sesuai skema yang ditentukan.
`;

    const langInstructionSuffix = `\n\nInstruksi Wajib Pilihan Bahasa Target: Terjemahkan dan susun isi data CV ini ke dalam bahasa: ${isEn ? "English" : "Bahasa Indonesia"}.`;

    // Formulate the user prompt
    if (extractedDocText) {
      promptContents = [
        {
          text: `${systemInstructionText}\n\nBerikut adalah isi teks yang diekstrak dari dokumen DOCX (${fileName || "dokumen"}):\n\n${extractedDocText}${langInstructionSuffix}`
        }
      ];
    } else if (fileBase64 && mimeType === "application/pdf") {
      // PDF natively handled by Gemini Flash
      promptContents = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: fileBase64
          }
        },
        {
          text: `${systemInstructionText}\n\nEkstrak seluruh informasi CV dari dokumen PDF terlampir di atas ke dalam format JSON skema yang ditentukan.${langInstructionSuffix}`
        }
      ];
    } else if (fileBase64 && mimeType?.startsWith("text/")) {
      const textBuffer = Buffer.from(fileBase64, "base64").toString("utf-8");
      promptContents = [
        {
          text: `${systemInstructionText}\n\nBerikut adalah teks dokumen CV:\n\n${textBuffer}${langInstructionSuffix}`
        }
      ];
    } else if (textContent) {
      promptContents = [
        {
          text: `${systemInstructionText}\n\nBerikut adalah teks dokumen CV yang dimasukkan pengguna:\n\n${textContent}${langInstructionSuffix}`
        }
      ];
    } else {
      return res.status(400).json({
        success: false,
        error: "Format berkas tidak didukung. Mohon gunakan PDF, DOCX, atau Teks Polos."
      });
    }

    const { parsedJson, usedModel } = await generateCVWithFallback(
      ai,
      promptContents,
      cvDataSchema
    );

    // Ensure language is firmly set
    if (parsedJson) {
      parsedJson.language = targetLang;
    }

    return res.json({
      success: true,
      data: parsedJson,
      usedModel,
      targetLanguage: targetLang,
      message: `Dokumen CV berhasil dianalisis dan dipetakan ke skema JSON A4 (${isEn ? "English" : "Bahasa Indonesia"}).`
    });
  } catch (error: any) {
    console.error("Error in /api/parse-cv:", error);
    const friendlyMsg = formatFriendlyErrorMessage(error);
    return res.status(500).json({
      success: false,
      error: friendlyMsg
    });
  }
});

// Vite Middleware for development & Static server for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
