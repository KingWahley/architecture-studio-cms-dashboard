"use client";

import { useMemo, useState } from "react";
import { Check, KeyRound, MoonStar, Palette, ShieldCheck, SunMedium } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const PASSWORD_STORAGE_KEY = "dashboard-password-hash";
const THEME_ICONS = {
  light: SunMedium,
  dark: MoonStar,
  gold: Palette,
};

async function hashPassword(value) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function SettingsPanel() {
  const { theme, setTheme, themes } = useTheme();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordState, setPasswordState] = useState({
    type: "idle",
    message: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const activeTheme = useMemo(
    () => themes.find((item) => item.id === theme) ?? themes[0],
    [theme, themes]
  );

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordState({
      type: "idle",
      message: "",
    });

    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const storedHash = window.localStorage.getItem(PASSWORD_STORAGE_KEY);

    if (storedHash) {
      if (!currentPassword) {
        setPasswordState({
          type: "error",
          message: "Enter your current password before saving a new one.",
        });
        return;
      }

      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== storedHash) {
        setPasswordState({
          type: "error",
          message: "The current password you entered does not match this dashboard.",
        });
        return;
      }
    }

    if (newPassword.length < 8) {
      setPasswordState({
        type: "error",
        message: "Use at least 8 characters for the new password.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordState({
        type: "error",
        message: "The confirmation password does not match.",
      });
      return;
    }

    setIsSavingPassword(true);

    try {
      const nextHash = await hashPassword(newPassword);
      window.localStorage.setItem(PASSWORD_STORAGE_KEY, nextHash);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordState({
        type: "success",
        message: storedHash
          ? "Password updated for this dashboard on this device."
          : "Password created for this dashboard on this device.",
      });
    } catch {
      setPasswordState({
        type: "error",
        message: "Password update failed in this browser. Please try again.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        
        <div>
          <h1 className="font-display text-3xl font-semibold text-on-surface">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Control your dashboard appearance and secure access from one place.
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-accent-deep-blue/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Palette size={20} className="text-accent-deep-blue" />
              Appearance
            </CardTitle>
            <CardDescription>
              Switch between bright, dark, or brand-led styling and keep your choice across refreshes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              {themes.map((option) => {
                const Icon = THEME_ICONS[option.id] ?? Palette;
                const isActive = option.id === theme;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      "group rounded-2xl border p-4 text-left transition-all",
                      isActive
                        ? "border-accent-deep-blue bg-accent-deep-blue/[0.06] shadow-architectural"
                        : "border-border-subtle bg-surface-main hover:border-accent-deep-blue/35 hover:bg-surface-alt"
                    )}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-alt text-accent-deep-blue">
                        <Icon size={20} />
                      </div>
                      {isActive && (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-deep-blue text-white">
                          <Check size={16} />
                        </span>
                      )}
                    </div>

                    <div className="mt-5">
                      <p className="font-display text-lg font-semibold text-on-surface">{option.label}</p>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">{option.description}</p>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <span className="h-3 w-10 rounded-full bg-surface-main ring-1 ring-border-subtle" />
                      <span className="h-3 w-10 rounded-full bg-accent-deep-blue/70" />
                      <span className="h-3 w-10 rounded-full bg-accent-muted-gold/80" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-alt/80 p-4">
              <p className="text-sm font-semibold text-on-surface">
                Active theme: <span className="text-accent-deep-blue">{activeTheme.label}</span>
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Your preference is saved locally and applied across the dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent-deep-blue/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <KeyRound size={20} className="text-accent-deep-blue" />
              Password
            </CardTitle>
            <CardDescription>
              Set or update the dashboard password stored in this browser for the current device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary" htmlFor="currentPassword">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary" htmlFor="newPassword">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Use at least 8 characters"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter the new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>

             

              {passwordState.message ? (
                <div
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm",
                    passwordState.type === "success"
                      ? "border border-accent-deep-blue/15 bg-accent-deep-blue/10 text-accent-deep-blue"
                      : "border border-error/20 bg-error/10 text-error"
                  )}
                >
                  {passwordState.message}
                </div>
              ) : null}

              <Button type="submit" className="w-full h-11" disabled={isSavingPassword}>
                {isSavingPassword ? "Saving Password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
