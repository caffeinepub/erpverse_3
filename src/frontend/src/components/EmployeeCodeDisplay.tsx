import { CheckCheck, Copy, Key } from "lucide-react";
import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface EmployeeCodeDisplayProps {
  code: string;
}

export default function EmployeeCodeDisplay({
  code,
}: EmployeeCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">
          {t("staffRegistration.codeTitle")}
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3">
          <span className="font-mono text-xl font-bold tracking-[0.3em] text-primary">
            {code}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-all"
        >
          {copied ? (
            <>
              <CheckCheck className="h-4 w-4" />
              {t("staffRegistration.codeCopied")}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {t("staffRegistration.copyBtn")}
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("staffRegistration.codeDesc")}
      </p>
    </div>
  );
}
