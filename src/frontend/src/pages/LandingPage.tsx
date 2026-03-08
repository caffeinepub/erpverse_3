import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe2,
  Layers,
  Lock,
  RefreshCw,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import LanguageToggle from "../components/LanguageToggle";
import PortalCard from "../components/PortalCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LandingPageProps {
  onCompanyLogin: () => void;
  onStaffLogin: () => void;
  loginMode: "idle" | "company" | "staff";
  setLoginMode: (mode: "idle" | "company" | "staff") => void;
}

const STATS = [
  {
    value: "10+",
    label: "ERP Modülü",
    bg: "bg-indigo-50",
    color: "text-indigo-700",
    border: "border-indigo-200",
  },
  {
    value: "∞",
    label: "Şirket Kapasitesi",
    bg: "bg-orange-50",
    color: "text-orange-700",
    border: "border-orange-200",
  },
  {
    value: "10",
    label: "Dil Desteği",
    bg: "bg-emerald-50",
    color: "text-emerald-700",
    border: "border-emerald-200",
  },
  {
    value: "100%",
    label: "Güvenli Altyapı",
    bg: "bg-blue-50",
    color: "text-blue-700",
    border: "border-blue-200",
  },
];

export default function LandingPage({
  onCompanyLogin,
  onStaffLogin,
  loginMode: _loginMode,
  setLoginMode,
}: LandingPageProps) {
  const { login, clear, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();
  const { t } = useLanguage();
  const [pendingMode, setPendingMode] = useState<"idle" | "company" | "staff">(
    "idle",
  );
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoggingIn) setPendingMode("idle");
  }, [isLoggingIn]);

  const triggerLogin = async (mode: "company" | "staff") => {
    setPendingMode(mode);
    setLoginMode(mode);
    if (isLoginError) {
      await new Promise<void>((resolve) => {
        clear();
        setTimeout(resolve, 300);
      });
    }
    if (mode === "company") onCompanyLogin();
    else onStaffLogin();
    login();
  };

  const featureItems = [
    {
      icon: Layers,
      bg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: t("landing.features.multiTenant.title"),
      desc: t("landing.features.multiTenant.desc"),
    },
    {
      icon: Lock,
      bg: "bg-violet-100",
      iconColor: "text-violet-600",
      title: t("landing.features.roles.title"),
      desc: t("landing.features.roles.desc"),
    },
    {
      icon: Globe2,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: t("landing.features.multilang.title"),
      desc: t("landing.features.multilang.desc"),
    },
    {
      icon: Shield,
      bg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      title: t("landing.features.secure.title"),
      desc: t("landing.features.secure.desc"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 dot-grid-bg opacity-60" />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.55 0.22 280 / 0.4), transparent)",
          }}
        />
        {/* Soft gradient blobs */}
        <div
          className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 280), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute bottom-[-5%] left-[5%] w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.70 0.18 35), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* HEADER */}
      <header className="relative z-20 bg-background/90 border-b border-border shadow-xs backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative p-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <img
                  src="/assets/generated/erpverse-logo.dim_256x256.png"
                  alt="ERPVerse"
                  className="h-7 w-7 rounded-lg object-cover"
                />
              </div>
              <div>
                <span className="font-display font-bold text-lg leading-tight block text-foreground">
                  ERPVerse
                </span>
                <span className="text-[10px] leading-tight hidden sm:block text-muted-foreground">
                  {t("app.tagline")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* HERO */}
        <section className="pt-20 pb-12 sm:pt-28 sm:pb-16 px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="max-w-4xl mx-auto flex flex-col items-center gap-6"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
            }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary"
              data-ocid="landing.hero.section"
            >
              <Zap className="h-3.5 w-3.5" />
              {t("landing.hero.badge")}
            </div>

            {/* Headline — dark anchor + gradient accent for max contrast */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight">
              <span className="text-foreground">Unified </span>
              <span
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.52 0.24 280), oklch(0.58 0.20 310))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Business
              </span>
              <br className="hidden sm:block" />
              <span className="text-foreground"> Management</span>{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.68 0.20 35), oklch(0.62 0.20 15))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Platform
              </span>
            </h1>

            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl">
              {t("landing.hero.subtitle")}
            </p>

            {/* Stats row — pill badges for visual rhythm */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {STATS.map(({ value, label, bg, color, border }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${bg} ${border}`}
                >
                  <span className={`font-display text-lg font-black ${color}`}>
                    {value}
                  </span>
                  <span className={`text-xs font-semibold ${color} opacity-80`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTAL CARDS */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div
            className="max-w-4xl mx-auto flex flex-col gap-6"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(24px)",
              transition:
                "opacity 0.7s ease-out 0.15s, transform 0.7s ease-out 0.15s",
            }}
          >
            {/* Login error */}
            {isLoginError && (
              <div
                data-ocid="login.error_state"
                className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm bg-destructive/10 border border-destructive/30 text-destructive"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold mb-0.5">
                    {t("landing.loginError.title") || "Giriş başarısız oldu"}
                  </p>
                  <p className="text-xs opacity-80">
                    {loginError?.message?.includes("already authenticated")
                      ? t("landing.loginError.alreadyAuth") ||
                        "Oturum bilgisi algılandı. Lütfen tekrar deneyin."
                      : t("landing.loginError.generic") ||
                        "Giriş yapılamadı. Lütfen tekrar deneyin."}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="login.retry_button"
                  onClick={() => clear()}
                  className="flex items-center gap-1 text-xs font-medium opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("landing.loginError.retry") || "Sıfırla"}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PortalCard
                icon={<Building2 className="h-6 w-6" />}
                title={t("landing.ownerPortal.title")}
                subtitle={t("landing.ownerPortal.subtitle")}
                description={t("landing.ownerPortal.description")}
                features={[
                  t("landing.ownerPortal.features.0") || "Şirket Yönetimi",
                  t("landing.ownerPortal.features.1") || "Personel Kontrolü",
                  t("landing.ownerPortal.features.2") || "Rol Yönetimi",
                ]}
                loginBtnText={t("landing.ownerPortal.loginBtn")}
                isLoading={isLoggingIn && pendingMode === "company"}
                onLogin={() => void triggerLogin("company")}
                accentColor="indigo"
              />
              <PortalCard
                icon={<Users className="h-6 w-6" />}
                title={t("landing.staffPortal.title")}
                subtitle={t("landing.staffPortal.subtitle")}
                description={t("landing.staffPortal.description")}
                features={[
                  t("landing.staffPortal.features.0") || "Çoklu Şirket Desteği",
                  t("landing.staffPortal.features.1") || "Rol Bazlı Erişim",
                  t("landing.staffPortal.features.2") || "Personel Kodu",
                ]}
                loginBtnText={t("landing.staffPortal.loginBtn")}
                isLoading={isLoggingIn && pendingMode === "staff"}
                onLogin={() => void triggerLogin("staff")}
                accentColor="coral"
              />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border bg-secondary/40">
          <div
            className="max-w-5xl mx-auto"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.8s ease-out 0.3s",
            }}
          >
            <div className="flex flex-col items-center gap-3 mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center">
                {t("landing.features.title")}
              </h2>
              <div
                className="w-12 h-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.55 0.22 280), oklch(0.70 0.18 35))",
                }}
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featureItems.map(
                ({ icon: Icon, bg, iconColor, title, desc }, i) => (
                  <div
                    key={title}
                    className="relative group rounded-2xl p-5 flex flex-col gap-3 bg-card border border-border shadow-card card-lift"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Icon badge */}
                    <div className={`p-2.5 rounded-xl w-fit ${bg}`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-sm">
                      {title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {desc}
                    </p>
                    <CheckCircle2 className="h-3.5 w-3.5 absolute bottom-4 right-4 opacity-0 group-hover:opacity-30 transition-opacity text-primary" />
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* CTA STRIP */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <div
              className="rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center gap-6 justify-between"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.62 0.18 320))",
              }}
            >
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <span className="font-display text-xl font-bold text-white">
                  Hemen Başlayın
                </span>
                <span className="text-sm text-white/75">
                  Ücretsiz şirket hesabı oluşturun, blockchain güvencesiyle
                  yönetin.
                </span>
              </div>
              <button
                type="button"
                data-ocid="landing.cta.primary_button"
                onClick={() => void triggerLogin("company")}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 disabled:opacity-50 bg-white text-primary hover:bg-white/90 shadow-md"
              >
                Şirket Kur
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} ERPVerse. {t("footer.rights")}.
          </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
