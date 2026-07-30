import type { HsCode, RecordStatus, SiteValue } from "@/lib/data";

export function HsChip({ hs }: { hs: HsCode }) {
  // UI convention: never show a bare HS code - always code + description.
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-bluegrey-100 px-2.5 py-0.5 text-xs font-medium text-bluegrey-600">
      <span className="font-mono text-bluegrey-800">HS {hs.code}</span>
      <span className="text-bluegrey-400">·</span>
      {hs.description}
    </span>
  );
}

export function StatusPill({ status }: { status: RecordStatus | "confirmed-product" }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    confirmed: "bg-green-50 text-green-700 ring-green-200",
    "confirmed-product": "bg-green-50 text-green-700 ring-green-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
  };
  const labels: Record<string, string> = {
    pending: "Needs review",
    confirmed: "Confirmed",
    "confirmed-product": "Confirmed",
    rejected: "Rejected - not part of this product",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function MappedBadge({ mapped, supplierAdded }: { mapped: boolean; supplierAdded?: boolean }) {
  if (supplierAdded)
    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
        Added by you
      </span>
    );
  return mapped ? (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
      Mapped from trade data
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-bluegrey-100 px-2.5 py-0.5 text-xs font-medium text-bluegrey-500 ring-1 ring-inset ring-bluegrey-200">
      Unmapped - details required
    </span>
  );
}

export function siteLabel(site: SiteValue): string {
  if (site.kind === "known") return site.value;
  if (site.kind === "unknown") return "Confirmed unknown";
  return "Not provided";
}
