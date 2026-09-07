import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  FileUp, 
  FileText, 
  FileType, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Wand2, 
  ArrowRight,
  ClipboardPaste,
  ShieldCheck,
  FileCheck2,
  RotateCcw
} from 'lucide-react';
import { CVData } from '../types';
import { validateCVJson } from '../validator';

interface DocumentParserPanelProps {
  onCVGenerated: (data: CVData) => void;
  onClose?: () => void;
}

export const DocumentParserPanel: React.FC<DocumentParserPanelProps> = ({
  onCVGenerated,
  onClose
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [optimizePhrasing, setOptimizePhrasing] = useState<boolean>(true);
  
  // Loading & Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper convert File to Base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Split data:mime;base64,
        const base64Index = result.indexOf(';base64,');
        if (base64Index !== -1) {
          resolve(result.substring(base64Index + 8));
        } else {
          resolve(result);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validExtensions = ['.pdf', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!hasValidExt && !file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('text')) {
      setErrorMessage('Format berkas tidak didukung. Harap unggah berkas PDF (.pdf), Word (.docx), atau Teks Polos (.txt).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Ukuran berkas terlalu besar. Maksimal ukuran berkas adalah 20MB.');
      return;
    }

    try {
      setSelectedFile(file);
      const b64 = await readFileAsBase64(file);
      setFileBase64(b64);
    } catch (err: any) {
      setErrorMessage(`Gagal membaca berkas: ${err.message || 'Kesalahan pembacaan'}`);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileBase64('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleText = () => {
    const sample = `CURRICULUM VITAE

NAMA: Arya Danendra, S.Kom.
PROFESI: Senior Backend Engineer & Cloud Architect
KONTAK:
Telepon: +62 812-9876-5432
Email: arya.danendra@example.com
Domisili: Bandung, Jawa Barat, Indonesia
LinkedIn: linkedin.com/in/aryadanendra
GitHub: github.com/aryadanendra

RINGKASAN PROFIL:
Software Engineer dengan pengalaman lebih dari 6 tahun dalam merancang dan membangun arsitektur sistem berskala terdistribusi (Distributed Microservices), API berkinerja tinggi, dan otomatisasi infrastruktur cloud. Berhasil mengoptimalkan performa response time database hingga 45% pada transaksi fintech bervolume tinggi.

KEAHLIAN UTAMA:
- Go (Golang) - Mahir
- Node.js & TypeScript - Mahir
- PostgreSQL & Redis Optimization - Mahir
- Docker & Kubernetes - Mahir
- Microservices & Event-Driven Architecture - Mahir
- AWS & Google Cloud Platform - Menengah
- CI/CD Automation (GitHub Actions) - Menengah
- System Security & OAuth2 - Menengah

TECH STACK:
- Backend: Go, Gin, gRPC, Node.js, Express (Mahir)
- Database: PostgreSQL, Redis, MongoDB, Elasticsearch (Mahir)
- DevOps & Cloud: Docker, Kubernetes, AWS EKS, Terraform (Mahir)
- Monitoring: Prometheus, Grafana, OpenTelemetry (Menengah)

PENGALAMAN KERJA:
1. Perusahaan: PT Fintek Inovasi Nusantara
   Posisi: Lead Backend Engineer
   Periode: Jan 2022 - Sekarang
   Pencapaian:
   - Memimpin refactoring arsitektur payment gateway monolitik ke microservices berbasis Go dan gRPC, menampung lebih dari 2.5 juta transaksi per hari.
   - Mengurangi downtime operasional backend sebesar 99.98% SLA dengan menerapkan container orchestration Kubernetes di AWS EKS.
   - Mengimplementasikan distributed caching multi-layer Redis yang mempercepat latensi transaksi dari 320ms menjadi 65ms.

2. Perusahaan: PT Global Digital Solusi
   Posisi: Senior Software Engineer
   Periode: Jul 2019 - Des 2021
   Pencapaian:
   - Merancang dan meluncurkan sistem core banking API yang terintegrasi dengan 4 bank devisa utama di Indonesia.
   - Membangun pipeline CI/CD otomatis menggunakan GitLab CI dan Docker, memotong siklus rilis deployment dari 2 hari menjadi 20 menit.

PORTOFOLIO DIGITAL:
1. Proyek: Apex Cloud Event Gateway
   Deskripsi: High-throughput open-source webhook and event dispatcher engine dengan fault-tolerant queue.
   Tech: Go, Kafka, Redis, Docker
   Link: github.com/aryadanendra/apex-gateway

2. Proyek: MicroPay API Engine
   Deskripsi: Modul payment processing terenkripsi PCI-DSS compliant dengan idempotent transaction lock.
   Tech: TypeScript, Node.js, PostgreSQL, Vault

PENDIDIKAN:
- S1 Teknik Informatika, Institut Teknologi Bandung (ITB), 2015 - 2019. IPK 3.82 / 4.00 (Cum Laude).

BAHASA:
- Bahasa Indonesia (Penutur Asli)
- Bahasa Inggris (Profesional Kerja / C1 Fluent)

SERTIFIKASI:
- AWS Certified Solutions Architect - Professional (Amazon Web Services, 2023)
- Certified Kubernetes Administrator - CKA (Linux Foundation, 2022)

REFERENSI:
- Tersedia secara lengkap berdasarkan permintaan.`;

    setPastedText(sample);
    setActiveInputMode('text');
  };

  const handleLoadShortSampleText = () => {
    const shortSample = `NAMA: Dian Pratama
POSISI: Frontend Web Developer
KONTAK:
Telepon: 0812-3456-7890
Email: dian.pratama@email.com
Domisili: Jakarta Selatan, Indonesia
LinkedIn: linkedin.com/in/dianpratama
GitHub: github.com/dianpratama

RINGKASAN:
Web Developer berpengalaman membangun aplikasi React dan dashboard modern.

KEAHLIAN:
React, TypeScript, Tailwind CSS, Next.js, REST API, Git, Redux Toolkit

PENGALAMAN KERJA:
1. PT Digital Inovasi Nusantara
   Posisi: Frontend Developer
   Periode: 2022 - Sekarang
   Pencapaian:
   - Membuat website e-commerce dan integrasi payment gateway
   - Memperbaiki bug dan refactor kode CSS ke Tailwind
   - Kolaborasi dengan tim backend dan UI designer

2. Studio Kreasi Web
   Posisi: Junior Web Developer
   Periode: 2020 - 2022
   Pencapaian:
   - Membuat landing page responsif untuk klien UMKM
   - Optimasi kecepatan load halaman web

PORTOFOLIO:
1. Proyek: TokoOnline Hub
   Deskripsi: Aplikasi toko online dengan keranjang belanja real-time.
   Tech: React, Tailwind CSS, Vite

PENDIDIKAN:
S1 Sistem Informasi, Universitas Indonesia, 2016 - 2020. IPK 3.75.

BAHASA:
Bahasa Indonesia (Penutur Asli), Bahasa Inggris (Menengah)`;

    setPastedText(shortSample);
    setActiveInputMode('text');
  };

  // Main Trigger: Generate CV with Gemini AI
  const handleGenerateCV = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (activeInputMode === 'file' && (!selectedFile || !fileBase64)) {
      setErrorMessage('Harap pilih atau unggah berkas CV (PDF, DOCX, atau TXT) terlebih dahulu.');
      return;
    }

    if (activeInputMode === 'text' && (!pastedText || !pastedText.trim())) {
      setErrorMessage('Harap masukkan atau tempelkan teks CV Anda terlebih dahulu.');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStage('Mempersiapkan dokumen dan payload data...');

      const payload: any = {
        optimizePhrasing
      };

      if (activeInputMode === 'file' && selectedFile) {
        payload.fileBase64 = fileBase64;
        payload.mimeType = selectedFile.type || 'application/octet-stream';
        payload.fileName = selectedFile.name;
        setProcessingStage(`Menganalisis berkas ${selectedFile.name} dengan Gemini AI...`);
      } else {
        payload.textContent = pastedText.trim();
        setProcessingStage('Menganalisis teks CV dengan Gemini AI...');
      }

      // API Call to /api/parse-cv
      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setProcessingStage('Mengekstrak entitas data & memetakan ke skema JSON A4...');

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Gagal memproses dokumen dengan Gemini API.');
      }

      setProcessingStage('Memvalidasi integritas data & memperbarui Live Preview...');

      const validation = validateCVJson(result.data);
      if (!validation.isValid && validation.errors.length > 0) {
        console.warn('Validasi mendeteksi beberapa ketidaksesuaian kecil, namun tetap dapat diproses:', validation.errors);
      }

      // Populate data into UI & Live Preview
      onCVGenerated(result.data);

      setSuccessMessage('Dokumen CV berhasil dipetakan! Tampilan Live Preview A4 telah diperbarui secara instan.');

      // Auto dismiss / notify
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1500);

    } catch (err: any) {
      console.error('Gagal generate CV:', err);
      let displayMsg = err.message || 'Terjadi kesalahan tidak terduga saat menganalisis dokumen.';
      try {
        if (typeof displayMsg === 'string' && displayMsg.includes('{') && displayMsg.includes('error')) {
          const jsonMatch = displayMsg.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed?.error?.message) {
              displayMsg =
                parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE' || parsed.error.message.includes('high demand')
                  ? "Server AI sedang mengalami lonjakan antrean sementara (High Demand). Silakan klik tombol 'Coba Lagi' di bawah untuk mencoba server cadangan."
                  : parsed.error.message;
            }
          }
        }
      } catch {
        // use raw displayMsg
      }

      setErrorMessage(displayMsg);
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Parser Dokumen & AI CV Generator
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gemini Flash AI
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Unggah CV Anda dalam format PDF, DOCX (Word), atau Teks Polos untuk diekstrak otomatis ke template A4.
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => { setActiveInputMode('file'); setErrorMessage(null); }}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeInputMode === 'file'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Unggah Berkas</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveInputMode('text'); setErrorMessage(null); }}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeInputMode === 'text'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Tempel Teks CV</span>
          </button>
        </div>
      </div>

      {/* Mode 1: File Upload (PDF / DOCX / TXT) */}
      {activeInputMode === 'file' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleInputChange}
            className="hidden"
            id="cv-doc-file-upload"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/60 hover:bg-slate-950'
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <FileUp className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Tarik dan lepas berkas CV di sini, atau <span className="text-amber-400 underline underline-offset-2">pilih dari komputer</span>
                </p>
                <p className="text-xs text-slate-400">
                  Mendukung dokumen <strong>PDF (.pdf)</strong>, <strong>Microsoft Word (.docx)</strong>, atau <strong>Teks (.txt)</strong> hingga 20MB
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <FileType className="w-3.5 h-3.5 text-red-400" /> PDF
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-400" /> DOCX
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> TXT
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap di-generate
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Ganti Berkas
                </button>
                <button
                  type="button"
                  onClick={handleClearFile}
                  disabled={isProcessing}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Hapus berkas terpilih"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Direct Plain Text Paste */}
      {activeInputMode === 'text' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ClipboardPaste className="w-3.5 h-3.5 text-amber-400" />
              Isi Teks CV / Resume:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-sample-arya"
                onClick={handleLoadSampleText}
                disabled={isProcessing}
                className="text-xs text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                title="Muat contoh lengkap CV Backend Engineer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Contoh 1: Lengkap (Arya)</span>
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                id="btn-sample-short"
                onClick={handleLoadShortSampleText}
                disabled={isProcessing}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1"
                title="Muat draf CV singkat untuk menguji optimasi kalimat otomatis"
              >
                <Sparkles className="w-3 h-3" />
                <span>Contoh 2: Uji Optimasi Otomatis (Dian)</span>
              </button>
            </div>
          </div>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={isProcessing}
            rows={8}
            placeholder="Tempelkan seluruh teks CV Anda di sini (Nama, Kontak, Ringkasan, Pengalaman Kerja, Keahlian, Pendidikan, dll)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono resize-y leading-relaxed"
          />
        </div>
      )}

      {/* Feature 3: Automatic Data Optimization Checkbox */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3">
        <input
          type="checkbox"
          id="optimize-phrasing-toggle"
          checked={optimizePhrasing}
          onChange={(e) => setOptimizePhrasing(e.target.checked)}
          disabled={isProcessing}
          className="mt-1 h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500"
        />
        <label htmlFor="optimize-phrasing-toggle" className="text-xs text-slate-300 cursor-pointer select-none">
          <span className="font-bold text-white block mb-0.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Optimalkan Kalimat & Poin Pencapaian Kerja Secara Otomatis
          </span>
          <span className="text-slate-400 text-[11px] leading-normal">
            Jika ada deskripsi pekerjaan yang terlalu singkat, Gemini AI akan memoles susunan kalimatnya menggunakan kata kerja aksi profesional (Action-Oriented ATS) tanpa mengubah fakta nama perusahaan, jabatan, atau riwayat asli Anda.
          </span>
        </label>
      </div>

      {/* Error & Success Feedback Alerts */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-300">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <strong className="block font-semibold">Gagal Memproses Dokumen:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              id="btn-retry-generate-cv"
              onClick={handleGenerateCV}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup pesan"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <div className="flex-1">
            <strong className="block font-semibold">Berhasil!</strong>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Trigger Button: Generate CV */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Didukung oleh Gemini AI Engine (Auto Failover & Retries)</span>
        </div>

        <button
          type="button"
          id="btn-generate-cv"
          onClick={handleGenerateCV}
          disabled={isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>{processingStage || 'Sedang memproses dokumen...'}</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate CV dari Dokumen</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
