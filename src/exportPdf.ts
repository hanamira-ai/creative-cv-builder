import { saveAs } from 'file-saver';
import { CVData } from './types';
import { generateStandaloneCVHtml } from './templateHtmlGenerator';

/**
 * =========================================================================
 * EKSPOR PDF — NATIVE PRINT PIPELINE (VECTOR TEXT, EDITABLE)
 * =========================================================================
 *
 * PERUBAHAN MENDASAR dari versi sebelumnya:
 *   html2pdf.js / html2canvas / jsPDF DIBUANG TOTAL dari jalur PDF.
 *
 * Alasan:
 *   1. html2canvas memotret DOM jadi bitmap -> PDF berisi 1 gambar JPEG
 *      per halaman, 0 karakter teks. Tidak bisa diedit di PDF-XChange.
 *   2. Mesin print browser memakai layout engine yang SAMA dengan preview,
 *      sehingga "preview != hasil" tidak mungkin terjadi lagi.
 *   3. Semua tambalan oklch (safeConvertColor, proxy getComputedStyle,
 *      patch-html2canvas.cjs) tidak lagi diperlukan.
 *
 * Yang dicetak adalah DOM React (#cv-paper-target) apa adanya, bukan
 * HTML hasil generateStandaloneCVHtml() — karena keduanya menghasilkan
 * markup berbeda (paginasi, footer, mini-header lembar 2 hanya ada di React).
 */

export interface PdfExportOptions {
  filename?: string;
  onProgress?: (step: string) => void;
  /** Batas waktu tunggu font & gambar (ms). Default 4000. */
  assetTimeoutMs?: number;
}

/**
 * Membuka tab mandiri baru (bukan iframe), menyalin DOM #cv-paper-target
 * beserta seluruh <style> dan <link rel="stylesheet">, lalu memicu window.print()
 * di dalam tab baru tersebut.
 * 
 * Karena tab baru ini adalah top-level window (bukan iframe sandbox),
 * browser tidak akan memblokir dialog modal window.print().
 */
export async function openInNewTabAndPrint(
  elementId: string = 'cv-paper-target',
  options: PdfExportOptions = {}
): Promise<void> {
  const { filename = 'Curriculum_Vitae_A4.pdf', onProgress } = options;
  console.log('[exportPdf:newTab:1] Membuka window baru untuk cetak PDF...');
  onProgress?.('Membuka tab baru untuk cetak PDF...');

  const element =
    document.getElementById(elementId) ||
    document.getElementById('cv-paper-target');

  if (!element) {
    const errorMsg = "Elemen CV target ('cv-paper-target') tidak ditemukan di DOM.";
    console.error('[exportPdf:newTab:ERROR]', errorMsg);
    throw new Error(errorMsg);
  }

  // Buka window baru langsung pada stack event klik agar tidak diblokir popup blocker
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    const errorMsg =
      'Browser memblokir pembukaan tab baru (pop-up blocker). Harap izinkan pop-up untuk situs ini lalu coba lagi.';
    console.warn('[exportPdf:newTab:BLOCKED]', errorMsg);
    alert(errorMsg);
    return;
  }

  const docTitle = filename.replace(/\.pdf$/i, '');

  // Kumpulkan seluruh stylesheet dan tag style dari dokumen induk saat ini
  let headStylesHtml = '';
  const headElements = document.querySelectorAll('link[rel="stylesheet"], style');
  headElements.forEach((el) => {
    headStylesHtml += el.outerHTML + '\n';
  });

  // Salin clone elemen #cv-paper-target
  const clonedTarget = element.cloneNode(true) as HTMLElement;
  // Hapus semua elemen dekoratif/no-print
  const noPrintNodes = clonedTarget.querySelectorAll('.no-print');
  noPrintNodes.forEach((node) => node.remove());

  // Pastikan inline style pada clone siap untuk print
  const newTabHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle}</title>
  ${headStylesHtml}
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      width: 210mm !important;
      min-height: 100% !important;
      overflow: visible !important;
    }
    .no-print {
      display: none !important;
    }
    #cv-paper-target, .cv-pages-wrapper {
      margin: 0 auto !important;
      padding: 0 !important;
      width: 210mm !important;
      max-width: 210mm !important;
      display: block !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    .cv-page-sheet {
      margin: 0 !important;
      width: 210mm !important;
      min-width: 210mm !important;
      max-width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      background-color: #ffffff !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
    }
    .cv-page-sheet:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    @media screen {
      body {
        background-color: #0f172a !important;
        padding: 24px 0 !important;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
      }
      .tab-toolbar {
        width: 210mm;
        max-width: calc(100vw - 32px);
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 12px 18px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: system-ui, -apple-system, sans-serif;
      }
      .cv-page-sheet {
        margin-bottom: 24px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
      }
    }
  </style>
