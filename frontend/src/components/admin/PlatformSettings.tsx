"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Settings,
  Shield,
  Mail,
  Sliders,
  Send,
  Check,
  AlertTriangle,
  X,
  Sparkles,
  Lock,
  Clock,
  Globe,
  DollarSign,
  Palette,
} from "lucide-react";
import { adminSettingsApi } from "@/lib/admin-api";

export default function PlatformSettings() {
  const t = useTranslations("Admin.settings");
  const tc = useTranslations("Admin.common");

  const [activeTab, setActiveTab] = useState<"general" | "security" | "email">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [settings, setSettings] = useState({
    platformName: "StayEase Luxury Hotels",
    platformDescription: "Global Luxury Hotel Reservation Management",
    primaryColor: "#1e40af",
    secondaryColor: "#7c3aed",
    currency: "USD",
    timezone: "UTC+07:00",
    contactEmail: "support@stayease.com",
    supportPhone: "+1 (800) 782-9327",
    maintenanceMode: false,
    maintenanceMessage: "StayEase is currently undergoing scheduled maintenance. Please check back shortly.",
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 1440,
    enableTwoFactor: false,
    enableEmailVerification: true,
  });

  const [emailConfig, setEmailConfig] = useState({
    emailProvider: "smtp",
    smtpHost: "smtp.mailtrap.io",
    smtpPort: 2525,
    smtpUser: "stayease-support",
    smtpPassword: "••••••••",
  });

  const [testEmailForm, setTestEmailForm] = useState({
    to: "admin@stayease.com",
    subject: "StayEase SMTP Verification Test",
    body: "This is an automated test email validating your StayEase SMTP configuration.",
  });
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [setRes, mailRes] = await Promise.all([
        adminSettingsApi.getSettings(),
        adminSettingsApi.getEmailSettings(),
      ]);

      if (setRes.success && setRes.data) {
        setSettings((prev) => ({ ...prev, ...setRes.data }));
      }
      if (mailRes.success && mailRes.data) {
        setEmailConfig((prev) => ({ ...prev, ...mailRes.data }));
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminSettingsApi.updateSettings(settings);
      if (res.success) {
        setMessage({ type: "success", text: t("settingsSaved") });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminSettingsApi.updateEmailSettings(emailConfig);
      if (res.success) {
        setMessage({ type: "success", text: "Email configuration updated successfully." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save email settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingEmail(true);
    try {
      const res = await adminSettingsApi.testEmail(testEmailForm);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send test email" });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">{tc("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {message && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-sm font-semibold shadow-md animate-in fade-in ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
              : "bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings size={28} className="text-blue-500" />
          <span>{t("title")}</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === "general"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Sliders size={16} />
          <span>{t("generalTab")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === "security"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Shield size={16} />
          <span>{t("securityTab")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === "email"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Mail size={16} />
          <span>{t("emailTab")}</span>
        </button>
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-blue-500" />
              <span>Branding & Localization</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("platformName")}
                </label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("platformDesc")}
                </label>
                <input
                  type="text"
                  value={settings.platformDescription}
                  onChange={(e) => setSettings({ ...settings, platformDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("currency")}
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="VND">VND (₫ - Vietnamese Dong)</option>
                  <option value="KRW">KRW (₩ - Korean Won)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("timezone")}
                </label>
                <input
                  type="text"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-purple-500" />
              <span>{t("maintenanceMode")}</span>
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="maintCheck"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="maintCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("maintenanceDesc")}
              </label>
            </div>

            {settings.maintenanceMode && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("maintenanceMessage")}
                </label>
                <textarea
                  rows={2}
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25"
            >
              {saving ? "Saving..." : t("saveSettings")}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY SETTINGS */}
      {activeTab === "security" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock size={18} className="text-purple-500" />
              <span>Authentication & Lockout Policies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("maxLoginAttempts")}
                </label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("lockoutDuration")}
                </label>
                <input
                  type="number"
                  min={5}
                  max={1440}
                  value={settings.lockoutDuration}
                  onChange={(e) => setSettings({ ...settings, lockoutDuration: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("sessionTimeout")}
                </label>
                <input
                  type="number"
                  min={15}
                  max={10080}
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="twoFactorCheck"
                checked={settings.enableTwoFactor}
                onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="twoFactorCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("enable2FA")}
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25"
            >
              {saving ? "Saving..." : t("saveSettings")}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: EMAIL SMTP SETTINGS & TEST EMAIL */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveEmail} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail size={18} className="text-blue-500" />
              <span>SMTP Server Gateway Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("smtpHost")}
                </label>
                <input
                  type="text"
                  value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("smtpPort")}
                </label>
                <input
                  type="number"
                  value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("smtpUser")}
                </label>
                <input
                  type="text"
                  value={emailConfig.smtpUser}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("smtpPassword")}
                </label>
                <input
                  type="password"
                  value={emailConfig.smtpPassword}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Save SMTP Config
              </button>
            </div>
          </form>

          {/* Test Email Dispatcher */}
          <form onSubmit={handleSendTestEmail} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send size={18} className="text-emerald-500" />
              <span>{t("sendTestEmail")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("testEmailRecipient")}
                </label>
                <input
                  type="email"
                  required
                  value={testEmailForm.to}
                  onChange={(e) => setTestEmailForm({ ...testEmailForm, to: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("testEmailSubject")}
                </label>
                <input
                  type="text"
                  required
                  value={testEmailForm.subject}
                  onChange={(e) => setTestEmailForm({ ...testEmailForm, subject: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={testingEmail}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <Send size={14} />
                <span>{testingEmail ? "Dispatching..." : t("sendTestEmail")}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
