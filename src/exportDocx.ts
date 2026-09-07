import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  convertMillimetersToTwip
} from 'docx';
import { CVData } from './types';
import { CV_THEMES } from './themes';

/**
 * Generate real Microsoft Word (.docx) file with a 2-column table layout
 * matching the A4 dimensions and theme colors.
 */
export async function generateDocxBlob(data: CVData, themeId: string): Promise<Blob> {
  const currentTheme = CV_THEMES[themeId] || CV_THEMES['navy-gold'];

  // Clean hex colors without '#'
  const primaryHex = currentTheme.vars.primary.replace('#', '');
  const accentHex = currentTheme.vars.accent.replace('#', '');
  const bgSidebarHex = currentTheme.vars.bgSidebar.replace('#', '');

  // 1. Sidebar Left Content Cells
  const sidebarElements: Paragraph[] = [
    // Header Avatar / Initials
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `[ ${data.personal_info.name.charAt(0)} ]`,
          bold: true,
          size: 32,
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    }),

    // SECTION: KONTAK
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 150, after: 80 },
      children: [
        new TextRun({
          text: 'KONTAK',
          bold: true,
          size: 18,
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    }),
  ];

  if (data.personal_info.contact.phone) {
    sidebarElements.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'Telp: ', bold: true, size: 16, color: accentHex, font: 'Arial' }),
          new TextRun({ text: data.personal_info.contact.phone, size: 16, font: 'Arial' }),
        ],
      })
    );
  }

  if (data.personal_info.contact.email) {
    sidebarElements.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'Email: ', bold: true, size: 16, color: accentHex, font: 'Arial' }),
          new TextRun({ text: data.personal_info.contact.email, size: 16, font: 'Arial' }),
        ],
      })
    );
  }

  if (data.personal_info.contact.address) {
    sidebarElements.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'Lokasi: ', bold: true, size: 16, color: accentHex, font: 'Arial' }),
          new TextRun({ text: data.personal_info.contact.address, size: 16, font: 'Arial' }),
        ],
      })
    );
  }

  if (data.personal_info.contact.linkedin) {
    sidebarElements.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'LinkedIn: ', bold: true, size: 16, color: accentHex, font: 'Arial' }),
          new TextRun({ text: data.personal_info.contact.linkedin, size: 16, font: 'Arial' }),
        ],
      })
    );
  }

  if (data.personal_info.contact.github) {
    sidebarElements.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'GitHub: ', bold: true, size: 16, color: accentHex, font: 'Arial' }),
          new TextRun({ text: data.personal_info.contact.github, size: 16, font: 'Arial' }),
        ],
      })
    );
  }

  // SECTION: KEAHLIAN INTI
  sidebarElements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: 'KEAHLIAN INTI',
          bold: true,
          size: 18,
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    })
  );

  data.core_skills.forEach((skill) => {
    sidebarElements.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `• ${skill.skill_name} `, bold: true, size: 16, font: 'Arial' }),
          new TextRun({ text: `(${skill.proficiency_level})`, size: 14, color: accentHex, font: 'Arial' }),
        ],
      })
    );
  });

  // SECTION: TECH STACK
  sidebarElements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: 'TECH STACK',
          bold: true,
          size: 18,
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    })
  );

  data.tech_stack.forEach((tech) => {
    sidebarElements.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${tech.category}: `, bold: true, size: 16, color: primaryHex, font: 'Arial' }),
          new TextRun({ text: tech.tool, size: 16, font: 'Arial' }),
        ],
      })
    );
    if (tech.description) {
      sidebarElements.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: tech.description, size: 14, color: '666666', font: 'Arial', italics: true }),
          ],
        })
      );
    }
  });

  // SECTION: BAHASA
  if (data.languages && data.languages.length > 0) {
    sidebarElements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: 'BAHASA',
            bold: true,
            size: 18,
            color: primaryHex,
            font: 'Arial',
          }),
        ],
      })
    );

    data.languages.forEach((lang) => {
      sidebarElements.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${lang.language}: `, bold: true, size: 16, font: 'Arial' }),
            new TextRun({ text: lang.level, size: 14, color: '666666', font: 'Arial' }),
          ],
        })
      );
    });
  }

  // SECTION: SERTIFIKASI
  if (data.certifications && data.certifications.length > 0) {
    sidebarElements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: 'SERTIFIKASI',
            bold: true,
            size: 18,
            color: primaryHex,
            font: 'Arial',
          }),
        ],
      })
    );

    data.certifications.forEach((cert) => {
      sidebarElements.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `• ${cert.name}`, bold: true, size: 15, font: 'Arial' }),
            cert.year ? new TextRun({ text: ` (${cert.year})`, size: 14, color: accentHex, font: 'Arial' }) : new TextRun(''),
          ],
        })
      );
      if (cert.detail) {
        sidebarElements.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: cert.detail, size: 13, color: '666666', font: 'Arial', italics: true }),
            ],
          })
        );
      }
    });
  }

  // 2. Main Right Column Content Cells
  const mainElements: Paragraph[] = [
    // Header Name
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: data.personal_info.name,
          bold: true,
          size: 38,
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    }),

    // Header Title
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: data.personal_info.title,
          bold: true,
          size: 22,
          color: accentHex,
          font: 'Arial',
        }),
      ],
    }),

    // SECTION: RINGKASAN PROFESIONAL
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({
          text: 'RINGKASAN PROFESIONAL',
          bold: true,
          size: 20,
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: data.personal_info.summary,
          size: 17,
          font: 'Arial',
        }),
      ],
    }),

    // SECTION: PENGALAMAN KERJA
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({
          text: 'PENGALAMAN KERJA',
          bold: true,
          size: 20,
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    }),
  ];

  // Populate Work Experience
  data.work_experience.forEach((exp) => {
    mainElements.push(
      new Paragraph({
        spacing: { before: 100, after: 40 },
        children: [
          new TextRun({ text: exp.position, bold: true, size: 18, color: primaryHex, font: 'Arial' }),
          new TextRun({ text: ` | ${exp.company}`, bold: true, size: 17, color: '555555', font: 'Arial' }),
          new TextRun({ text: `  [${exp.period}]`, bold: true, size: 15, color: accentHex, font: 'Arial' }),
        ],
      })
    );

    exp.highlights.forEach((hl) => {
      mainElements.push(
        new Paragraph({
          spacing: { after: 40 },
          bullet: { level: 0 },
          children: [
            new TextRun({ text: hl, size: 16, font: 'Arial' }),
          ],
        })
      );
    });
  });

  // SECTION: PORTOFOLIO DIGITAL
  if (data.digital_portfolio && data.digital_portfolio.length > 0) {
    mainElements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: 'PORTOFOLIO DIGITAL & PROYEK',
            bold: true,
            size: 20,
            color: primaryHex,
            font: 'Arial',
          }),
        ],
      })
    );

    data.digital_portfolio.forEach((port) => {
      mainElements.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: port.project_name, bold: true, size: 17, color: primaryHex, font: 'Arial' }),
            port.link ? new TextRun({ text: ` (${port.link})`, size: 14, color: accentHex, font: 'Arial' }) : new TextRun(''),
          ],
        })
      );
      mainElements.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: port.description, size: 15, font: 'Arial', color: '444444' }),
          ],
        })
      );
      if (port.tech_used && port.tech_used.length > 0) {
        mainElements.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: 'Tech: ', bold: true, size: 14, color: accentHex, font: 'Arial' }),
              new TextRun({ text: port.tech_used.join(', '), size: 14, color: '666666', font: 'Arial' }),
            ],
          })
        );
      }
    });
  }

  // SECTION: PENDIDIKAN FORMAL
  mainElements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: 'PENDIDIKAN FORMAL',
          bold: true,
          size: 20,
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    })
  );

  data.education.forEach((edu) => {
    mainElements.push(
      new Paragraph({
        spacing: { before: 60, after: 40 },
        children: [
          new TextRun({ text: edu.degree, bold: true, size: 17, color: primaryHex, font: 'Arial' }),
          new TextRun({ text: ` - ${edu.institution}`, bold: true, size: 16, color: '555555', font: 'Arial' }),
          new TextRun({ text: ` (${edu.year})`, bold: true, size: 15, color: accentHex, font: 'Arial' }),
        ],
      })
    );
    if (edu.details) {
      mainElements.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: edu.details, size: 15, font: 'Arial', color: '666666', italics: true }),
          ],
        })
      );
    }
  });

  // SECTION: REFERENSI PROFESIONAL
  if (data.references && data.references.length > 0) {
    mainElements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: 'REFERENSI PROFESIONAL',
            bold: true,
            size: 20,
            color: primaryHex,
            font: 'Arial',
          }),
        ],
      })
    );

    data.references.forEach((ref) => {
      mainElements.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({ text: ref.name, bold: true, size: 16, color: primaryHex, font: 'Arial' }),
            new TextRun({ text: ` | ${ref.title}`, size: 15, color: '555555', font: 'Arial' }),
            new TextRun({ text: ` (${ref.contact_info})`, size: 14, color: accentHex, font: 'Arial' }),
          ],
        })
      );
    });
  }

  // 3. Assemble 2-Column Table (No Outer Borders)
  const noBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: 'FFFFFF',
  };

  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          // Kolom Kiri: ~32%
          new TableCell({
            width: {
              size: 32,
              type: WidthType.PERCENTAGE,
            },
            shading: {
              fill: bgSidebarHex,
            },
            margins: {
              top: convertMillimetersToTwip(6),
              bottom: convertMillimetersToTwip(6),
              left: convertMillimetersToTwip(6),
              right: convertMillimetersToTwip(6),
            },
            children: sidebarElements,
          }),
          // Kolom Kanan: ~68%
          new TableCell({
            width: {
              size: 68,
              type: WidthType.PERCENTAGE,
            },
            margins: {
              top: convertMillimetersToTwip(6),
              bottom: convertMillimetersToTwip(6),
              left: convertMillimetersToTwip(8),
              right: convertMillimetersToTwip(6),
            },
            children: mainElements,
          }),
        ],
      }),
    ],
  });

  // 4. Construct Office Open XML Document (A4 Margins)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(10),
              right: convertMillimetersToTwip(10),
              bottom: convertMillimetersToTwip(10),
              left: convertMillimetersToTwip(10),
            },
          },
        },
        children: [table],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
