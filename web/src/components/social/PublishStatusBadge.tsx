"use client";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-gray-100 text-gray-600" },
  SCHEDULED: { label: "Programmé", className: "bg-blue-50 text-blue-600" },
  PUBLISHING: { label: "En cours", className: "bg-yellow-50 text-yellow-600" },
  PUBLISHED: { label: "Publié", className: "bg-green-50 text-green-600" },
  FAILED: { label: "Échoué", className: "bg-red-50 text-red-600" },
};

export default function PublishStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}
