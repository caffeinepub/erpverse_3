import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LANGUAGE_OPTIONS, useLanguage } from "../contexts/LanguageContext";
import type { Language } from "../contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage, currentOption } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideButton = ref.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideButton && !insideDropdown) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
        minWidth: 176,
        zIndex: 9999,
      });
    }
    setOpen((prev) => !prev);
  };

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setOpen(false);
  };

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="rounded-lg border border-gray-200 bg-white shadow-lg py-1 overflow-hidden"
      data-ocid="language.dropdown_menu"
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          type="button"
          key={option.code}
          onClick={() => handleSelect(option.code)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors hover:bg-indigo-50 ${
            language === option.code
              ? "bg-indigo-50 text-indigo-700 font-semibold"
              : "text-gray-700 hover:text-gray-900"
          }`}
          data-ocid={`language.item.${LANGUAGE_OPTIONS.indexOf(option) + 1}`}
        >
          <span className="flex-1">{option.nativeLabel}</span>
          {option.dir === "rtl" && (
            <span className="text-[10px] text-muted-foreground uppercase">
              RTL
            </span>
          )}
          {language === option.code && (
            <svg
              role="img"
              aria-label="selected"
              className="w-3 h-3 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 transition-colors"
        aria-label="Select language"
        data-ocid="language.toggle"
      >
        <span>{currentOption.nativeLabel}</span>
        <svg
          role="img"
          aria-label="dropdown arrow"
          className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
