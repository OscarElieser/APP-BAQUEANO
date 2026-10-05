"use client";

/**
 * POR QUE
 * La website debe servir como puerta publica de Baqueano y, al mismo tiempo,
 * conectar funciones privadas con la app Android solo cuando exista identidad
 * verificada. Mensajes, notificaciones e historial contienen datos personales
 * de viaje, por eso no deben abrirse como secciones anonimas.
 *
 * COMO
 * El componente renderiza una barra glass responsive con submenus institucionales,
 * accesos privados Android por deep link y un panel de cuenta Firebase. Si el
 * explorador no tiene sesion, puede iniciar con email o crear cuenta solicitando
 * nombre, correo, telefono, nacionalidad, clave y aceptacion legal; al registrarse
 * se crea Auth y se persiste el perfil en Cloud Firestore `users/{uid}`.
 *
 * QUE
 * Navegacion publica, menu "Acerca de Nosotros", menu "App Android", modal de
 * autenticacion/registro y puente `baqueano://app/...` hacia la app instalada.
 *
 * I18N (2026-10-05): todo texto visible, aria-label y mensaje pasa por
 * `useBaqueanoI18n().t(clave)` con los catálogos de `website/locales` (6
 * idiomas). Los mensajes de estado guardan la CLAVE (no el texto) para que se
 * muestren en el idioma vigente; los errores de Firebase se traducen por código.
 */
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, type MouseEvent, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  Bell,
  Car,
  ChevronDown,
  Clock3,
  Compass,
  FileText,
  HelpCircle,
  Landmark,
  LockKeyhole,
  Mail,
  Map,
  Menu,
  MessageCircle,
  Music,
  Palette,
  Phone,
  Shield,
  Smartphone,
  Sparkles,
  UserRound,
  UtensilsCrossed,
  X
} from "lucide-react";
import { publicRoutes } from "@baqueano/config";
import { getBaqueanoAuth, getBaqueanoDb } from "@baqueano/firebase";
import { LanguageSelector, useBaqueanoI18n } from "@baqueano/i18n";

const miPaisRoutes = [
  { href: "/historia", labelKey: "nav.historyHeritage", icon: Landmark },
  { href: "/gastronomia", labelKey: "nav.gastronomy", icon: UtensilsCrossed },
  { href: "/cultura", labelKey: "nav.musicCulture", icon: Music },
  { href: "/territorios", labelKey: "nav.territories", icon: Map },
  { href: "/alquiler-vehiculos", labelKey: "nav.vehicleRental", icon: Car }
] as const;

const aboutRoutes = [
  { href: "/marca", labelKey: "nav.brandManifesto", icon: Palette },
  { href: "/ayuda", labelKey: "nav.helpCenter", icon: HelpCircle },
  { href: "/terminos", labelKey: "nav.terms", icon: FileText },
  { href: "/privacidad", labelKey: "nav.privacy", icon: Shield }
] as const;

const androidPrivateRoutes = [
  { appPath: "mensajes", labelKey: "nav.hostMessages", icon: MessageCircle },
  { appPath: "notificaciones", labelKey: "nav.notificationsCenter", icon: Bell },
  { appPath: "historial", labelKey: "nav.expeditionHistory", icon: Clock3 }
] as const;

/** Traduce códigos de error de Firebase Auth a claves amables (nunca texto técnico). */
function authErrorKey(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-email"].includes(code)) return "auth.errors.invalidCredentials";
  if (code === "auth/email-already-in-use") return "auth.errors.emailInUse";
  if (code === "auth/weak-password") return "auth.errors.passwordLength";
  if (code === "auth/too-many-requests") return "auth.errors.tooManyRequests";
  if (code === "auth/network-request-failed") return "errors.network";
  return "auth.errors.generic";
}

type AccountMode = "signin" | "signup";

interface AccountFormState {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  password: string;
  acceptTerms: boolean;
}

const emptyForm: AccountFormState = {
  fullName: "",
  email: "",
  phone: "",
  nationality: "Nicaragua",
  password: "",
  acceptTerms: false
};

