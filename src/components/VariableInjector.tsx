"use client";

import { useState, useEffect } from "react";
import { Input, Button, Snippet } from "@nextui-org/react";
import ReactMarkdown from "react-markdown";

export function VariableInjector({ rawPrompt }: { rawPrompt: string }) {
  const [variables, setVariables] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [injectedPrompt, setInjectedPrompt] = useState(rawPrompt);

  useEffect(() => {
    // Extract variables
    const matches = Array.from(rawPrompt.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g));
    const vars = Array.from(new Set(matches.map(m => m[1])));
    setVariables(vars);
    
    // Initialize empty values
    const initVals: Record<string, string> = {};
    vars.forEach(v => { initVals[v] = ""; });
    setValues(initVals);
  }, [rawPrompt]);

  useEffect(() => {
    let result = rawPrompt;
    Object.entries(values).forEach(([key, val]) => {
      // Replace all instances of {{ key }} with the value (or keep it if empty)
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      result = result.replace(regex, val || `{{ ${key} }}`);
    });
    setInjectedPrompt(result);
  }, [values, rawPrompt]);

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Variables Input Panel */}
      {variables.length > 0 && (
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/30 rounded-3xl p-6 shadow-sm h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-6 text-blue-600 dark:text-blue-400">Configure Prompt</h3>
          <div className="space-y-4">
            {variables.map(v => (
              <Input
                key={v}
                label={v}
                placeholder={`Enter value for ${v}`}
                value={values[v] || ""}
                onValueChange={(val) => handleChange(v, val)}
                variant="bordered"
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-6 mt-auto">
            Values are injected into the prompt in real-time.
          </p>
        </div>
      )}

      {/* Main Prompt Viewer */}
      <div className={`space-y-4 ${variables.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Prompt Template</h2>
          <Snippet 
            hideSymbol 
            color="primary" 
            variant="flat" 
            codeString={injectedPrompt}
          >
            Copy Final Prompt
          </Snippet>
        </div>
        
        <div className="bg-zinc-100 dark:bg-zinc-900/50 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-lg leading-relaxed whitespace-pre-wrap font-mono text-zinc-800 dark:text-zinc-300">
          {injectedPrompt}
        </div>
      </div>
    </div>
  );
}
