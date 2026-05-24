"use client";

import { useState } from "react";
import type { AdoptionQuestion } from "@/lib/directus";
import type { SocialLink } from "@/lib/types";

const SOCIAL_ICONS: Record<string, string> = {
  facebook: "📘",
  instagram: "📸",
  twitter: "🐦",
  youtube: "▶️",
  tiktok: "🎵",
  linkedin: "💼",
  other: "🔗",
  default: "🔗",
};

// Default questions shown when no questions are configured in Directus
const DEFAULT_QUESTIONS: AdoptionQuestion[] = [
  {
    id: "name",
    question: "Imię i nazwisko",
    field_type: "text",
    options: [],
    required: true,
    order: 1,
    placeholder: "Jan Kowalski",
  },
  {
    id: "email",
    question: "Adres e-mail",
    field_type: "text",
    options: [],
    required: true,
    order: 2,
    placeholder: "jan@example.com",
  },
  {
    id: "phone",
    question: "Numer telefonu",
    field_type: "text",
    options: [],
    required: false,
    order: 3,
    placeholder: "+48 600 000 000",
  },
  {
    id: "living",
    question: "Gdzie mieszkasz?",
    field_type: "radio",
    options: [
      { label: "Dom z ogrodem", value: "house_garden" },
      { label: "Mieszkanie z balkonem", value: "apartment_balcony" },
      { label: "Mieszkanie bez balkonu", value: "apartment" },
    ],
    required: true,
    order: 4,
    placeholder: null,
  },
  {
    id: "other_animals",
    question: "Czy masz inne zwierzęta?",
    field_type: "multiselect",
    options: [
      { label: "Pies", value: "dog" },
      { label: "Inny kot", value: "cat" },
      { label: "Inne", value: "other" },
      { label: "Brak zwierząt", value: "none" },
    ],
    required: true,
    order: 5,
    placeholder: null,
  },
  {
    id: "experience",
    question: "Czy miałeś/aś wcześniej kota?",
    field_type: "radio",
    options: [
      { label: "Tak, mam doświadczenie", value: "yes" },
      { label: "Nie, to będzie mój pierwszy kot", value: "no" },
    ],
    required: true,
    order: 6,
    placeholder: null,
  },
  {
    id: "home_alone",
    question: "Ile godzin dziennie kot będzie sam w domu?",
    field_type: "radio",
    options: [
      { label: "Do 4 godzin", value: "0-4h" },
      { label: "4–8 godzin", value: "4-8h" },
      { label: "Powyżej 8 godzin", value: "8h+" },
    ],
    required: true,
    order: 7,
    placeholder: null,
  },
  {
    id: "about",
    question: "Dlaczego chcesz adoptować tego kota? Napisz coś o sobie.",
    field_type: "textarea",
    options: [],
    required: true,
    order: 8,
    placeholder: "Opowiedz nam o sobie i o tym, dlaczego chcesz adoptować...",
  },
];

interface Props {
  questions: AdoptionQuestion[];
  catName: string | null;
  catSlug: string | null;
  locale: string;
  socialLinks?: SocialLink[];
}

type Answers = Record<string, string | string[]>;

export function AdoptionForm({ questions, catName, locale, socialLinks = [] }: Props) {
  const activeQuestions = questions.length > 0 ? questions : DEFAULT_QUESTIONS;
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
    for (const q of activeQuestions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (!val || (Array.isArray(val) && val.length === 0) || val === "") {
        newErrors[q.id] = "To pole jest wymagane.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function generateText(): string {
    const lines: string[] = [];
    lines.push(catName
      ? `FORMULARZ ADOPCYJNY — ${catName.toUpperCase()}`
      : "FORMULARZ ADOPCYJNY");
    lines.push("=".repeat(40));
    lines.push("");

    for (const q of activeQuestions) {
      const ans = answers[q.id];
      const answerText = Array.isArray(ans)
        ? ans.map(v => {
            const opt = q.options.find(o => o.value === v);
            return opt ? opt.label : v;
          }).join(", ")
        : ans
          ? (q.field_type === "radio"
              ? (q.options.find(o => o.value === ans)?.label ?? ans)
              : String(ans))
          : "—";
      lines.push(`${q.question}`);
      lines.push(`→ ${answerText}`);
      lines.push("");
    }

    return lines.join("\n");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setResult(generateText());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyToClipboard() {
    if (!result) return;
    await navigator.clipboard?.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    const mailSubject = catName ? `Adopcja - ${catName}` : "Formularz adopcyjny";
    return (
      <div>
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 font-semibold mb-1">✅ Gotowe!</p>
          <p className="text-green-700 text-sm">
            Skopiuj poniższą wiadomość i wyślij ją do nas przez e-mail lub media społecznościowe.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap border border-gray-200 mb-4 max-h-80 overflow-y-auto">
          {result}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={copyToClipboard} className="btn-primary">
            {copied ? "✅ Skopiowano!" : "📋 Kopiuj wiadomość"}
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(result)}`}
            className="btn-secondary"
          >
            ✉️ Otwórz w e-mailu
          </a>
        </div>

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mb-6">
            <p className="font-semibold text-gray-800 mb-3">Wyślij wiadomość przez media społecznościowe:</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                >
                  <span>{link.icon || SOCIAL_ICONS[link.platform.toLowerCase()] || SOCIAL_ICONS.default}</span>
                  <span className="capitalize">{link.platform}</span>
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Skopiuj wiadomość i wklej ją w wiadomości prywatnej.
            </p>
          </div>
        )}

        <button
          onClick={() => { setResult(null); setAnswers({}); }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Wróć do formularza
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {catName && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm text-brand-800 font-medium">
          🐱 Formularz dla: <strong>{catName}</strong>
        </div>
      )}

      {activeQuestions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {q.question}
            {q.required && <span className="text-brand-700 ml-1">*</span>}
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
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => setAnswer(q.id, opt.value)}
                    className="accent-brand-700 w-4 h-4 shrink-0"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {q.field_type === "multiselect" && q.options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = ((answers[q.id] as string[]) ?? []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleMulti(q.id, opt.value)}
                    className={`badge cursor-pointer border transition ${
                      selected
                        ? "bg-brand-700 text-white border-brand-700"
                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-200"
                    }`}
                  >
                    {selected ? "✓ " : ""}{opt.label}
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

      <div className="pt-4 border-t border-gray-100">
        <button type="submit" className="btn-primary w-full justify-center py-4 text-base">
          Wygeneruj wiadomość →
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Formularz wygeneruje gotową wiadomość do skopiowania i wysłania do nas.
        </p>
      </div>
    </form>
  );
}
