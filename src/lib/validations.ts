import { z } from "zod";

export const tagSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const aiModelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  provider: z.string().min(2, "Provider must be at least 2 characters"),
  description: z.string().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const promptSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  promptTypeId: z.string().min(1, "Prompt type is required"),
  description: z.string().optional().nullable(),
  systemPrompt: z.string().optional().nullable(),
  userPrompt: z.string().min(5, "User prompt is required"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  tags: z.array(z.string()), // array of tag IDs
});

export const evaluationSchema = z.object({
  aiModelId: z.string().min(1, "AI Model is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and dashes"),
});
