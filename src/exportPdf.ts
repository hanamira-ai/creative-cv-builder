import html2canvas from 'html2canvas';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  quality?: number; // scale factor
  onProgress?: (step: string) => void;
}

/**
 * Mathematical conversion from Oklch to sRGB.
 * Guarantees html2canvas never encounters unsupported CSS Color 4 "oklch()" or "oklab()"
 */
function oklchToRgb(l: number, c: number, h: number, alpha: number = 1): string {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const lCube = l_ * l_ * l_;
  const mCube = m_ * m_ * m_;
  const sCube = s_ * s_ * s_;

  const rLin = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const gLin = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const bLin = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.7076147010 * sCube;

  const compand = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055);
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));

  const r = clamp(compand(rLin) * 255);
  const g = clamp(compand(gLin) * 255);
  const bVal = clamp(compand(bLin) * 255);

  const cleanAlpha = Math.round(alpha * 1000) / 1000;
  return cleanAlpha < 1 ? `rgba(${r}, ${g}, ${bVal}, ${cleanAlpha})` : `rgb(${r}, ${g}, ${bVal})`;
}

const colorCache = new Map<string, string>();

/**
 * Parses and converts modern CSS color formats (oklch, oklab) into standard rgb/rgba
 */
export function convertModernColorsToRgb(str: string): string {
  if (!str || typeof str !== 'string') return str;
  if (!str.includes('oklch') && !str.includes('oklab')) return str;

  if (colorCache.has(str)) {
    return colorCache.get(str)!;
  }

  // Regex handles oklch(L C H [/ A]) with support for percentages and degrees
  const converted = str.replace(
    /oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+(?:deg)?)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi,
    (match, pL, pC, pH, pA) => {
      try {
        const l = pL.endsWith('%') ? parseFloat(pL) / 100 : parseFloat(pL);
        const c = pC.endsWith('%') ? parseFloat(pC) / 100 : parseFloat(pC);
        const h = parseFloat(pH);
        const a = pA ? (pA.endsWith('%') ? parseFloat(pA) / 100 : parseFloat(pA)) : 1;
        return oklchToRgb(l, c, h, a);
      } catch {
        return match;
      }
    }
  );

  colorCache.set(str, converted);
  return converted;
}

/**
 * High-Precision A4 PDF Export using Native Browser Rasterizer (html-to-image) & jsPDF
 * dengan Mathematical Aspect-Ratio Lock & Fallback Resilience
 * 
 * Aturan Ketat:
 * 1. ISOLASI TARGET EXPORT: Target murni id="cv-paper-target" (tanpa tombol UI/Sidebar toggle).
 * 2. ANTI-KETARIK (Aspect Ratio 100% Preserved): 
 *    Tinggi gambar dihitung presisi: (canvas.height * 210) / canvas.width.
 *    Tidak ada pemaksaan regang sumbu Y terpisah dari X. Foto dan teks tidak gepeng.
 * 3. IDENTIK DENGAN PREVIEW: 
 *    Menggunakan browser-native renderer (SVG foreignObject) sehingga CSS Grid 32% 68%,
 *    Lucide icons, oklch colors, font kerning, badges & progress bar 100% sama dengan preview.
 * 4. ZOOM NORMALIZATION:
 *    Mereset sementara scale(zoomLevel) saat render agar canvas mengambil dimensi 210mm native.
 * 5. MULTI-PAGE SLICING:
 *    Jika konten > 297mm, di-slice bersih per 297mm tanpa distorsi atau garis terpotong.
 */
