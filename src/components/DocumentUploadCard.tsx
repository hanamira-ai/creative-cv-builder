import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  FileUp, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Wand2, 
  ClipboardPaste,
  Globe,
  RotateCcw,
  Check
} from 'lucide-react';
import { CVData } from '../types';
import { validateCVJson, normalizeWebsiteUrl } from '../validator';
import { AI_PRIVACY_NOTICE } from '../privacyNotice';

interface DocumentUploadCardProps {
  onCVGenerated: (data: CVData) => void;
  candidateName?: string;
  initialLanguage?: 'id' | 'en';
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  onCVGenerated,
  candidateName = '',
  initialLanguage = 'id',
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [optimizePhrasing, setOptimizePhrasing] = useState<boolean>(true);
  const [targetLanguage, setTargetLanguage] = useState<'id' | 'en'>(initialLanguage);
  
  // Loading & Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper convert File to Base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
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
    if (!privacyAccepted) return;
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
      setErrorMessage(`Gagal membaca berkas: ${err?.message || 'Kesalahan pembacaan'}`);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!privacyAccepted) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!privacyAccepted) return;
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
Domisili: Surabaya, Jawa Timur, Indonesia
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

  // Main Trigger: Generate CV with Gemini AI
  const handleGenerateCV = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!privacyAccepted) {
      setErrorMessage('Harap centang persetujuan privasi data terlebih dahulu.');
      return;
    }

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
      setProcessingStage('Mempersiapkan dokumen dan preferensi bahasa...');

      const payload: any = {
        optimizePhrasing,
        target_language: targetLanguage,
        targetLanguage: targetLanguage
      };

      const langLabel = targetLanguage === 'en' ? 'English' : 'Bahasa Indonesia';

      const resolveUploadMimeType = (file: File): string => {
        if (file.type && file.type !== 'application/octet-stream') {
          return file.type;
        }
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith('.txt')) return 'text/plain';
        if (lowerName.endsWith('.pdf')) return 'application/pdf';
        if (lowerName.endsWith('.docx')) {
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        return file.type || 'application/octet-stream';
      };

      if (activeInputMode === 'file' && selectedFile) {
        payload.fileBase64 = fileBase64;
        payload.mimeType = resolveUploadMimeType(selectedFile);
        payload.fileName = selectedFile.name;
        setProcessingStage(`Menganalisis berkas ${selectedFile.name} dengan Gemini AI (Target: ${langLabel})...`);
      } else {
        payload.textContent = pastedText.trim();
        setProcessingStage(`Menganalisis teks CV dengan Gemini AI (Target: ${langLabel})...`);
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

      let result: any = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (response.status === 429) {
        throw new Error(
          result?.error || 'Terlalu banyak permintaan. Coba lagi dalam beberapa menit.'
        );
      }

      if (response.status === 413) {
        throw new Error(
          result?.error || 'Ukuran berkas terlalu besar untuk diproses. Maksimal ukuran berkas adalah 20MB.'
        );
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Gagal memproses dokumen dengan Gemini API.');
      }

      setProcessingStage('Memvalidasi data & memperbarui Live Preview A4...');

      // Perlakukan output Gemini sebagai data tidak tepercaya: normalisasi & validasi URL website
      if (result.data?.personal_info?.contact) {
        const rawWebsite = result.data.personal_info.contact.website;
        const websiteCheck = normalizeWebsiteUrl(rawWebsite);
        result.data.personal_info.contact.website = websiteCheck.isValid ? websiteCheck.normalizedUrl : '';
      }

      const validation = validateCVJson(result.data);
      if (!validation.isValid && validation.errors.length > 0) {
        console.warn('Validasi mendeteksi beberapa ketidaksesuaian kecil, namun tetap diproses:', validation.errors);
      }

      // Update CV data on parent state
      onCVGenerated(result.data);

      setSuccessMessage('CV Berhasil Di-generate! Tampilan Pratinjau A4 di bawah telah diperbarui secara otomatis.');
      
      // Clear success notification after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

    } catch (err: any) {
      console.error('Gagal generate CV:', err);
      let displayMsg = err.message || 'Terjadi kesalahan saat menganalisis dokumen.';
      try {
        if (typeof displayMsg === 'string' && displayMsg.includes('{') && displayMsg.includes('error')) {
          const jsonMatch = displayMsg.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed?.error?.message) {
              displayMsg =
                parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE' || parsed.error.message.includes('high demand')
                  ? "Server AI sedang mengalami antrean padat sementara. Silakan klik tombol 'Coba Lagi' di bawah untuk terhubung ke server cadangan."
                  : parsed.error.message;
            }
          }
        }
      } catch {
        // use displayMsg as is
      }

      setErrorMessage(displayMsg);
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div 
      id="document-upload-section"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-200 no-print shadow-md flex flex-col gap-4"
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Unggah Dokumen & Generate CV Otomatis
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-semibold">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Unggah berkas CV lama atau tempelkan teks resume Anda untuk otomatis mengisi format A4 & live preview di bawah.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-center">
          <button
            type="button"
            id="btn-mode-file"
            onClick={() => setActiveInputMode('file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeInputMode === 'file'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Unggah Berkas</span>
          </button>
          <button
            type="button"
            id="btn-mode-text"
            onClick={() => setActiveInputMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeInputMode === 'text'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Tempel Teks</span>
          </button>
        </div>
      </div>

      {/* Pemberitahuan Privasi & Persetujuan Wajib */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>{AI_PRIVACY_NOTICE}</p>
        </div>
        <label className="flex items-center gap-2.5 text-xs font-semibold text-white cursor-pointer select-none pt-1 border-t border-slate-800/80">
          <input
            type="checkbox"
            id="privacy-consent-main"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            disabled={isProcessing}
            className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20 w-4 h-4 cursor-pointer accent-amber-500"
          />
          <span>Saya memahami dan menyetujui pemrosesan ini</span>
        </label>
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        id="document-file-input"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleInputChange}
        disabled={!privacyAccepted || isProcessing}
        className="hidden"
      />

      {/* Input Mode 1: File Drag & Drop */}
      {activeInputMode === 'file' && (
        <div>
          {!selectedFile ? (
            <div
              id="file-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!privacyAccepted || isProcessing) return;
                fileInputRef.current?.click();
              }}
              aria-disabled={!privacyAccepted || isProcessing}
              className={`border-2 border-dashed rounded-xl p-5 sm:p-7 text-center transition-all flex flex-col items-center justify-center gap-2.5 ${
                !privacyAccepted || isProcessing
                  ? 'border-slate-800 bg-slate-950/40 opacity-55 cursor-not-allowed'
                  : isDragging
                    ? 'border-amber-400 bg-amber-500/10 cursor-pointer'
                    : 'border-slate-700/80 bg-slate-950/60 hover:border-amber-500/50 hover:bg-slate-950 cursor-pointer'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Tarik & lepas berkas ke sini, atau <span className="text-amber-400 underline underline-offset-2">pilih dokumen</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mendukung format <strong>PDF (.pdf)</strong>, <strong>Word (.docx)</strong>, dan <strong>Teks (.txt)</strong> hingga 20MB
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!privacyAccepted || isProcessing}
                  className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Ganti Berkas
                </button>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-rose-900/40 transition-colors cursor-pointer"
                  title="Hapus berkas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Mode 2: Paste Raw Text */}
      {activeInputMode === 'text' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tempelkan isi profil atau catatan resume:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSampleText}
                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Muat Contoh Teks</span>
              </button>
              {pastedText && (
                <button
                  type="button"
                  onClick={() => setPastedText('')}
                  className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
                >
                  Bersihkan
                </button>
              )}
            </div>
          </div>
          <textarea
            id="cv-text-input-main"
            rows={4}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Contoh: Nama: Budi Santoso, Jabatan: Fullstack Developer, Kontak: budi@contoh-email.id, Pengalaman kerja di PT ABC (2020-2023) mengembangkan microservices..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-y font-mono leading-relaxed"
          />
        </div>
      )}

      {/* Options & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        {/* Left: Language & Enhancement Preferences */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Language Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Bahasa CV:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setTargetLanguage('id')}
                className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                  targetLanguage === 'id'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Hasil CV dalam Bahasa Indonesia"
              >
                🇮🇩 ID
              </button>
              <button
                type="button"
                onClick={() => setTargetLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                  targetLanguage === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Hasil CV dalam English"
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {/* Diction Optimization Toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={optimizePhrasing}
              onChange={(e) => setOptimizePhrasing(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Optimasi diksi & action verbs</span>
          </label>
        </div>

        {/* Right: Main Generate Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-generate-cv-main"
            onClick={handleGenerateCV}
            disabled={!privacyAccepted || isProcessing || (activeInputMode === 'file' ? !selectedFile : !pastedText.trim())}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
              !privacyAccepted || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : activeInputMode === 'file'
                  ? selectedFile
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  : pastedText.trim()
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Memproses Dokumen...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate CV Otomatis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time processing indicator banner */}
      {isProcessing && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-200">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
          <span className="font-mono text-amber-300">{processingStage || 'Sedang berkomunikasi dengan Gemini AI...'}</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-300">
          <div className="flex items-start sm:items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleGenerateCV}
              disabled={!privacyAccepted || isProcessing}
              className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
