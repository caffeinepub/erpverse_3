import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import LanguageToggle from "./LanguageToggle";

interface HeaderProps {
  showAuth?: boolean;
  userName?: string;
}

export default function Header({ showAuth = true, userName }: HeaderProps) {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "oklch(1 0 0)",
        borderBottom: "1px solid oklch(0.88 0.01 270)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="relative p-1.5 rounded-xl flex-shrink-0"
              style={{
                backgroundColor: "oklch(0.93 0.025 280)",
                border: "1px solid oklch(0.83 0.06 280)",
              }}
            >
              <img
                src="/assets/generated/erpverse-logo.dim_256x256.png"
                alt="ERPVerse"
                className="h-7 w-7 rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span
                className="font-bold text-lg leading-tight"
                style={{
                  fontFamily: "Bricolage Grotesque, sans-serif",
                  color: "oklch(0.12 0.012 270)",
                }}
              >
                ERPVerse
              </span>
              <span
                className="text-[10px] leading-tight hidden sm:block"
                style={{ color: "oklch(0.55 0.012 270)" }}
              >
                {t("app.tagline")}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            {showAuth && isAuthenticated && (
              <div className="flex items-center gap-2">
                {userName && (
                  <div
                    className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: "oklch(0.96 0.008 270)",
                      border: "1px solid oklch(0.88 0.01 270)",
                      color: "oklch(0.2 0.015 270)",
                    }}
                  >
                    <User
                      className="h-3.5 w-3.5"
                      style={{ color: "oklch(0.45 0.22 280)" }}
                    />
                    <span className="font-medium">{userName}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loginStatus === "logging-in"}
                  data-ocid="header.logout.button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    color: "oklch(0.45 0.01 270)",
                    border: "1px solid oklch(0.88 0.01 270)",
                    backgroundColor: "oklch(1 0 0)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.45 0.2 25)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "oklch(0.8 0.1 25)";
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "oklch(0.97 0.02 25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.45 0.01 270)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "oklch(0.88 0.01 270)";
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "oklch(1 0 0)";
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("nav.logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
