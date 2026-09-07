export type ProficiencyLevel = 
  | 'Mahir' | 'Menengah' | 'Dasar'
  | 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner' | 'Basic';

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  github?: string;
  linkedin?: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  contact: ContactInfo;
  summary: string;
  profile_picture_placeholder?: string;
}

export interface CoreSkill {
  skill_name: string;
  proficiency_level: ProficiencyLevel;
}

export interface TechStackItem {
  category: string;
  tool: string;
  description: string;
  level: string;
}

export interface WorkExperience {
  position: string;
  company: string;
  period: string;
  highlights: string[];
}

export interface DigitalPortfolioItem {
  project_name: string;
  description: string;
  tech_used: string[];
  link?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  details?: string;
}

export interface LanguageItem {
  language: string;
  level: string;
}

export interface Certification {
  name: string;
  detail: string;
  year?: string;
}

export interface Reference {
  name: string;
  title: string;
  contact_info: string;
}

export interface CVData {
  language?: 'id' | 'en';
  personal_info: PersonalInfo;
  core_skills: CoreSkill[];
  tech_stack: TechStackItem[];
  work_experience: WorkExperience[];
  digital_portfolio: DigitalPortfolioItem[];
  education: Education[];
  languages: LanguageItem[];
  certifications: Certification[];
  references: Reference[];
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
