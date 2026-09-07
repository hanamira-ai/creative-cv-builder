import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  quality?: number; // scale factor (e.g. 2 for 200dpi, 2.5 for 250+ dpi)
  onProgress?: (step: string) => void;
}

/**
 * Client-side High-Resolution PDF Export using html-to-image & jsPDF
 * Uses native browser SVG foreignObject rendering which fully supports
 * modern CSS specifications including Tailwind v4 oklch(), CSS variables,
 * flexbox, and web fonts without throwing color parser errors.
 */
export async function exportToPdfClient(
  elementId: string = 'printable-cv-sheet',
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = 'Curriculum_Vitae_A4.pdf',
    quality = 2.5,
    onProgress
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemen dengan ID "${elementId}" tidak ditemukan untuk ekspor PDF.`);
  }

  onProgress?.('Menyiapkan kanvas render presisi A4...');

  // Capture element using html-to-image (browser-native rendering)
  // Supports modern CSS (oklch, color-mix, CSS variables) natively
  let canvas: HTMLCanvasElement;
  try {
    canvas = await toCanvas(element, {
      pixelRatio: quality,
      backgroundColor: '#FFFFFF',
      cacheBust: true,
      style: {
        transform: 'none',
        margin: '0',
        boxShadow: 'none'
      }
    });
  } catch (renderError: any) {
    console.warn('First render attempt with fonts failed, retrying with fallback...', renderError);
    // Resilient fallback in case of cross-origin font CORS restrictions
    canvas = await toCanvas(element, {
      pixelRatio: quality,
      backgroundColor: '#FFFFFF',
      skipFonts: true,
      style: {
        transform: 'none',
        margin: '0',
        boxShadow: 'none'
      }
    });
  }

  onProgress?.('Mengonversi ke format dokumen PDF A4...');

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // A4 dimensions in millimeters: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  // Calculate image height based on aspect ratio
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  // Add image to page
  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));

  onProgress?.('Menyimpan file PDF...');
  pdf.save(filename);
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
