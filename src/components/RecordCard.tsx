"use client";

import { useState } from "react";
import type { RecordFields, SiteValue } from "@/lib/data";
import { missingMandatory } from "@/lib/data";
import { siteLabel } from "./ui";

/**
 * The shared confirm box. The tier 1 product carries the same fields as a
 * component; behavior differences are driven by props:
 *  - Product level: Confirm + Edit only (no Reject).
 *  - Component level: Confirm + Edit + Reject.
 */
export function RecordCard({
  fields,
  locked,
  startInEdit,
  onSave,
  onConfirm,
  onReject,
  mpnPrepopulated,
  allowUnknownSite = true,
}: {
  fields: RecordFields;
  locked: boolean; // already confirmed → read-only summary
  startInEdit?: boolean; // unmapped/added components open straight into the form
  onSave: (f: RecordFields) => void;
  onConfirm: (f: RecordFields) => void;
  onReject?: () => void;
  mpnPrepopulated: boolean;
  /** Components may confirm the site as unknown; the tier 1 product may not. */
  allowUnknownSite?: boolean;
}) {
  // If mandatory data is missing, a read-only summary is a dead end - the user
  // can't type into it. Open straight into the form so the gaps are fillable.
  const [autoEdit] = useState(!!startInEdit || missingMandatory(fields, allowUnknownSite).length > 0);
  const [editing, setEditing] = useState(autoEdit && !locked);
  const [draft, setDraft] = useState<RecordFields>(fields);
  const [tried, setTried] = useState(false);

  const current = editing ? draft : fields;
  const missing = missingMandatory(current, allowUnknownSite);
  const canConfirm = missing.length === 0;

  const set = (patch: Partial<RecordFields>) => setDraft((d) => ({ ...d, ...patch }));

  const confirm = () => {
    if (!canConfirm) {
      setTried(true);
      if (!editing) {
        setDraft(fields);
        setEditing(true);
      }
      return;
    }
    onConfirm(current);
    setEditing(false);
    setTried(false);
  };

  // Confirmed records stay editable: Edit reopens the form; Confirm re-saves.
  if (locked && !editing) {
    return (
      <div>
        <ReadOnlyGrid fields={fields} />
        <div className="mt-4">
          <button
            onClick={() => {
              setDraft(fields);
              setEditing(true);
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-bluegrey-700 shadow-sm ring-1 ring-inset ring-bluegrey-300 hover:bg-bluegrey-50"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {editing ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Field label="MPN (Manufacturer's Part Number)" required missing={tried && !draft.mpn.trim()}>
            <input className={inputCls} value={draft.mpn} onChange={(e) => set({ mpn: e.target.value })} placeholder="e.g. TCI-8-D40" />
          </Field>
          <Field label="MPN description" required missing={tried && !draft.mpnDescription.trim()}>
            <input className={inputCls} value={draft.mpnDescription} onChange={(e) => set({ mpnDescription: e.target.value })} placeholder="Manufacturer's part description" />
          </Field>
          <div className="sm:col-span-2">
            <SiteField
              value={draft.site}
              onChange={(site) => set({ site })}
              missing={tried && draft.site.kind !== "known" && (allowUnknownSite ? draft.site.kind === "empty" : true)}
              allowUnknown={allowUnknownSite}
            />
          </div>
          <Field label="Company name" required missing={tried && !draft.companyName.trim()}>
            <input className={inputCls} value={draft.companyName} onChange={(e) => set({ companyName: e.target.value })} />
          </Field>
          <Field label="Contact name" required missing={tried && !draft.contactName.trim()}>
            <input className={inputCls} value={draft.contactName} onChange={(e) => set({ contactName: e.target.value })} />
          </Field>
          <Field
            label="Contact email"
            required
            hint="Needed to cascade questionnaires to Tier 2"
            missing={tried && !draft.contactEmail.trim()}
          >
            <input type="email" className={inputCls} value={draft.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} placeholder="name@company.com" />
          </Field>
          <Field label="Expected volume">
            <input className={inputCls} value={draft.expectedVolume} onChange={(e) => set({ expectedVolume: e.target.value })} placeholder="e.g. 1,200 units / yr" />
          </Field>
          <Field label="Contract start date">
            <input type="date" className={inputCls} value={draft.contractStart} onChange={(e) => set({ contractStart: e.target.value })} />
          </Field>
          <Field label="Contract end date">
            <input type="date" className={inputCls} value={draft.contractEnd} onChange={(e) => set({ contractEnd: e.target.value })} />
          </Field>
        </div>
      ) : (
        <ReadOnlyGrid fields={fields} highlightGaps />
      )}

      {tried && !canConfirm && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          <span className="font-semibold">Still required:</span> {missing.join(", ")}
        </div>
      )}

      {locked && editing ? (
        /* Already confirmed: no re-Confirm - just Save changes (validated) and Cancel. */
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={confirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
              canConfirm ? "bg-blue-600 hover:bg-blue-500" : "bg-bluegrey-300 hover:bg-bluegrey-400"
            }`}
          >
            Save changes
          </button>
          <button
            onClick={() => {
              setDraft(fields);
              setEditing(false);
              setTried(false);
            }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-bluegrey-500 hover:text-bluegrey-700"
          >
            Cancel
          </button>
          {!canConfirm && !tried && (
            <span className="text-xs text-bluegrey-400">
              Required fields marked <span className="font-semibold text-red-500">*</span> must stay filled
            </span>
          )}
        </div>
      ) : (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={confirm}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
            canConfirm ? "bg-green-600 hover:bg-green-500" : "bg-bluegrey-300 hover:bg-bluegrey-400"
          }`}
        >
          Confirm
        </button>
        {editing ? (
          <>
            <button
              onClick={() => {
                onSave(draft);
                setEditing(false);
              }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-bluegrey-700 shadow-sm ring-1 ring-inset ring-bluegrey-300 hover:bg-bluegrey-50"
            >
              Save changes
            </button>
            {(!autoEdit || locked) && (
              <button
                onClick={() => {
                  setDraft(fields);
                  setEditing(false);
                  setTried(false);
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-bluegrey-500 hover:text-bluegrey-700"
              >
                Cancel
              </button>
            )}
            {!canConfirm && !tried && (
              <span className="text-xs text-bluegrey-400">
                Fill the required fields marked <span className="font-semibold text-red-500">*</span> to enable Confirm
              </span>
            )}
          </>
        ) : (
          <button
            onClick={() => {
              setDraft(fields);
              setEditing(true);
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-bluegrey-700 shadow-sm ring-1 ring-inset ring-bluegrey-300 hover:bg-bluegrey-50"
          >
            Edit
          </button>
        )}
        {onReject && (
          <button
            onClick={onReject}
            className="ml-auto rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
            title="This component does not belong to the product"
          >
            Reject
          </button>
        )}
      </div>
      )}
      {!mpnPrepopulated && !editing && !fields.mpn && (
        <p className="mt-2 text-xs text-bluegrey-400">MPN is never prepopulated for components - click Edit to enter it.</p>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border-0 bg-white px-3 py-1.5 text-sm text-bluegrey-900 shadow-sm ring-1 ring-inset ring-bluegrey-300 placeholder:text-bluegrey-300 focus:ring-2 focus:ring-inset focus:ring-blue-500";

function Field({
  label,
  required,
  hint,
  missing,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${missing ? "text-red-600" : "text-bluegrey-700"}`}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-bluegrey-400">{hint}</span>}
    </label>
  );
}

/**
 * Site / Facility. For components: fill in, or explicitly confirm unknown -
 * never skippable silently. For the tier 1 product (allowUnknown=false) the
 * "I don't know" escape hatch is removed: a manufacturer knows its own sites.
 */
function SiteField({
  value,
  onChange,
  missing,
  allowUnknown,
}: {
  value: SiteValue;
  onChange: (v: SiteValue) => void;
  missing?: boolean;
  allowUnknown: boolean;
}) {
  return (
    <div>
      <span className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${missing ? "text-red-600" : "text-bluegrey-700"}`}>
        Site / Facility - where it is made <span className="text-red-500">*</span>
      </span>
      <div className="grid grid-cols-1 items-center gap-x-6 gap-y-2 sm:grid-cols-2">
        <input
          className={`${inputCls} ${value.kind === "unknown" ? "opacity-40" : ""}`}
          disabled={value.kind === "unknown"}
          value={value.kind === "known" ? value.value : ""}
          onChange={(e) => onChange(e.target.value ? { kind: "known", value: e.target.value } : { kind: "empty" })}
          placeholder="Plant / facility name, city, country"
        />
        {allowUnknown && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bluegrey-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-bluegrey-300 text-blue-600 focus:ring-blue-500"
              checked={value.kind === "unknown"}
              onChange={(e) => onChange(e.target.checked ? { kind: "unknown" } : { kind: "empty" })}
            />
            I don&apos;t know the site
          </label>
        )}
      </div>
      <span className="mt-1 block text-xs text-bluegrey-400">
        {allowUnknown
          ? "Fill in the site or confirm you don't know - this cannot be skipped."
          : "Enter the plant or facility where this product is made."}
      </span>
    </div>
  );
}

function ReadOnlyGrid({ fields, highlightGaps }: { fields: RecordFields; highlightGaps?: boolean }) {
  const rows: Array<[string, string, boolean?]> = [
    ["MPN", fields.mpn || "-", highlightGaps && !fields.mpn],
    ["MPN description", fields.mpnDescription || "-", highlightGaps && !fields.mpnDescription],
    ["Site / Facility", siteLabel(fields.site), highlightGaps && fields.site.kind === "empty"],
    ["Company name", fields.companyName || "-", highlightGaps && !fields.companyName],
    ["Contact name", fields.contactName || "-", highlightGaps && !fields.contactName],
    ["Contact email", fields.contactEmail || "-", highlightGaps && !fields.contactEmail],
    ["Contract start", fields.contractStart || "-"],
    ["Contract end", fields.contractEnd || "-"],
    ["Expected volume", fields.expectedVolume || "-"],
  ];
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-3">
      {rows.map(([label, value, gap]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-bluegrey-600">{label}</dt>
          <dd className={`text-sm ${gap ? "font-medium text-red-500" : "text-bluegrey-800"}`}>
            {gap ? "Required" : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