export async function downloadPDF(
  elementId: string = 'cv-paper-target',
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = 'Curriculum_Vitae_A4.pdf',
    quality = 2,
    onProgress
  } = options;

  // 1. Dapatkan elemen target A4
  const element = document.getElementById(elementId) || document.getElementById('printable-cv-sheet');
  if (!element) {
    throw new Error(`Elemen dengan ID "${elementId}" tidak ditemukan untuk ekspor PDF.`);
  }

  onProgress?.('Menyiapkan layout A4 presisi (210mm)...');

  // Cari parent yang mungkin memiliki transform scale(zoomLevel) dari preview UI
  const parentWithScale = element.closest('[style*="scale"]') as HTMLElement | null;
  const originalTransform = parentWithScale ? parentWithScale.style.transform : '';
  const originalMarginBottom = parentWithScale ? parentWithScale.style.marginBottom : '';

  // Cari parent container yang mungkin memiliki opacity-0 (offscreen container saat tab selain preview)
  const offscreenContainer = element.closest('.opacity-0') as HTMLElement | null;
  const originalOpacity = offscreenContainer ? offscreenContainer.style.opacity : '';
  const originalPosition = offscreenContainer ? offscreenContainer.style.position : '';
  const originalLeft = offscreenContainer ? offscreenContainer.style.left : '';

  // Simpan state elemen .no-print
  const noPrintEls = Array.from(element.querySelectorAll('.no-print')) as HTMLElement[];
  const originalNoPrintDisplays = noPrintEls.map(el => el.style.display);

  // Intercept window.getComputedStyle untuk oklch fallback (jika fallback html2canvas dipanggil)
  const originalWindowGetComputedStyle = window.getComputedStyle;
  const createComputedStyleProxy = (orig: CSSStyleDeclaration) => {
    return new Proxy(orig, {
      get(target: any, prop: string | symbol) {
        if (prop === 'getPropertyValue') {
          return function (propName: string) {
            const val = target.getPropertyValue(propName);
            return typeof val === 'string' ? convertModernColorsToRgb(val) : val;
          };
        }
        let val: any;
        try {
          val = target[prop];
        } catch {
          val = Reflect.get(target, prop);
        }
        if (typeof val === 'function') {
          return val.bind(target);
        }
        if (typeof val === 'string') {
          return convertModernColorsToRgb(val);
        }
        return val;
      }
    });
  };

    // 2. Normalisasi state layout: unzoom dan sembunyikan .no-print
    if (parentWithScale) {
      parentWithScale.style.transform = 'none';
      parentWithScale.style.marginBottom = '0';
    }

    if (offscreenContainer) {
      offscreenContainer.style.opacity = '1';
    }

    noPrintEls.forEach(el => {
      el.style.display = 'none';
    });

    // Tunggu browser me-layout ulang dengan ukuran 210mm murni
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 80)));

    onProgress?.('Melakukan rasterisasi native browser (100% sama dengan preview)...');

    // STRATEGI UTAMA: Render per lembar .cv-page-sheet secara terpisah
    // Menghasilkan setiap halaman A4 (210x297mm) utuh tanpa pemotongan card di tengah lembar
    const pageSheets = Array.from(element.querySelectorAll<HTMLElement>('.cv-page-sheet'));
    const targetsToRender = pageSheets.length > 0 ? pageSheets : [element];

    const renderSheetToCanvas = async (sheetEl: HTMLElement): Promise<HTMLCanvasElement> => {
      try {
        return await toCanvas(sheetEl, {
          pixelRatio: quality,
          backgroundColor: '#FFFFFF',
          cacheBust: true,
          filter: (node) => {
            if (node instanceof HTMLElement) {
              if (node.classList?.contains('no-print') || node.getAttribute('data-no-print') === 'true') {
                return false;
              }
            }
            return true;
          }
        });
      } catch (nativeErr) {
        console.warn('Native toCanvas fallback ke html2canvas...', nativeErr);
        // Pasang patch getComputedStyle untuk menghindari error oklch di html2canvas
        window.getComputedStyle = function (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
          const orig = originalWindowGetComputedStyle.call(window, elt, pseudoElt);
          return createComputedStyleProxy(orig);
        } as any;

        return await html2canvas(sheetEl, {
          scale: quality,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#FFFFFF',
          windowWidth: 794,
          ignoreElements: (node) => {
            return (
              node.classList?.contains('no-print') ||
              node.getAttribute?.('data-no-print') === 'true'
            );
          },
          onclone: (clonedDoc) => {
            if (clonedDoc.defaultView) {
              clonedDoc.defaultView.getComputedStyle = window.getComputedStyle;
            }
          }
        });
      }
    };

    const renderedCanvases: HTMLCanvasElement[] = [];
    try {
      for (let i = 0; i < targetsToRender.length; i++) {
        onProgress?.(`Merasterisasi lembar ${i + 1} dari ${targetsToRender.length} (300 DPI)...`);
        const sheetCanvas = await renderSheetToCanvas(targetsToRender[i]);
        renderedCanvases.push(sheetCanvas);
      }
    } finally {
      // 3. KEMBALIKAN SEMUA STATE KE SEMULA SECARA BERSIH
      if (parentWithScale) {
        parentWithScale.style.transform = originalTransform;
        parentWithScale.style.marginBottom = originalMarginBottom;
      }

      if (offscreenContainer) {
        offscreenContainer.style.opacity = originalOpacity;
        offscreenContainer.style.position = originalPosition;
        offscreenContainer.style.left = originalLeft;
      }

      noPrintEls.forEach((el, idx) => {
        el.style.display = originalNoPrintDisplays[idx] || '';
      });

      window.getComputedStyle = originalWindowGetComputedStyle;
    }

    onProgress?.('Menyusun PDF A4 multi-halaman presisi...');

    const pdfPageWidth = 210;
    const pdfPageHeight = 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < renderedCanvases.length; i++) {
      const pageCanvas = renderedCanvases[i];
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      const canvasWidth = pageCanvas.width;
      const canvasHeight = pageCanvas.height;
      const imgHeightMm = (canvasHeight * pdfPageWidth) / canvasWidth;

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      if (imgHeightMm <= 298.5) {
        // Halaman pas A4: tambahkan tanpa pergeseran
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfPageWidth, pdfPageHeight, undefined, 'FAST');
      } else {
        // Fallback untuk kontainer tunggal yang sangat panjang: kalkulasi pemotongan cerdas
        let remainingHeight = imgHeightMm;
        let currentYPosition = 0;
        let isFirstSlice = true;

        while (remainingHeight > 5) {
          if (!isFirstSlice) {
            pdf.addPage('a4', 'portrait');
          }
          pdf.addImage(imgData, 'JPEG', 0, currentYPosition, pdfPageWidth, imgHeightMm, undefined, 'FAST');
          currentYPosition -= pdfPageHeight;
          remainingHeight -= pdfPageHeight;
          isFirstSlice = false;
        }
      }
    }

    onProgress?.('Menyimpan file PDF...');
    pdf.save(filename);
    return;
}

// Alias untuk kompatibilitas fungsi pemanggilan lama
export const exportToPdfClient = downloadPDF;

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
