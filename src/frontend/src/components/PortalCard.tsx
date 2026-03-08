import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import type React from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface PortalCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  loginBtnText: string;
  isLoading: boolean;
  onLogin: () => void;
  accentColor?: "gold" | "blue" | "cyan" | "violet" | "indigo" | "coral";
}

const COLORS = {
  indigo: {
    headerBg: "bg-gradient-to-br from-indigo-600 to-violet-600",
    headerBorder: "border-b-0",
    iconRing: "bg-white/20 ring-2 ring-white/30",
    iconColor: "text-white",
    tagBg: "bg-white/20 text-white/90",
    checkColor: "text-indigo-500",
    btn: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_14px_oklch(0.52_0.24_280/0.4)] hover:shadow-[0_6px_20px_oklch(0.52_0.24_280/0.5)]",
    subtitleAccent: "text-indigo-600",
  },
  coral: {
    headerBg: "bg-gradient-to-br from-orange-500 to-rose-500",
    headerBorder: "border-b-0",
    iconRing: "bg-white/20 ring-2 ring-white/30",
    iconColor: "text-white",
    tagBg: "bg-white/20 text-white/90",
    checkColor: "text-orange-500",
    btn: "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_4px_14px_oklch(0.68_0.20_35/0.4)] hover:shadow-[0_6px_20px_oklch(0.68_0.20_35/0.5)]",
    subtitleAccent: "text-orange-600",
  },
  cyan: {
    headerBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    headerBorder: "border-b-0",
    iconRing: "bg-white/20 ring-2 ring-white/30",
    iconColor: "text-white",
    tagBg: "bg-white/20 text-white/90",
    checkColor: "text-cyan-500",
    btn: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_4px_14px_rgba(6,182,212,0.4)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.5)]",
    subtitleAccent: "text-cyan-600",
  },
  violet: {
    headerBg: "bg-gradient-to-br from-violet-600 to-purple-700",
    headerBorder: "border-b-0",
    iconRing: "bg-white/20 ring-2 ring-white/30",
    iconColor: "text-white",
    tagBg: "bg-white/20 text-white/90",
    checkColor: "text-violet-500",
    btn: "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)]",
    subtitleAccent: "text-violet-600",
  },
  gold: {
    headerBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    headerBorder: "border-b-0",
    iconRing: "bg-white/20 ring-2 ring-white/30",
    iconColor: "text-white",
    tagBg: "bg-white/20 text-white/90",
    checkColor: "text-amber-500",
    btn: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_4px_14px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)]",
    subtitleAccent: "text-amber-600",
  },
  blue: {
    headerBg: "bg-gradient-to-br from-blue-600 to-indigo-700",
    headerBorder: "border-b-0",
    iconRing: "bg-white/20 ring-2 ring-white/30",
    iconColor: "text-white",
    tagBg: "bg-white/20 text-white/90",
    checkColor: "text-blue-500",
    btn: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)]",
    subtitleAccent: "text-blue-600",
  },
};

export default function PortalCard({
  icon,
  title,
  subtitle,
  description,
  features,
  loginBtnText,
  isLoading,
  onLogin,
  accentColor = "indigo",
}: PortalCardProps) {
  const { t } = useLanguage();
  const c = COLORS[accentColor] ?? COLORS.indigo;

  return (
    <div className="relative group rounded-2xl flex flex-col bg-card border border-border overflow-hidden card-lift shadow-card">
      {/* Colored header band — the signature visual */}
      <div className={`${c.headerBg} px-6 pt-6 pb-5 relative overflow-hidden`}>
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-2 top-8 w-14 h-14 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative flex items-center gap-4">
          {/* Icon in ring */}
          <div className={`p-3 rounded-xl flex-shrink-0 ${c.iconRing}`}>
            <span className={c.iconColor}>{icon}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full w-fit ${c.tagBg}`}
            >
              {subtitle}
            </span>
            <h2 className="font-display text-xl font-bold text-white leading-tight">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-4 p-6 flex-1">
        {/* Description */}
        <p className="text-sm text-foreground/70 leading-relaxed">
          {description}
        </p>

        {/* Features */}
        <ul className="flex flex-col gap-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 text-sm text-foreground"
            >
              <CheckCircle2
                className={`h-4 w-4 flex-shrink-0 ${c.checkColor}`}
              />
              <span className="font-medium">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          type="button"
          onClick={onLogin}
          disabled={isLoading}
          data-ocid={`portal.${accentColor}.button`}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 ${c.btn}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("landing.ownerPortal.loggingIn")}
            </>
          ) : (
            <>
              {loginBtnText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
