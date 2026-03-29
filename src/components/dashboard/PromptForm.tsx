"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Button, Select, SelectItem, Switch, Chip } from "@nextui-org/react";
import slugify from "slugify";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type PromptFormInitialData = {
  id: string;
  title: string;
  slug: string;
  promptTypeId: string;
  description: string | null;
  systemPrompt: string | null;
  userPrompt: string;
  status: "DRAFT" | "PUBLISHED";
  tags: { id: string; name: string }[];
};

type PromptFormData = {
  title: string;
  slug: string;
  promptTypeId: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  status: "DRAFT" | "PUBLISHED";
  tags: string[];
};

type PromptFormProps = {
  initialData?: PromptFormInitialData;
  tags: { id: string; name: string }[];
  promptTypes: { id: string; name: string }[];
};

export function PromptForm({ initialData, tags, promptTypes }: PromptFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PromptFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    promptTypeId: initialData?.promptTypeId || (promptTypes.length > 0 ? promptTypes[0].id : ""),
    description: initialData?.description || "",
    systemPrompt: initialData?.systemPrompt || "",
    userPrompt: initialData?.userPrompt || "",
    status: initialData?.status || "DRAFT",
    tags: initialData?.tags?.map((tag) => tag.id) || [],
  });

  const variables = useMemo(() => {
    const text = formData.userPrompt || "";
    const matches = Array.from(text.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) as RegExpMatchArray[];
    return Array.from(new Set(matches.map((match) => match[1])));
  }, [formData.userPrompt]);

  const handleTitleChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      title: val,
      // Auto-generate slug only if we are creating a new prompt
      slug: !initialData ? slugify(val, { lower: true, strict: true }) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const promptId = initialData?.id;
      const isEdit = typeof promptId === "string";
      const url = isEdit ? `/api/prompts/${promptId}` : "/api/prompts";
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Something went wrong");
        return;
      }
      
      router.push("/dashboard/prompts");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <Switch
            isSelected={formData.status === "PUBLISHED"}
            onValueChange={(val) =>
              setFormData({ ...formData, status: val ? "PUBLISHED" : "DRAFT" })
            }
            color="success"
          >
            {formData.status === "PUBLISHED" ? "Published" : "Draft"}
          </Switch>
        </div>
        <div className="flex gap-3">
          <Button variant="flat" onPress={() => router.back()}>
            Cancel
          </Button>
          <Button color="primary" type="submit" isLoading={isSubmitting}>
            {initialData ? "Save Changes" : "Create Prompt"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Form Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold mb-4">Core Content</h2>
            <Input 
              isRequired 
              label="Prompt Title" 
              placeholder="e.g. SEO Article Generator" 
              value={formData.title}
              onValueChange={handleTitleChange}
              size="lg"
            />
            
            <Input 
              isRequired 
              label="URL Slug" 
              placeholder="e.g. seo-article-generator" 
              value={formData.slug}
              onValueChange={(val) => setFormData({...formData, slug: val})}
              description="This will be the unique URL for your prompt"
            />
            
            <Textarea 
              label="Short Description" 
              placeholder="Briefly describe what this prompt does..."
              value={formData.description}
              onValueChange={(val) => setFormData({...formData, description: val})}
            />

            <div>
              <p className="text-sm font-medium mb-2">System Prompt (Context/Persona)</p>
              <div data-color-mode="light" className="dark:hidden">
                <MDEditor value={formData.systemPrompt} onChange={(v) => setFormData({...formData, systemPrompt: v || ""})} height={200} />
              </div>
              <div data-color-mode="dark" className="hidden dark:block">
                <MDEditor value={formData.systemPrompt} onChange={(v) => setFormData({...formData, systemPrompt: v || ""})} height={200} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-medium">User Prompt (Main Template)</p>
                <div className="flex gap-1">
                  {variables.map((variable) => (
                    <Chip key={variable} size="sm" color="secondary" variant="flat">
                      {`{{ ${variable} }}`}
                    </Chip>
                  ))}
                </div>
              </div>
              <div data-color-mode="light" className="dark:hidden">
                <MDEditor value={formData.userPrompt} onChange={(v) => setFormData({...formData, userPrompt: v || ""})} height={300} />
              </div>
              <div data-color-mode="dark" className="hidden dark:block">
                <MDEditor value={formData.userPrompt} onChange={(v) => setFormData({...formData, userPrompt: v || ""})} height={300} />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Use {"{{ variable_name }}"} syntax to create inputs for variables.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold mb-4">Metadata</h2>
            
            <Select 
              label="Prompt Type" 
              selectedKeys={formData.promptTypeId ? [formData.promptTypeId] : []} 
              onChange={(e) => setFormData({...formData, promptTypeId: e.target.value})}
            >
              {promptTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </Select>
            <Select 
              label="Tags"
              selectionMode="multiple" 
              placeholder="Select tags"
              selectedKeys={new Set(formData.tags)} 
              onSelectionChange={(keys) => setFormData({...formData, tags: Array.from(keys) as string[]})}
            >
              {tags.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </form>
  );
}
