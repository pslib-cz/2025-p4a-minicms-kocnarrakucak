"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@nextui-org/react";
import { FormField } from "@/components/FormField";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const currentUsername = session?.user?.username ?? "";

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update username");
      }

      await update({ user: { username } });
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage the public identity used across your prompt URLs and creator profile surfaces."
      />

      <DashboardPanel className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
          <span className="rounded-full border border-border bg-surface-strong px-4 py-2 text-foreground">
            Current username: {currentUsername || "not set"}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Public route: /[type]/{currentUsername || "username"}/[slug]
          </span>
        </div>

        <form onSubmit={handleSubmit} className="max-w-[34rem] space-y-5 rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-5">
          <div className="space-y-2">
            <h2 className="text-[20px] font-medium text-foreground">Profile settings</h2>
            <p className="text-[13px] leading-[1.7] text-muted">
              This username is used in your public prompt URLs, so changes will affect links to your content.
            </p>
          </div>

          <FormField
            label="Username"
            hint="Only letters, numbers, underscores and dashes are allowed."
          >
            <Input
              id="username"
              type="text"
              aria-label="Username"
              value={username}
              onValueChange={setUsername}
              placeholder="Your username"
              isRequired
              classNames={{
                label: "text-muted",
                description: "text-muted-soft",
                inputWrapper:
                  "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none",
                input: "text-foreground",
              }}
            />
          </FormField>

          {error && (
            <p className="rounded-[18px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-[18px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-200">
              Username updated successfully.
            </p>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            isDisabled={isLoading || username === currentUsername || !username}
            className="h-11 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel"
          >
            Save changes
          </Button>
        </form>
      </DashboardPanel>
    </div>
  );
}
