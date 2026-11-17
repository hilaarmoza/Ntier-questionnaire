"use client";

import { recordSource, type LegalEntity, type RecordSource } from "@/lib/data";
import { componentTitle, siteLabel } from "./ui";

/** Products and active components in this entity that are not confirmed yet. */
export function entityOutstanding(entity: LegalEntity): number {
  return entity.products.reduce(
    (n, p) =>
      n + (p.confirmed ? 0 : 1) + p.components.filter((c) => c.status === "pending").length,
    0,
  );
}

/* Status is coloured text with a dot, not a pill. Untouched Sayari data the
   vendor confirmed reads simply as "Confirmed". */
type ReviewStatus = RecordSource | "rejected" | "pending";

function StatusText({ status }: { status: ReviewStatus }) {
  const styles: Record<ReviewStatus, { label: string; text: string; dot: string }> = {
    sayari: { label: "Confirmed", text: "text-green-700", dot: "bg-green-500" },
    "vendor-edited": { label: "Edited by vendor", text: "text-blue-700", dot: "bg-blue-500" },
    "vendor-added": { label: "Added by vendor", text: "text-violet-700", dot: "bg-violet-500" },
    rejected: { label: "Rejected by vendor", text: "text-red-700", dot: "bg-red-500" },
    pending: { label: "Not confirmed", text: "text-yellow-700", dot: "bg-yellow-400" },
  };
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ---------------- Step 7: review one legal entity's questionnaire, then submit ---------------- */

export function ReviewScreen({
  buyer,
  entity,
  submitted,
  nextEntity,
  onBack,
  onEditProduct,
  onOpenEntity,
  onSubmit,
}: {
  buyer: string;
  entity: LegalEntity;
  submitted: boolean;
  nextEntity?: LegalEntity;
  onBack: () => void;
  onEditProduct: (productId: string) => void;
  onOpenEntity: (entityId: string) => void;
  onSubmit: () => void;
}) {
  const outstanding = entityOutstanding(entity);
  const components = entity.products.flatMap((p) => p.components.filter((c) => c.status !== "rejected"));
  const sources = [
    ...entity.products.map((p) => recordSource(p.id, p.fields)),
    ...components.map((c) => recordSource(c.id, c.fields, c.supplierAdded)),
  ];
  const edited = sources.filter((s) => s === "vendor-edited").length;
  const added = sources.filter((s) => s === "vendor-added").length;

  return (
    <div className="mx-auto max-w-4xl">
      {submitted ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-green-50 p-5 ring-1 ring-green-200">
          <div className="text-sm">
            <div className="font-semibold text-green-800">✓ Questionnaire submitted to {buyer}</div>
            <div className="text-green-700">
              {entity.name} is done. Nothing else is needed for this legal entity.
            </div>
          </div>
          {nextEntity && (
            <button
              onClick={() => onOpenEntity(nextEntity.id)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Next questionnaire: {nextEntity.name} →
            </button>
          )}
        </div>
      ) : (
        <button onClick={onBack} className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ← Back to questionnaire
        </button>
      )}

      <h1 className="mt-1 text-xl font-bold tracking-tight text-bluegrey-900">
        {submitted ? "Submitted questionnaire" : "Review and submit"}
      </h1>
      <p className="mt-1 text-sm text-bluegrey-500">
        {entity.name} · {entity.products.length} product{entity.products.length > 1 ? "s" : ""}, {components.length}{" "}
        tier 2 components. Everything was pre-filled by Sayari
        {edited + added > 0
          ? `, except ${[edited && `${edited} edited`, added && `${added} added`].filter(Boolean).join(" and ")} by you.`
          : " and you kept it as is."}
      </p>

      <div className="mt-6 space-y-4">
        {entity.products.map((product) => (
          <section key={product.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-bluegrey-200">
            <div className="flex flex-wrap items-start gap-x-4 gap-y-1 px-5 pt-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-bluegrey-900">{product.name}</h2>
                <div className="mt-0.5 text-xs text-bluegrey-400">
                  HS {product.hs.code} {product.hs.description} · MPN {product.fields.mpn} · Site:{" "}
                  {siteLabel(product.fields.site)}
                </div>
              </div>
              <div className="flex items-center gap-4 whitespace-nowrap text-sm">
                <StatusText status={product.confirmed ? recordSource(product.id, product.fields) : "pending"} />
                {!submitted && (
                  <button
                    onClick={() => onEditProduct(product.id)}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-y border-bluegrey-100 bg-bluegrey-50/60 text-xs text-bluegrey-500">
                  <th className="py-2 pl-5 pr-3 font-semibold">Tier 2 component</th>
                  <th className="px-3 py-2 font-semibold">Supplier</th>
                  <th className="hidden px-3 py-2 font-semibold lg:table-cell">Site</th>
                  <th className="py-2 pl-3 pr-5 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bluegrey-100">
                {product.components.map((c) => {
                  const rejected = c.status === "rejected";
                  return (
                    <tr key={c.id} className={rejected ? "text-bluegrey-400" : "text-bluegrey-700"}>
                      <td className={`py-2.5 pl-5 pr-3 font-medium ${rejected ? "line-through" : "text-bluegrey-900"}`}>
                        {componentTitle(c)}
                      </td>
                      <td className="px-3 py-2.5">{c.fields.companyName || "-"}</td>
                      <td className="hidden px-3 py-2.5 lg:table-cell">{siteLabel(c.fields.site)}</td>
                      <td className="whitespace-nowrap py-2.5 pl-3 pr-5 text-right">
                        <StatusText
                          status={
                            c.status === "confirmed" ? recordSource(c.id, c.fields, c.supplierAdded) : c.status
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}
      </div>

      {!submitted && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-bluegrey-200">
          <span className="text-sm text-bluegrey-500">
            {outstanding > 0
              ? `${outstanding} item${outstanding > 1 ? "s" : ""} still to confirm before you can submit.`
              : `Submitting sends the ${entity.name} questionnaire to ${buyer}. Other legal entities are submitted separately.`}
          </span>
          <button
            onClick={onSubmit}
            disabled={outstanding > 0}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-bluegrey-300"
          >
            Submit questionnaire
          </button>
        </div>
      )}
    </div>
  );
}