</head>
<body>
  <div class="tab-toolbar no-print">
    <div>
      <div style="font-weight: 700; color: #f8fafc; font-size: 14px;">Siap Cetak / Simpan PDF A4</div>
      <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">
        Pilih Destination: <strong>Save as PDF</strong> &bull; Margins: <strong>None</strong> &bull; Centang <strong>Background graphics</strong>
      </div>
    </div>
    <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
      Buka Dialog Cetak
    </button>
  </div>
  ${clonedTarget.outerHTML}
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(newTabHtml);
  printWindow.document.close();

  console.log('[exportPdf:newTab:2] Dokumen tab baru ditulis. Menunggu aset fonts dan images...');
  onProgress?.('Menunggu aset fonts & gambar di tab baru...');

  setTimeout(async () => {
    try {
      if (printWindow.document.fonts) {
        await printWindow.document.fonts.ready;
      }
      const imgs = Array.from(printWindow.document.images);
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );
    } catch (e) {
      console.warn('[exportPdf:newTab] Peringatan saat menunggu aset:', e);
    }

    console.log('[exportPdf:newTab:3] Aset siap, memanggil window.print() di tab baru...');
    onProgress?.('Aset siap, membuka dialog cetak di tab baru...');
    printWindow.focus();
    printWindow.print();
  }, 400);
}

/**
 * Ekspor CV ke PDF lewat mekanisme tab baru yang handal (vektor & editable).
 * Jalur lama yang memanggil window.print() langsung di window utama telah dihentikan/dinonaktifkan
 * karena browser memblokir window.print() di dalam iframe preview.
 * Fungsi ini sekarang langsung meneruskan pemanggilan ke openInNewTabAndPrint.
 */
export async function exportEditableVectorPDF(
  elementId: string = 'cv-paper-target',
  options: PdfExportOptions = {}
): Promise<void> {
  console.log('[exportPdf] exportEditableVectorPDF dialihkan ke openInNewTabAndPrint');
  return openInNewTabAndPrint(elementId, options);
}

// Alias kompatibilitas mundur — semua mengarah ke openInNewTabAndPrint
export const downloadPDF = openInNewTabAndPrint;
export const downloadNativePDF = openInNewTabAndPrint;
export const exportToPdfClient = openInNewTabAndPrint;
export const handleExportPDF = openInNewTabAndPrint;
export const openPrintDialog = openInNewTabAndPrint;

/**
 * Unduh berkas .html mandiri sebagai arsip / jalur cadangan.
 * Berkas ini bisa dibuka kapan saja lalu di-print ke PDF secara manual.
 *
 * PERINGATAN: keluaran generateStandaloneCVHtml() TIDAK identik dengan
 * preview React (tanpa paginasi, footer, dan mini-header lembar 2).
 * Selama kedua renderer belum disatukan, jangan jadikan ini jalur utama.
 */
export function downloadStandaloneHtml(
  data: CVData,
  themeId: string = 'navy-gold',
  sidebarTheme: 'light' | 'dark' = 'dark',
  badgeTheme: 'light' | 'dark' = 'dark'
): void {
  const html = generateStandaloneCVHtml(data, themeId, sidebarTheme, badgeTheme);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });

  const safeName = (data.personal_info?.name || 'cv')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  saveAs(blob, `CV_${safeName}.html`);
}

/**
 * Puppeteer Node.js Script Template for Server-Side Pixel-Perfect PDF
 */
export const PUPPETEER_SERVER_SCRIPT = `/**
 * =========================================================================
 * SERVER-SIDE PDF GENERATOR DENGAN PUPPETEER (PIXEL-PERFECT)
 * =========================================================================
 * Cara instalasi:
 * npm install puppeteer express
 */

const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json({ limit: '10mb' }));

app.post('/api/export/pdf', async (req, res) => {
  const { htmlContent, filename = 'CV_Guruh_Wicaksono.pdf' } = req.body;
  
  let browser = null;
  try {
    // 1. Launch Headless Chromium
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none'
      ]
    });

    const page = await browser.newPage();

    // 2. Set viewport ke resolusi tajam
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    // 3. Inject HTML & CSS langsung ke DOM browser headless
    await page.setContent(htmlContent, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    // Tunggu web font ter-render sempurna
    await page.evaluateHandle('document.fonts.ready');

    // 4. Print ke PDF dengan parameter A4 ketat
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });

    // 5. Kirim respon PDF binary stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', \`attachment; filename="\${filename}"\`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);

  } catch (error) {
    console.error('Puppeteer PDF Generation Error:', error);
    res.status(500).json({ error: 'Gagal membuat file PDF di server', details: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(3000, () => console.log('PDF Server ready on port 3000'));
`;