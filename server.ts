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
        summary: { type: Type.STRING, description: "Ringkasan eksekutif profesional 2-4 kalimat yang ringkas dan padat" },
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
            enum: ["Mahir", "Menengah", "Dasar"],
            description: "Tingkat kemahiran: harus salah satu dari 'Mahir', 'Menengah', atau 'Dasar'"
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

/**
 * Helper to generate CV structured JSON with automatic retry and model fallback.
 * If a model returns 503 (high demand) or 429 (rate limit), it seamlessly
 * switches to backup models (e.g. gemini-flash-latest, gemini-3.1-flash-lite).
 */
async function generateCVWithFallback(
  ai: GoogleGenAI,
  promptContents: any[],
  schema: any
): Promise<{ parsedJson: any; usedModel: string }> {
  // Candidate Flash models in order of current health & availability
  const candidateModels = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash"
  ];

  let lastCaughtError: any = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`[Gemini API] Memproses dokumen dengan model: ${modelName}...`);
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
        msg.includes("not_found") ||
        err?.status === 503 ||
        err?.status === 429;

      console.warn(
        `[Gemini API] Model ${modelName} gagal: ${err?.message || err}. Beralih ke model berikutnya...`
      );

      // If high demand or temporary cluster outage, immediately proceed to next candidate model
      if (isDemandOrUnavailable) {
        continue;
      }
    }
  }

  throw lastCaughtError || new Error("Semua model Gemini sedang mengalami antrean tinggi. Silakan coba kembali sesaat lagi.");
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
    const { fileBase64, mimeType, fileName, textContent, optimizePhrasing = true } = req.body;

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

PANDUAN EKSTRAKSI & OPTIMASI DATA:
1. INFORMASI PRIBADI:
   - Ekstrak Nama Lengkap, Gelar/Posisi Profesional, dan Kontak (Telepon, Email, Domisili, LinkedIn, GitHub jika ada).
   - Buat atau poles 'summary' (Ringkasan Eksekutif) menjadi 2-4 kalimat yang profesional, padat, dan berbobot. Jika summary di berkas sumber kosong atau sangat singkat, formulasikan ringkasan eksekutif profesional yang merangkum keahlian dan riwayat kandidat secara elegan.
2. KEAHLIAN & TECH STACK:
   - Petakan keahlian ke 'core_skills' dengan tingkat kemahiran ('Mahir', 'Menengah', atau 'Dasar').
   - Petakan perkakas, bahasa pemrograman, framework, atau tool ke 'tech_stack' (dengan category, tool, description, dan level). Jika deskripsi tool terlalu singkat, berikan keterangan konteks penggunaan profesional yang relevan.
3. PENGALAMAN KERJA (WORK EXPERIENCE):
   - Ekstrak posisi, perusahaan, periode waktu secara faktual dan akurat.
   - Poin Pencapaian ('highlights'): ${
     optimizePhrasing
       ? "Jika kalimat pada CV sumber terlalu singkat, tidak lengkap, atau kurang berdampak (misal hanya menulis 'membuat website' atau 'fix bug'), formulasikan dan optimalkan kalimatnya menggunakan kata kerja aktif yang kuat dan gaya profesional (Action Verb + Context + Impact/Result) TANPA MENGUBAH fakta riwayat kerja, nama perusahaan, posisi jabatan, atau periode waktu sebenarnya."
       : "Pertahankan poin pencapaian sesuai teks asli."
   }
4. PENYESUAIAN DATA OTOMATIS:
   - Jika ada bagian CV pengguna yang belum terisi atau terlalu singkat (seperti deskripsi proyek di portofolio, ringkasan profil, atau penjelasan stack), optimalkan kalimatnya agar tetap bernada profesional, berorientasi dampak, dan siap tampil di layout resume A4 tanpa mengubah fakta riwayat kerja.
5. PORTOFOLIO DIGITAL & PROYEK:
   - Jika ada proyek yang disebutkan di CV, masukkan ke 'digital_portfolio'. Jika tidak ada secara eksplisit, ambil 1-2 inisiatif atau proyek utama dari riwayat kerja terbaru kandidat.
6. PENDIDIKAN, BAHASA, SERTIFIKASI, REFERENSI:
   - Ekstrak seluruh riwayat pendidikan, kemampuan bahasa (sertakan tingkat kemahiran seperti 'Penutur Asli', 'Profesional', dsb.), sertifikasi berlisensi, dan referensi kerja (jika tidak ada di sumber, tulis 'Tersedia berdasarkan permintaan').

PERATURAN MUTLAK:
- Seluruh nilai 'proficiency_level' pada 'core_skills' HARUS berupa salah satu dari: "Mahir", "Menengah", atau "Dasar".
- Jangan pernah mengosongkan array wajib.
- Jawaban HARUS selalu dalam format JSON murni yang valid sesuai skema yang ditentukan.
`;

    // Formulate the user prompt
    if (extractedDocText) {
      promptContents = [
        {
          text: `${systemInstructionText}\n\nBerikut adalah isi teks yang diekstrak dari dokumen DOCX (${fileName || "dokumen"}):\n\n${extractedDocText}`
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
          text: `${systemInstructionText}\n\nEkstrak seluruh informasi CV dari dokumen PDF terlampir di atas ke dalam format JSON skema yang ditentukan.`
        }
      ];
    } else if (fileBase64 && mimeType?.startsWith("text/")) {
      const textBuffer = Buffer.from(fileBase64, "base64").toString("utf-8");
      promptContents = [
        {
          text: `${systemInstructionText}\n\nBerikut adalah teks dokumen CV:\n\n${textBuffer}`
        }
      ];
    } else if (textContent) {
      promptContents = [
        {
          text: `${systemInstructionText}\n\nBerikut adalah teks dokumen CV yang dimasukkan pengguna:\n\n${textContent}`
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

    return res.json({
      success: true,
      data: parsedJson,
      usedModel,
      message: "Dokumen CV berhasil dianalisis dan dipetakan ke skema JSON A4."
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
