import { CVData, ValidationResult } from './types';

/**
 * Memvalidasi apakah objek JSON hasil ekstraksi LLM memenuhi skema standar CV
 * sebelum dikirim ke komponen rendering UI.
 * 
 * @param data - Objek JSON yang dievaluasi
 * @returns ValidationResult - Status validitas serta daftar error jika ada field yang kurang/tidak valid
 */
export function validateCVJson(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Data utama harus berupa objek JSON yang valid.'],
      warnings: []
    };
  }

  // 1. Validasi personal_info
  if (!data.personal_info || typeof data.personal_info !== 'object') {
    errors.push("Field wajib 'personal_info' tidak ditemukan atau bukan objek.");
  } else {
    const p = data.personal_info;
    if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
      errors.push("personal_info.name wajib diisi string tidak kosong.");
    }
    if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
      errors.push("personal_info.title wajib diisi string tidak kosong.");
    }
    if (!p.summary || typeof p.summary !== 'string' || !p.summary.trim()) {
      errors.push("personal_info.summary wajib diisi sebagai ringkasan profil.");
    }

    if (!p.contact || typeof p.contact !== 'object') {
      errors.push("personal_info.contact wajib berupa objek kontak.");
    } else {
      if (!p.contact.email || typeof p.contact.email !== 'string') {
        errors.push("personal_info.contact.email wajib ada.");
      }
      if (!p.contact.phone || typeof p.contact.phone !== 'string') {
        errors.push("personal_info.contact.phone wajib ada.");
      }
      if (!p.contact.address || typeof p.contact.address !== 'string') {
        warnings.push("personal_info.contact.address disarankan diisi.");
      }
    }
  }

  // Helper fungsi untuk array validator
  const validateArray = (
    key: string,
    isRequired: boolean,
    itemValidator: (item: any, index: number) => void
  ) => {
    if (!Array.isArray(data[key])) {
      if (isRequired) {
        errors.push(`Field '${key}' wajib berupa array (list).`);
      } else {
        warnings.push(`Field opsional '${key}' tidak berupa array.`);
      }
      return;
    }

    if (isRequired && data[key].length === 0) {
      warnings.push(`Array '${key}' saat ini kosong.`);
    }

    data[key].forEach((item: any, index: number) => {
      if (!item || typeof item !== 'object') {
        errors.push(`${key}[${index}] harus berupa objek.`);
      } else {
        itemValidator(item, index);
      }
    });
  };

  // 2. Validasi core_skills
  validateArray('core_skills', true, (item, idx) => {
    if (!item.skill_name || typeof item.skill_name !== 'string') {
      errors.push(`core_skills[${idx}].skill_name wajib diisi string.`);
    }
    const validLevels = ['Mahir', 'Menengah', 'Dasar'];
    if (!validLevels.includes(item.proficiency_level)) {
      errors.push(
        `core_skills[${idx}].proficiency_level bernilai '${item.proficiency_level}', harus salah satu dari: ${validLevels.join(', ')}.`
      );
    }
  });

  // 3. Validasi tech_stack
  validateArray('tech_stack', true, (item, idx) => {
    const toolIdentifier = item.tool || item.category;
    if (!toolIdentifier || typeof toolIdentifier !== 'string') {
      errors.push(`tech_stack[${idx}] wajib memiliki tool atau category.`);
    }
  });

  // 4. Validasi work_experience
  validateArray('work_experience', true, (item, idx) => {
    if (!item.position || typeof item.position !== 'string') {
      errors.push(`work_experience[${idx}].position wajib diisi.`);
    }
    if (!item.company || typeof item.company !== 'string') {
      errors.push(`work_experience[${idx}].company wajib diisi.`);
    }
    if (!item.period || typeof item.period !== 'string') {
      errors.push(`work_experience[${idx}].period wajib diisi.`);
    }
    if (!Array.isArray(item.highlights)) {
      errors.push(`work_experience[${idx}].highlights wajib berupa array of string.`);
    }
  });

  // 5. Validasi digital_portfolio
  validateArray('digital_portfolio', true, (item, idx) => {
    if (!item.project_name || typeof item.project_name !== 'string') {
      errors.push(`digital_portfolio[${idx}].project_name wajib diisi.`);
    }
    if (!item.description || typeof item.description !== 'string') {
      errors.push(`digital_portfolio[${idx}].description wajib diisi.`);
    }
    if (!Array.isArray(item.tech_used)) {
      errors.push(`digital_portfolio[${idx}].tech_used wajib berupa array string.`);
    }
  });

  // 6. Validasi education
  validateArray('education', true, (item, idx) => {
    if (!item.degree || typeof item.degree !== 'string') {
      errors.push(`education[${idx}].degree wajib diisi.`);
    }
    if (!item.institution || typeof item.institution !== 'string') {
      errors.push(`education[${idx}].institution wajib diisi.`);
    }
    if (!item.year || typeof item.year !== 'string') {
      errors.push(`education[${idx}].year wajib diisi.`);
    }
  });

  // 7. Validasi languages
  validateArray('languages', true, (item, idx) => {
    if (!item.language || typeof item.language !== 'string') {
      errors.push(`languages[${idx}].language wajib diisi.`);
    }
    if (!item.level || typeof item.level !== 'string') {
      errors.push(`languages[${idx}].level wajib diisi.`);
    }
  });

  // 8. Validasi certifications
  validateArray('certifications', false, (item, idx) => {
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`certifications[${idx}].name wajib diisi.`);
    }
  });

  // 9. Validasi references
  validateArray('references', false, (item, idx) => {
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`references[${idx}].name wajib diisi.`);
    }
    if (!item.title || typeof item.title !== 'string') {
      errors.push(`references[${idx}].title wajib diisi.`);
    }
    if (!item.contact_info || typeof item.contact_info !== 'string') {
      errors.push(`references[${idx}].contact_info wajib diisi.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