export function PublicNavigation() {
  const { t } = useBaqueanoI18n();
  const [open, setOpen] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<AccountMode>("signin");
  const [pendingAndroidPath, setPendingAndroidPath] = useState<string | null>(null);
  const [form, setForm] = useState<AccountFormState>(emptyForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      return onAuthStateChanged(getBaqueanoAuth(), (user) => setAuthUser(user));
    } catch {
      setAuthUser(null);
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(""), 4500);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const updateField = <K extends keyof AccountFormState>(field: K, value: AccountFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openAccountPanel = (mode: AccountMode, appPath?: string) => {
    setOpen(false);
    setAccountMode(mode);
    setPendingAndroidPath(appPath ?? null);
    setAccountPanelOpen(true);
    setStatusMessage("");
  };

  const openAndroidDeepLink = (appPath: string) => {
    const fallbackUrl = `/pasaporte?androidFeature=${encodeURIComponent(appPath)}&install=required`;
    const deepLink = `baqueano://app/${appPath}`;
    const startedAt = Date.now();

    const fallbackTimer = window.setTimeout(() => {
      if (document.visibilityState === "visible" && Date.now() - startedAt < 1800) {
        window.location.href = fallbackUrl;
      }
    }, 900);

    window.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") {
          window.clearTimeout(fallbackTimer);
        }
      },
      { once: true }
    );

    window.location.href = deepLink;
  };

  const handleAndroidAccess = (event: MouseEvent<HTMLAnchorElement>, appPath: string) => {
    event.preventDefault();
    setOpen(false);

    if (!authUser) {
      openAccountPanel("signin", appPath);
      return;
    }

    openAndroidDeepLink(appPath);
  };

  const validateForm = () => {
    if (!form.email.trim() || !form.password.trim()) {
      return "auth.errors.requiredCredentials";
    }

    if (accountMode === "signup") {
      if (!form.fullName.trim() || !form.phone.trim() || !form.nationality.trim()) {
        return "auth.errors.signupFields";
      }

      if (form.password.length < 8) {
        return "auth.errors.passwordLength";
      }

      if (!form.acceptTerms) {
        return "auth.errors.acceptTerms";
      }
    }

    return "";
  };

  const handleAccountSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatusMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const auth = getBaqueanoAuth();
      let user: User;

      if (accountMode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        user = credential.user;
        await updateProfile(user, { displayName: form.fullName.trim() });

        const now = new Date().toISOString();
        await setDoc(
          doc(getBaqueanoDb(), "users", user.uid),
          {
            uid: user.uid,
            email: form.email.trim(),
            displayName: form.fullName.trim(),
            phone: form.phone.trim(),
            nationality: form.nationality.trim(),
            role: "explorer",
            accountSource: "website",
            androidAppRequired: true,
            acceptedTermsAt: now,
            createdAt: now,
            updatedAt: now
          },
          { merge: true }
        );
      } else {
        const credential = await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
        user = credential.user;
      }

      setAuthUser(user);
      setAccountPanelOpen(false);
      setForm(emptyForm);
      setStatusMessage(pendingAndroidPath ? "auth.sessionActiveOpeningApp" : "auth.signedIn");

      if (pendingAndroidPath) {
        openAndroidDeepLink(pendingAndroidPath);
      }
    } catch (error) {
      setStatusMessage(authErrorKey(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(getBaqueanoAuth());
      setAuthUser(null);
      setStatusMessage("auth.logoutSuccess");
    } catch {
      setStatusMessage("auth.errors.logout");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#061018]/82 shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label={t("nav.aria")}>
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label={t("nav.brandAria")}>
          <span className="relative flex h-11 w-11 items-center justify-center rounded-md border border-[#F4E6C1]/20 bg-white/10 shadow-[0_0_28px_rgba(246,94,1,0.18)]">
            <Image src="/assets/images/brand/baqueano_icono_oficial.png" alt="" width={34} height={34} className="rounded-md" priority />
          </span>
          <span className="min-w-0">
            <strong className="block font-tech text-sm uppercase tracking-normal text-white" translate="no">Baqueano</strong>
            <span className="block text-xs uppercase tracking-normal text-[#F4E6C1]/76" translate="no">Nicaragua</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Link href="/" className="rounded-md px-3 py-2 text-sm font-semibold text-white/76 transition hover:bg-white/10 hover:text-white focus-ring">
            {t("nav.home")}
          </Link>
          <Link href="/destinos" className="rounded-md px-3 py-2 text-sm font-semibold text-white/76 transition hover:bg-white/10 hover:text-white focus-ring">
            {t("nav.destinations")}
          </Link>

          <NavDropdown label={t("nav.myCountry")}>
            {miPaisRoutes.map(({ href, labelKey, icon: Icon }) => (
              <Link key={href} href={href} className="focus-ring flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-white/78 hover:bg-white/10 hover:text-white">
                <Icon size={17} className="text-[#F65E01]" /> {t(labelKey)}
              </Link>
            ))}
          </NavDropdown>

          <Link href="/baqueano-ai" className="rounded-md px-3 py-2 text-sm font-bold text-[#F4E6C1] transition hover:bg-white/10 hover:text-white focus-ring flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#F65E01]" /> {t("nav.baqueanoAi")}
          </Link>
          <Link href="/aliados.html" className="rounded-md px-3 py-2 text-sm font-semibold text-white/76 transition hover:bg-white/10 hover:text-white focus-ring">
            {t("nav.alliesShort")}
          </Link>
          <Link href="/mi-viaje" className="rounded-md px-3 py-2 text-sm font-semibold text-white/76 transition hover:bg-white/10 hover:text-white focus-ring">
            {t("nav.trip")}
          </Link>

          <NavDropdown label={t("nav.aboutUs")}>
            {aboutRoutes.map(({ href, labelKey, icon: Icon }) => (
              <Link key={href} href={href} className="focus-ring flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-white/78 hover:bg-white/10 hover:text-white">
                <Icon size={17} className="text-[#F4E6C1]" /> {t(labelKey)}
              </Link>
            ))}
          </NavDropdown>

          <NavDropdown label={t("nav.androidApp")}>
            {androidPrivateRoutes.map(({ appPath, labelKey, icon: Icon }) => (
              <Link key={appPath} href={`baqueano://app/${appPath}`} onClick={(event) => handleAndroidAccess(event, appPath)} className="focus-ring flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-white/78 hover:bg-white/10 hover:text-white">
                <Icon size={17} className="text-[#F65E01]" /> {t(labelKey)}
              </Link>
            ))}
            <div className="mt-1 rounded-md border border-[#F65E01]/30 bg-[#F65E01]/10 px-3 py-2 text-xs leading-5 text-[#F4E6C1]/86">
              {t("nav.androidAvailability")}
            </div>
          </NavDropdown>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSelector />
          {authUser ? (
            <button type="button" onClick={handleSignOut} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-white/12 bg-white/10 px-3 py-2 text-xs font-bold text-white/82 hover:bg-white/15">
              <UserRound size={15} /> {authUser.displayName || t("auth.myAccount")}
            </button>
          ) : (
            <button type="button" onClick={() => openAccountPanel("signin")} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-[#F4E6C1]/20 bg-white/10 px-3 py-2 text-xs font-bold text-white/86 hover:bg-white/15">
              <LockKeyhole size={15} /> {t("auth.signin")}
            </button>
          )}
          <Link href="/mapa" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#F65E01] px-4 py-3 font-tech text-sm font-bold uppercase text-white shadow-[0_16px_50px_rgba(246,94,1,0.28)]">
            <Compass size={16} /> {t("nav.explore")}
          </Link>
        </div>

        <button
          type="button"
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/14 bg-white/10 text-white lg:hidden"
          aria-label={open ? t("nav.menuClose") : t("nav.menuOpen")}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open ? (
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto border-t border-white/10 bg-[#0F172A]/96 px-4 py-4 shadow-2xl lg:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
            <Link href="/" onClick={() => setOpen(false)} className="focus-ring rounded-md border border-white/10 bg-white/[0.06] px-4 py-4 text-sm font-bold text-white">
              {t("nav.home")}
            </Link>
            <Link href="/destinos" onClick={() => setOpen(false)} className="focus-ring rounded-md border border-white/10 bg-white/[0.06] px-4 py-4 text-sm font-bold text-white">
              {t("nav.destinations")}
            </Link>
            <Link href="/baqueano-ai" onClick={() => setOpen(false)} className="focus-ring rounded-md border border-cyan-500/30 bg-cyan-950/40 px-4 py-4 text-sm font-bold text-cyan-300">
              {t("nav.baqueanoAi")}
            </Link>
            <Link href="/mi-viaje" onClick={() => setOpen(false)} className="focus-ring rounded-md border border-white/10 bg-white/[0.06] px-4 py-4 text-sm font-bold text-white">
              {t("nav.trip")}
            </Link>
            <Link href="/aliados.html" onClick={() => setOpen(false)} className="focus-ring rounded-md border border-white/10 bg-white/[0.06] px-4 py-4 text-sm font-bold text-white">
              {t("nav.alliesShort")}
            </Link>
            <Link href="/mapa" onClick={() => setOpen(false)} className="focus-ring rounded-md border border-[#F65E01]/40 bg-[#F65E01]/20 px-4 py-4 text-sm font-bold text-white">
              {t("nav.map")}
            </Link>
          </div>
          <div className="mx-auto mt-4 flex max-w-7xl justify-end">
            <LanguageSelector />
          </div>
          <MobileSection title={t("nav.myCountry")}>
            {miPaisRoutes.map(({ href, labelKey, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="focus-ring flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white">
                <Icon size={17} className="text-[#F65E01]" /> {t(labelKey)}
              </Link>
            ))}
          </MobileSection>
          <MobileSection title={t("nav.aboutUs")}>
            {aboutRoutes.map(({ href, labelKey, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="focus-ring flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white">
                <Icon size={17} className="text-[#F4E6C1]" /> {t(labelKey)}
              </Link>
            ))}
          </MobileSection>
          <MobileSection title={t("nav.androidPrivate")}>
            {androidPrivateRoutes.map(({ appPath, labelKey, icon: Icon }) => (
              <Link key={appPath} href={`baqueano://app/${appPath}`} onClick={(event) => handleAndroidAccess(event, appPath)} className="focus-ring flex items-center gap-3 rounded-md border border-[#F65E01]/30 bg-[#F65E01]/10 px-4 py-3 text-sm font-bold text-white">
                <Icon size={17} className="text-[#F65E01]" /> {t(labelKey)}
              </Link>
            ))}
          </MobileSection>
          <button type="button" onClick={() => openAccountPanel(authUser ? "signin" : "signup")} className="focus-ring mx-auto mt-4 flex w-full max-w-7xl items-center justify-center gap-2 rounded-md bg-[#F65E01] px-4 py-3 font-tech text-sm font-bold uppercase text-white">
            <Smartphone size={17} /> {authUser ? t("auth.accountActive") : t("auth.signup")}
          </button>
        </div>
      ) : null}

      {statusMessage ? (
        <div className="fixed right-4 top-24 z-50 max-w-sm rounded-md border border-[#F65E01]/40 bg-[#07131f] p-4 text-sm text-white shadow-2xl">
          <div className="flex items-start gap-3">
            <Smartphone size={18} className="mt-0.5 shrink-0 text-[#F65E01]" />
            <p role="status">{t(statusMessage)}</p>
          </div>
        </div>
      ) : null}

      {accountPanelOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="baqueano-account-title">
          <div className="w-full max-w-lg overflow-hidden rounded-md border border-[#F4E6C1]/18 bg-[#07131f] shadow-[0_30px_120px_rgba(0,0,0,0.58)]">
            <div className="border-b border-white/10 bg-[#165D6F]/24 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-tech text-xs font-bold uppercase tracking-normal text-[#F65E01]">{t("auth.androidAccess.eyebrow")}</p>
                  <h2 id="baqueano-account-title" className="mt-1 text-2xl font-black text-white">{t("auth.androidAccess.title")}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/66">
                    {t("auth.androidAccess.description")}
                  </p>
                </div>
                <button type="button" aria-label={t("actions.close")} onClick={() => setAccountPanelOpen(false)} className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-white/10">
              <button type="button" onClick={() => setAccountMode("signin")} className={`px-4 py-3 text-sm font-bold ${accountMode === "signin" ? "bg-[#F65E01] text-white" : "bg-white/[0.03] text-white/62"}`}>
                {t("auth.haveAccount")}
              </button>
              <button type="button" onClick={() => setAccountMode("signup")} className={`px-4 py-3 text-sm font-bold ${accountMode === "signup" ? "bg-[#F65E01] text-white" : "bg-white/[0.03] text-white/62"}`}>
                {t("auth.signup")}
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="grid gap-4 p-5">
              {accountMode === "signup" ? (
                <>
                  <AccountInput icon={<UserRound size={16} />} label={t("forms.fullName")} value={form.fullName} onChange={(value) => updateField("fullName", value)} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AccountInput icon={<Phone size={16} />} label={t("forms.phoneWhatsapp")} value={form.phone} onChange={(value) => updateField("phone", value)} />
                    <AccountInput icon={<Compass size={16} />} label={t("forms.nationality")} value={form.nationality} onChange={(value) => updateField("nationality", value)} />
                  </div>
                </>
              ) : null}

              <AccountInput icon={<Mail size={16} />} label={t("forms.email")} type="email" value={form.email} onChange={(value) => updateField("email", value)} />
              <AccountInput icon={<LockKeyhole size={16} />} label={accountMode === "signup" ? t("forms.passwordSecure") : t("forms.password")} type="password" value={form.password} onChange={(value) => updateField("password", value)} />

              {accountMode === "signup" ? (
                <label className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-white/72">
                  <input type="checkbox" checked={form.acceptTerms} onChange={(event) => updateField("acceptTerms", event.target.checked)} className="mt-1 h-4 w-4 accent-[#F65E01]" />
                  <span>
                    {t("auth.acceptTermsPrefix")} <Link href="/terminos" className="font-bold text-[#F4E6C1]">{t("auth.termsLink")}</Link> {t("auth.acceptTermsMiddle")} <Link href="/privacidad" className="font-bold text-[#F4E6C1]">{t("auth.privacyLink")}</Link>.
                  </span>
                </label>
              ) : null}

              <button type="submit" disabled={isSubmitting} className="focus-ring mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#F65E01] px-4 py-3 font-tech text-sm font-bold uppercase text-white shadow-[0_18px_60px_rgba(246,94,1,0.26)] disabled:cursor-not-allowed disabled:opacity-60">
                <Smartphone size={17} /> {isSubmitting ? t("status.processing") : accountMode === "signup" ? t("auth.signupAndOpen") : t("auth.signinAndOpen")}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative">
      <button type="button" className="focus-ring inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-white/76 transition hover:bg-white/10 hover:text-white">
        {label} <ChevronDown size={15} />
      </button>
      <div className="invisible absolute right-0 top-full w-80 translate-y-2 rounded-md border border-white/10 bg-[#07131f] p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {children}
      </div>
    </div>
  );
}

function MobileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-4 max-w-7xl border-t border-white/10 pt-4">
      <p className="font-tech text-xs font-bold uppercase tracking-normal text-[#F4E6C1]/70">{title}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function AccountInput({
  icon,
  label,
  value,
  onChange,
  type = "text"
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-normal text-[#F4E6C1]/70">{label}</span>
      <span className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 py-3 text-white focus-within:border-[#F65E01]/70">
        <span className="text-[#F65E01]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          autoComplete={type === "password" ? "current-password" : "on"}
          required
        />
      </span>
    </label>
  );
}
