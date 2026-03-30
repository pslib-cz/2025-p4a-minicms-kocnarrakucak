"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Button, Select, SelectItem, Chip } from "@nextui-org/react";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { FormField } from "@/components/FormField";
import { resolvePromptTypeSelection } from "@/lib/prompt-relations";
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

  const selectedPromptType = promptTypes.find((promptType) => promptType.id === formData.promptTypeId);
  const selectedTags = tags.filter((tag) => formData.tags.includes(tag.id));
  const hasPromptTypes = promptTypes.length > 0;
  const statusOptions = [
    {
      value: "DRAFT" as const,
      title: "Draft",
      description: "Keep the prompt private while you iterate.",
    },
    {
      value: "PUBLISHED" as const,
      title: "Published",
      description: "Show the prompt in the public library.",
    },
  ];

  const fieldClassNames = {
    label: "text-muted",
    description: "text-muted-soft",
    inputWrapper:
      "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none group-data-[focus=true]:border-foreground/30",
    input: "text-foreground",
  } as const;

  const textAreaClassNames = {
    label: "text-muted",
    description: "text-muted-soft",
    inputWrapper:
      "rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none group-data-[focus=true]:border-foreground/30",
    input: "text-foreground",
  } as const;

  const selectClassNames = {
    label: "text-muted",
    value: "text-foreground",
    description: "text-muted-soft",
    trigger:
      "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none data-[focus=true]:border-foreground/30",
    popoverContent: "border border-border bg-surface text-foreground",
  } as const;

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !initialData ? slugify(val, { lower: true, strict: true }) : prev.slug,
    }));
  };

  useEffect(() => {
    const nextPromptTypeId = resolvePromptTypeSelection(formData.promptTypeId, promptTypes);

    if (nextPromptTypeId !== formData.promptTypeId) {
      setFormData((prev) => ({
        ...prev,
        promptTypeId: nextPromptTypeId,
      }));
    }
  }, [formData.promptTypeId, promptTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPromptTypes) {
      alert("Create at least one prompt type before saving a prompt.");
      return;
    }

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
      <DashboardPanel className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Publishing state</p>
          <div className="grid gap-3 md:grid-cols-2">
            {statusOptions.map((option) => {
              const isActive = formData.status === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: option.value })}
                  className={`rounded-[22px] border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-border bg-surface-strong text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.14)]"
                      : "border-border/80 bg-[rgba(255,255,255,0.02)] text-muted hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition ${
                        isActive ? "border-foreground bg-foreground/10" : "border-border"
                      }`}
                    >
                      <span
                        className={`size-2 rounded-full transition ${
                          isActive ? "bg-foreground" : "bg-transparent"
                        }`}
                      />
                    </span>
                    <span className="space-y-1">
                      <span className="block text-[14px] text-foreground">{option.title}</span>
                      <span className="block text-[12px] leading-[1.6] text-muted">
                        {option.description}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[13px] leading-[1.7] text-muted">
            Published prompts appear in the public library. Drafts stay private inside your workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="flat"
            onPress={() => router.back()}
            className="h-11 rounded-full border border-border bg-surface px-5 text-[13px] text-muted transition hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!hasPromptTypes}
            className="h-11 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel"
          >
            {initialData ? "Save Changes" : "Create Prompt"}
          </Button>
        </div>
      </DashboardPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-6">
          <DashboardPanel className="space-y-6">
            <div className="space-y-2">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Core Content</p>
              <h2 className="text-[24px] font-medium text-foreground">Identity and summary</h2>
            </div>

            <FormField label="Prompt title">
              <Input
                isRequired
                aria-label="Prompt title"
                placeholder="e.g. SEO Article Generator"
                value={formData.title}
                onValueChange={handleTitleChange}
                size="lg"
                classNames={fieldClassNames}
              />
            </FormField>

            <FormField
              label="URL slug"
              hint="This will be the unique URL for your prompt."
            >
              <Input
                isRequired
                aria-label="URL slug"
                placeholder="e.g. seo-article-generator"
                value={formData.slug}
                onValueChange={(val) => setFormData({ ...formData, slug: val })}
                classNames={fieldClassNames}
              />
            </FormField>

            <FormField label="Short description">
              <Textarea
                aria-label="Short description"
                placeholder="Briefly describe what this prompt does..."
                value={formData.description}
                onValueChange={(val) => setFormData({ ...formData, description: val })}
                minRows={4}
                classNames={textAreaClassNames}
              />
            </FormField>
          </DashboardPanel>

          <DashboardPanel className="space-y-6">
            <div className="space-y-2">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Prompt Body</p>
              <h2 className="text-[24px] font-medium text-foreground">System and user instructions</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-[14px] text-foreground">System prompt</p>
                <p className="text-[13px] text-muted">
                  Use this for context, persona or high-level operating rules.
                </p>
              </div>

              <div className="dashboard-editor">
                <div data-color-mode="light" className="dark:hidden">
                  <MDEditor
                    value={formData.systemPrompt}
                    onChange={(value) => setFormData({ ...formData, systemPrompt: value || "" })}
                    height={220}
                    visibleDragbar={false}
                  />
                </div>
                <div data-color-mode="dark" className="hidden dark:block">
                  <MDEditor
                    value={formData.systemPrompt}
                    onChange={(value) => setFormData({ ...formData, systemPrompt: value || "" })}
                    height={220}
                    visibleDragbar={false}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                  <p className="text-[14px] text-foreground">User prompt template</p>
                  <p className="text-[13px] text-muted">
                    Main prompt body. Use <code>{"{{ variable_name }}"}</code> to expose dynamic inputs.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <Chip
                      key={variable}
                      size="sm"
                      variant="flat"
                      classNames={{
                        base: "border border-border bg-[rgba(255,255,255,0.03)]",
                        content: "text-[12px] text-foreground",
                      }}
                    >
                      {`{{ ${variable} }}`}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="dashboard-editor">
                <div data-color-mode="light" className="dark:hidden">
                  <MDEditor
                    value={formData.userPrompt}
                    onChange={(value) => setFormData({ ...formData, userPrompt: value || "" })}
                    height={320}
                    visibleDragbar={false}
                  />
                </div>
                <div data-color-mode="dark" className="hidden dark:block">
                  <MDEditor
                    value={formData.userPrompt}
                    onChange={(value) => setFormData({ ...formData, userPrompt: value || "" })}
                    height={320}
                    visibleDragbar={false}
                  />
                </div>
              </div>

              <p className="text-[12px] text-muted-soft">
                Variables are detected automatically and shown in the side panel.
              </p>
            </div>
          </DashboardPanel>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <DashboardPanel className="space-y-5">
            <div className="space-y-2">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Metadata</p>
              <h2 className="text-[24px] font-medium text-foreground">Structure and tags</h2>
            </div>

            {!hasPromptTypes && (
              <div className="rounded-[22px] border border-amber-500/30 bg-amber-500/8 px-4 py-4 text-[13px] leading-[1.7] text-amber-100 dark:text-amber-100">
                Create at least one prompt type in the Prompt Types section before publishing a new prompt.
              </div>
            )}

            <FormField label="Prompt type">
              <Select
                aria-label="Prompt type"
                placeholder="Choose prompt type"
                selectedKeys={formData.promptTypeId ? [formData.promptTypeId] : []}
                onChange={(e) => setFormData({ ...formData, promptTypeId: e.target.value })}
                isDisabled={!hasPromptTypes}
                classNames={selectClassNames}
              >
                {promptTypes.map((promptType) => (
                  <SelectItem key={promptType.id} value={promptType.id}>
                    {promptType.name}
                  </SelectItem>
                ))}
              </Select>
            </FormField>

            <FormField label="Tags" hint="Use tags to improve discovery and filtering.">
              <Select
                aria-label="Tags"
                selectionMode="multiple"
                placeholder="Select tags"
                selectedKeys={new Set(formData.tags)}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    tags:
                      keys === "all"
                        ? tags.map((tag) => tag.id)
                        : Array.from(keys, (key) => key.toString()),
                  })
                }
                classNames={selectClassNames}
              >
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </Select>
            </FormField>
          </DashboardPanel>

          <DashboardPanel className="space-y-4">
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Route Preview</p>
            <div className="rounded-[22px] border border-border/80 bg-surface-strong px-4 py-4">
              <p className="text-[13px] leading-[1.7] text-muted">
                {selectedPromptType?.name || "Prompt type"} / your-username / {formData.slug || "prompt-slug"}
              </p>
            </div>
            <p className="text-[13px] leading-[1.7] text-muted">
              Keep slugs short and stable. Changing them later can break shared links.
            </p>
          </DashboardPanel>

          <DashboardPanel className="space-y-4">
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Detected Variables</p>
            {variables.length === 0 ? (
            <p className="text-[13px] leading-[1.7] text-muted">
                No variables detected yet. Add placeholders like <code>{"{{ topic }}"}</code> in the user prompt.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Chip
                    key={variable}
                    size="sm"
                    variant="flat"
                    classNames={{
                      base: "border border-border bg-[rgba(255,255,255,0.03)]",
                      content: "text-[12px] text-foreground",
                    }}
                  >
                    {`{{ ${variable} }}`}
                  </Chip>
                ))}
              </div>
            )}

            <div className="border-t border-border/80 pt-4">
              <p className="text-[13px] text-muted">
                Selected tags:{" "}
                <span className="text-foreground">
                  {selectedTags.length > 0
                    ? selectedTags.map((tag) => tag.name).join(", ")
                    : "No tags selected"}
                </span>
              </p>
            </div>
          </DashboardPanel>
        </div>
      </div>
    </form>
  );
}
