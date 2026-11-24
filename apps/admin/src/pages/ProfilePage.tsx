import React, { useState, useEffect } from 'react';
import type { SiteSettings, ProfileSettings, SupportedLocale } from '../shared/types.ts';
import { fetchSiteSettings, saveSiteSettings } from '../firebase/firestore.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotify } from '../context/NotificationContext.tsx';
import { useAdminLang } from '../context/LanguageContext.tsx';
import {
  User,
  FileText,
  Mail,
  Globe,
  Save,
  ExternalLink,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  MapPin,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotify();
  const { t } = useAdminLang();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [activeLang, setActiveLang] = useState<SupportedLocale>('fr');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await fetchSiteSettings();
        setSettings(s);
        setProfile(s.profile || {
          name: 'Yosr Meddah',
          title: {
            fr: 'Ingénieure informatique en formation — Accessibilité · Éco-conception',
            en: 'Software Engineering Student — Accessibility · Eco-design',
            ar: 'مهندسة برمجيات في طور التكوين — إمكانية الوصول والتصميم الصديق للبيئة',
          },
          bio: {
            fr: "Ingénieure informatique en 2ᵉ année à l'ISAMM, passionnée par le développement frontend, l'accessibilité numérique (WCAG) et l'éco-conception web.",
            en: '2nd-year software engineering student at ISAMM, passionate about frontend development, digital accessibility (WCAG) and eco-design.',
            ar: 'طالبة هندسة برمجيات في السنة الثانية بـ ISAMM، شغوفة بالتطوير الواجهة الأمامية وإمكانية الوصول الرقمي والتصميم البيئي.',
          },
          cvUrl: {
            fr: 'cv.pdf',
            en: 'cv.pdf',
            ar: 'cv.pdf',
          },
          email: 'yosrmeddah@outlook.com',
          phone: '+216 50 231 459',
          location: 'Tunis / Bizerte, Tunisie',
          socials: {
            github: 'https://github.com/Yosr-MEDDAH',
            linkedin: 'https://www.linkedin.com/in/yosr-meddah/',
            behance: 'https://www.behance.net/yosr-meddah',
            youtube: 'https://www.youtube.com/@YosrMeddah',
          },
          contactLabels: {
            heading: {
              fr: 'Restons en contact',
              en: 'Get in Touch',
              ar: 'تواصل معي',
            },
            subheading: {
              fr: "Disponible pour stages, collaborations et projets autour de l'accessibilité et de l'éco-conception.",
              en: 'Available for internships, collaborations and projects around accessibility and eco-design.',
              ar: 'متاحة للتدريب والتعاون والمشاريع في مجالات إمكانية الوصول والتصميم المستدام.',
            },
          },
        });
      } catch (err) {
        notify('error', 'Failed to load profile settings: ' + (err instanceof Error ? err.message : ''));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !profile || !user) return;

    setSaving(true);
    try {
      const updatedSettings: SiteSettings = {
        ...settings,
        profile,
      };
      await saveSiteSettings(updatedSettings, user.uid, user.email || 'admin@cms.dev');
      setSettings(updatedSettings);
      notify('success', 'Profile and homepage settings saved successfully to Firestore!');
    } catch (err) {
      notify('error', 'Failed to save profile: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, lang: SupportedLocale) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 3MB recommended for Firestore text payload)
    if (file.size > 3 * 1024 * 1024) {
      notify('error', 'File size exceeds 3MB. Please host larger files externally or put in public/ folder.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (profile) {
        setProfile({
          ...profile,
          cvUrl: {
            ...profile.cvUrl,
            [lang]: result,
          },
        });
        notify('success', `CV for [${lang.toUpperCase()}] loaded from file!`);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-content-muted">
        Loading profile settings...
      </div>
    );
  }

  const currentCvUrl = profile.cvUrl?.[activeLang] || profile.cvUrl?.fr || 'cv.pdf';

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-content flex items-center gap-2">
            <User className="w-6 h-6 text-mg" />
            {t('nav.profile')}
          </h2>
          <p className="text-xs text-content-muted mt-1">
            Gérez votre identité, vos présentations multilingues, vos liens de CV et vos coordonnées de contact sans modifier le code.
          </p>
        </div>

        {/* Global Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-mg text-cream text-xs font-medium rounded hover:bg-mg-dark disabled:opacity-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer le Profil & l\'Accueil'}
        </button>
      </div>

      {/* Language Switcher for Multilingual Fields */}
      <div className="bg-surface border border-border rounded p-3 flex items-center justify-between">
        <span className="text-xs font-medium text-content-secondary flex items-center gap-2">
          <Globe className="w-4 h-4 text-mg" />
          Langue d'édition des champs multilingues :
        </span>
        <div className="flex items-center gap-1">
          {(['fr', 'en', 'ar'] as SupportedLocale[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                activeLang === lang
                  ? 'bg-mg text-cream'
                  : 'bg-cream text-content hover:bg-cream-dark'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Identity & Presentation */}
      <div className="bg-surface border border-border rounded p-5 space-y-4 shadow-2xs">
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <h3 className="font-serif text-lg font-normal text-content flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-mg" />
            Identité & Présentation Personnelle
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cream border border-border text-content-muted">
            Édition active : {activeLang.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-medium text-content-secondary">
              Nom complet (affiché dans le Hero et le Footer)
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden"
              required
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-medium text-content-secondary flex items-center justify-between">
              <span>Titre professionnel & Spécialité ({activeLang.toUpperCase()})</span>
              <span className="text-[10px] text-content-muted">Sous le nom dans le Hero</span>
            </label>
            <input
              type="text"
              value={profile.title?.[activeLang] || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  title: {
                    ...profile.title,
                    [activeLang]: e.target.value,
                  },
                })
              }
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden"
              placeholder={`Titre en ${activeLang.toUpperCase()}`}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-medium text-content-secondary flex items-center justify-between">
              <span>Paragraphe de présentation / Bio ({activeLang.toUpperCase()})</span>
              <span className="text-[10px] text-content-muted">Texte d'introduction de la page d'accueil</span>
            </label>
            <textarea
              rows={4}
              value={profile.bio?.[activeLang] || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  bio: {
                    ...profile.bio,
                    [activeLang]: e.target.value,
                  },
                })
              }
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden resize-y"
              placeholder={`Présentation en ${activeLang.toUpperCase()}`}
            />
          </div>
        </div>
      </div>

      {/* 2. CV Management */}
      <div className="bg-surface border border-border rounded p-5 space-y-4 shadow-2xs">
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <h3 className="font-serif text-lg font-normal text-content flex items-center gap-2">
            <FileText className="w-4 h-4 text-mg" />
            Gestion du Curriculum Vitae (CV)
          </h3>
          <span className="text-xs font-mono text-mg">100% Spark / Gratuit</span>
        </div>

        <p className="text-xs text-content-muted">
          Vous pouvez utiliser le fichier standard déposé dans le portfolio (ex: <code className="font-mono text-content">cv.pdf</code>), un lien externe sécurisé (Google Drive, Dropbox, GitHub), ou charger un fichier directement.
        </p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-xs font-medium text-content-secondary min-w-[140px]">
              Lien du CV ({activeLang.toUpperCase()}) :
            </label>
            <input
              type="text"
              value={profile.cvUrl?.[activeLang] || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  cvUrl: {
                    ...profile.cvUrl,
                    [activeLang]: e.target.value,
                  },
                })
              }
              className="flex-1 px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden font-mono"
              placeholder="cv.pdf ou https://..."
            />
            {currentCvUrl && (
              <a
                href={currentCvUrl.startsWith('data:') ? '#' : currentCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (currentCvUrl.startsWith('data:')) {
                    e.preventDefault();
                    const win = window.open();
                    win?.document.write(`<iframe src="${currentCvUrl}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-cream hover:bg-cream-dark text-content rounded border border-border transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Tester le lien
              </a>
            )}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted pt-1">
            <span>Raccourcis rapides :</span>
            <button
              type="button"
              onClick={() =>
                setProfile({
                  ...profile,
                  cvUrl: { ...profile.cvUrl, [activeLang]: 'cv.pdf' },
                })
              }
              className="px-2 py-0.5 rounded bg-cream border border-border hover:border-mg text-[11px]"
            >
              Fichier standard: cv.pdf
            </button>
            <button
              type="button"
              onClick={() =>
                setProfile({
                  ...profile,
                  cvUrl: {
                    fr: 'cv.pdf',
                    en: 'cv.pdf',
                    ar: 'cv.pdf',
                  },
                })
              }
              className="px-2 py-0.5 rounded bg-cream border border-border hover:border-mg text-[11px]"
            >
              Appliquer cv.pdf à toutes les langues
            </button>
            <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cream border border-border hover:border-mg text-[11px] cursor-pointer text-mg font-medium">
              <Upload className="w-3 h-3" />
              <span>Charger un fichier PDF local</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, activeLang)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Contact & Social Information */}
      <div className="bg-surface border border-border rounded p-5 space-y-4 shadow-2xs">
        <div className="border-b border-border pb-2">
          <h3 className="font-serif text-lg font-normal text-content flex items-center gap-2">
            <Mail className="w-4 h-4 text-mg" />
            Coordonnées & Réseaux Sociaux
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-content-secondary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-content-muted" />
              Adresse e-mail
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-content-secondary flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-content-muted" />
              Numéro de téléphone
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-content-secondary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-content-muted" />
              Localisation
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-content-secondary">
              Lien LinkedIn
            </label>
            <input
              type="url"
              value={profile.socials?.linkedin || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...profile.socials, linkedin: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-content-secondary">
              Lien GitHub
            </label>
            <input
              type="url"
              value={profile.socials?.github || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...profile.socials, github: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-content-secondary">
              Lien YouTube
            </label>
            <input
              type="url"
              value={profile.socials?.youtube || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...profile.socials, youtube: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-content-secondary">
              Lien Behance
            </label>
            <input
              type="url"
              value={profile.socials?.behance || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...profile.socials, behance: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden font-mono"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-medium text-content-secondary">
              Titre de la section Contact ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={profile.contactLabels?.heading?.[activeLang] || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  contactLabels: {
                    ...profile.contactLabels,
                    heading: {
                      ...profile.contactLabels?.heading,
                      [activeLang]: e.target.value,
                    },
                  },
                })
              }
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              className="w-full px-3 py-2 text-xs bg-cream/50 border border-border rounded focus:border-mg focus:outline-hidden"
              placeholder={`Titre contact en ${activeLang.toUpperCase()}`}
            />
          </div>
        </div>
      </div>

      {/* 4. Publication Status Card */}
      <div className="bg-cream/70 border border-border rounded p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-mg font-medium">
          <Clock className="w-4 h-4" />
          Synchronisation et Publication Automatique (0 €)
        </div>
        <p className="text-content-muted leading-relaxed">
          Lorsque vous enregistrez ces informations, elles sont stockées en toute sécurité dans Cloud Firestore (Firebase Spark). Le site public est reconstruit et déployé automatiquement toutes les 6 heures via GitHub Actions, ou instantanément à la demande via le déclenchement du workflow de publication.
        </p>
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-mg text-cream text-xs font-medium rounded hover:bg-mg-dark disabled:opacity-50 transition-colors shadow-2xs"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement en cours...' : 'Enregistrer le Profil & l\'Accueil'}
        </button>
      </div>
    </form>
  );
};
