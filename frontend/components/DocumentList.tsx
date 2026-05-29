import { useTranslations } from "next-intl";

interface DocumentItem {
  id: string;
  name: string;
  category: "financial" | "adoption" | "other";
  file: { filename_download: string; filesize: number; type: string };
  downloadUrl: string;
}

interface Props {
  documents: DocumentItem[];
}

const CATEGORY_ORDER = ["financial", "adoption", "other"] as const;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_ICON: Record<string, string> = {
  "application/pdf": "📄",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📝",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  default: "📎",
};

export function DocumentList({ documents }: Props) {
  const t = useTranslations("about");

  const grouped = CATEGORY_ORDER.reduce<Record<string, DocumentItem[]>>((acc, cat) => {
    const items = documents.filter((d) => d.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t(`category_${cat}` as "category_financial" | "category_adoption" | "category_other")}
          </h3>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {items.map((doc) => (
              <a
                key={doc.id}
                href={doc.downloadUrl}
                download={doc.file.filename_download}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-4 py-3 bg-white transition group doc-list-row"
              >
                <span className="text-2xl shrink-0">
                  {FILE_ICON[doc.file.type] ?? FILE_ICON.default}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-400">{formatSize(doc.file.filesize)}</p>
                </div>
                <span className="btn-secondary py-1.5 px-3 text-xs shrink-0">
                  {t("download")} ↓
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
