"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@nextui-org/react";
import { FormField } from "@/components/FormField";
import { FaCheck, FaRegClone } from "react-icons/fa";

export function VariableInjector({ rawPrompt }: { rawPrompt: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const resetTimerRef = useRef<number | null>(null);

  const variables = useMemo(() => {
    const matches = Array.from(rawPrompt.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g));
    return Array.from(new Set(matches.map((match) => match[1])));
  }, [rawPrompt]);

  const injectedPrompt = useMemo(() => {
    let result = rawPrompt;

    Object.entries(values).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      result = result.replace(regex, val || `{{ ${key} }}`);
    });

    return result;
  }, [values, rawPrompt]);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(injectedPrompt);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = injectedPrompt;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopyState("idle");
    }, 1800);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      {variables.length > 0 && (
        <div className="rounded-[28px] border border-border/80 bg-surface/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.14)] backdrop-blur-sm xl:sticky xl:top-6 xl:self-start">
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Variables</p>
            <h3 className="text-[24px] font-medium text-foreground">Configure prompt</h3>
          </div>
          <div className="space-y-4">
            {variables.map((variable) => (
              <FormField key={variable} label={variable}>
                <Input
                  aria-label={variable}
                  placeholder={`Enter value for ${variable}`}
                  value={values[variable] || ""}
                  onValueChange={(val) => handleChange(variable, val)}
                  variant="bordered"
                  classNames={{
                    label: "text-muted",
                    inputWrapper:
                      "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none group-data-[focus=true]:border-foreground/30",
                    input: "text-foreground",
                  }}
                />
              </FormField>
            ))}
          </div>
          <p className="mt-6 text-[12px] leading-[1.7] text-muted-soft">
            Values are injected into the prompt in real-time.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Preview</p>
            <h2 className="text-[24px] font-medium text-foreground">Prompt template</h2>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-4 py-2 text-[12px] text-foreground transition hover:bg-panel"
          >
            {copyState === "copied" ? <FaCheck size={12} /> : <FaRegClone size={12} />}
            <span>
              {copyState === "copied"
                ? "Copied"
                : copyState === "error"
                  ? "Copy failed"
                  : "Copy prompt"}
            </span>
          </button>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-surface/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.14)] backdrop-blur-sm md:p-8">
          <pre className="whitespace-pre-wrap text-[15px] leading-[1.85] text-foreground">
            {injectedPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
}
