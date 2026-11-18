import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Contact,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ContactInfo } from '../types';
import { normalizeWebsiteUrl } from '../validator';

interface ContactEditorCardProps {
  contact: ContactInfo;
  onChangeContact: (updatedContact: ContactInfo) => void;
  syncRevision?: number;
}

export const ContactEditorCard: React.FC<ContactEditorCardProps> = ({
  contact,
  onChangeContact,
  syncRevision = 0
}) => {
  const [websiteDraft, setWebsiteDraft] = useState<string>(contact.website || '');
  const [websiteError, setWebsiteError] = useState<string | null>(null);
  const lastPushedWebsiteRef = useRef<string>(contact.website || '');
  const lastSyncRevisionRef = useRef<number>(syncRevision);

  // Sinkronkan draft website hanya saat nilai berubah dari luar (hasil parse baru, edit JSON, atau reset)
  useEffect(() => {
    const incoming = contact.website || '';
    const revisionChanged = syncRevision !== lastSyncRevisionRef.current;

    if (revisionChanged || incoming !== lastPushedWebsiteRef.current) {
      lastSyncRevisionRef.current = syncRevision;
      lastPushedWebsiteRef.current = incoming;
      setWebsiteDraft(incoming);

      const check = normalizeWebsiteUrl(incoming);
      if (incoming.trim() && !check.isValid) {
        setWebsiteError(check.error || 'Format URL tidak valid.');
      } else {
        setWebsiteError(null);
      }
    }
  }, [contact.website, syncRevision]);

  const handleFieldChange = (field: keyof Omit<ContactInfo, 'website'>, value: string) => {
    onChangeContact({
      ...contact,
      [field]: value
    });
  };

  const handleWebsiteChange = (rawVal: string) => {
    setWebsiteDraft(rawVal);
    const result = normalizeWebsiteUrl(rawVal);

    if (!result.isValid) {
      setWebsiteError(result.error || 'Format URL tidak valid.');
      // Jangan simpan skema tidak aman/tidak valid ke state CV, tanpa memblokir field lainnya
      if ((contact.website || '') !== '') {
        lastPushedWebsiteRef.current = '';
        onChangeContact({
          ...contact,
          website: ''
        });
      }
      return;
    }

    setWebsiteError(null);
    lastPushedWebsiteRef.current = result.normalizedUrl;
    onChangeContact({
      ...contact,
      website: result.normalizedUrl
    });
  };

  const handleWebsiteBlur = () => {
    const result = normalizeWebsiteUrl(websiteDraft);
    if (result.isValid && result.normalizedUrl !== websiteDraft) {
      setWebsiteDraft(result.normalizedUrl);
    }
  };

  return (
    <div
      id="contact-editor-card"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-200 no-print shadow-md"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Contact className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Edit Kontak &amp; Tautan
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ubah informasi kontak atau tautan profil secara langsung — pratinjau A4, PDF, dan DOCX otomatis diperbarui.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. Telepon */}
        <div className="space-y-1">
          <label htmlFor="contact-input-phone" className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Telepon</span>
          </label>
          <input
            id="contact-input-phone"
            type="text"
            value={contact.phone || ''}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="+62 811-0000-1234"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* 2. Email */}
        <div className="space-y-1">
          <label htmlFor="contact-input-email" className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Email</span>
          </label>
          <input
            id="contact-input-email"
            type="email"
            value={contact.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="nama@email.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* 3. Alamat */}
        <div className="space-y-1">
          <label htmlFor="contact-input-address" className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Alamat</span>
          </label>
          <input
            id="contact-input-address"
            type="text"
            value={contact.address || ''}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            placeholder="Jakarta, Indonesia"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* 4. LinkedIn */}
        <div className="space-y-1">
          <label htmlFor="contact-input-linkedin" className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
            <span>LinkedIn</span>
          </label>
          <input
            id="contact-input-linkedin"
            type="text"
            value={contact.linkedin || ''}
            onChange={(e) => handleFieldChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>

        {/* 5. GitHub */}
        <div className="space-y-1">
          <label htmlFor="contact-input-github" className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5 text-cyan-400" />
            <span>GitHub</span>
          </label>
          <input
            id="contact-input-github"
            type="text"
            value={contact.github || ''}
            onChange={(e) => handleFieldChange('github', e.target.value)}
            placeholder="https://github.com/username"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>

        {/* 6. Website / Portofolio */}
        <div className="space-y-1">
          <label htmlFor="contact-input-website" className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Website / Portofolio</span>
            <span className="text-[10px] text-slate-500 font-normal">(Opsional)</span>
          </label>
          <input
            id="contact-input-website"
            type="text"
            value={websiteDraft}
            onChange={(e) => handleWebsiteChange(e.target.value)}
            onBlur={handleWebsiteBlur}
            placeholder="https://namaanda.com"
            className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono ${
              websiteError
                ? 'border-rose-500/80 focus:border-rose-400'
                : 'border-slate-800 focus:border-cyan-500'
            }`}
          />
          {websiteError && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 leading-tight">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{websiteError}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
