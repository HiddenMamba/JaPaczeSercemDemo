"use client";

import { useState } from "react";
import type { AdoptionQuestion } from "@/lib/directus";

interface Props {
  questions: AdoptionQuestion[];
  catName: string | null;
  catSlug: string | null;
  locale: string;
}

type Answers = Record<string, string | string[]>;

export function AdoptionForm({ questions, catName, locale }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const pl = locale === "pl";

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  }

  function toggleMulti(id: string, value: string) {
    const current = (answers[id] as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setAnswer(id, next);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    for (const q of questions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (!val || (Array.isArray(val) && val.length === 0) || val === "") {
        newErrors[q.id] = pl ? "To pole jest wymagane." : "This field is required.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function generateText(): string {
    const header = catName
      ? `${pl ? "Formularz adopcyjny — Kot" : "Adoption form — Cat"}: ${catName}\n${"=".repeat(40)}\n\n`
      : `${pl ? "Formularz adopcyjny" : "Adoption form"}\n${"=".repeat(40)}\n\n`;

    const body = questions
      .map((q) => {
        const ans = answers[q.id];
        const answerText = Array.isArray(ans) ? ans.join(", ") : (ans ?? "—");
        return `${q.question}\n→ ${answerText}`;
      })
      .join("\n\n");

    return header + body;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setResult(generateText());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyToClipboard() {
    if (result) navigator.clipboard?.writeText(result);
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (result) {
    return (
      <div>
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 font-medium text-sm">
            ✅ {pl
              ? "Gotowe! Skopiuj poniższą wiadomość i wyślij ją mailem lub przez media społecznościowe."
              : "Done! Copy the message below and send it by email or social media."}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap border border-gray-200 mb-4">
          {result}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={copyToClipboard} className="btn-primary">
            📋 {pl ? "Kopiuj wiadomość" : "Copy message"}
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent(catName ? `Adopcja - ${catName}` : "Formularz adopcyjny")}&body=${encodeURIComponent(result)}`}
            className="btn-secondary"
          >
            ✉️ {pl ? "Otwórz w e-mailu" : "Open in email"}
          </a>
        </div>

        <button
          onClick={() => setResult(null)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          {pl ? "← Wróć do formularza" : "← Back to form"}
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {q.question}
            {q.required && <span className="text-orange-500 ml-1">*</span>}
          </label>

          {q.field_type === "text" && (
            <input
              type="text"
              placeholder={q.placeholder ?? ""}
              value={(answers[q.id] as string) ?? ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              className="input"
            />
          )}

          {q.field_type === "textarea" && (
            <textarea
              rows={4}
              placeholder={q.placeholder ?? ""}
              value={(answers[q.id] as string) ?? ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              className="input resize-none"
            />
          )}

          {q.field_type === "radio" && q.options.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {q.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => setAnswer(q.id, opt.value)}
                    className="accent-orange-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {q.field_type === "multiselect" && q.options.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {q.options.map((opt) => {
                const selected = ((answers[q.id] as string[]) ?? []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleMulti(q.id, opt.value)}
                    className={`badge cursor-pointer border transition ${
                      selected
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {errors[q.id] && (
            <p className="text-red-500 text-xs mt-1">{errors[q.id]}</p>
          )}
        </div>
      ))}

      <div className="pt-4">
        <button type="submit" className="btn-primary w-full justify-center py-4">
          {pl ? "Wygeneruj wiadomość →" : "Generate message →"}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          {pl
            ? "Formularz nie wysyła danych automatycznie — wygenerujesz gotową wiadomość do skopiowania."
            : "This form doesn't send data automatically — you'll get a ready-to-copy message."}
        </p>
      </div>
    </form>
  );
}
