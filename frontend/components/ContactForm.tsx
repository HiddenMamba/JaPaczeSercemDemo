"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-green-800 font-medium">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label={t("name")} required>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input"
            placeholder="Jane Smith"
          />
        </Field>
        <Field label={t("email")} required>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="input"
            placeholder="jane@example.com"
          />
        </Field>
      </div>

      <Field label={t("subject")} required>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          className="input"
          placeholder="Adoption inquiry"
        />
      </Field>

      <Field label={t("message")} required>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="input resize-none"
          placeholder="Tell us about yourself and which cat you're interested in…"
        />
      </Field>

      {status === "error" && (
        <p className="text-red-600 text-sm">{t("error")}</p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center">
        {status === "sending" ? t("sending") : t("send")}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      {children}
    </div>
  );
}
