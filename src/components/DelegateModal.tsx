"use client";

import { useState } from "react";
import type { Delegation, LegalEntity } from "@/lib/data";

/**
 * Delegate - available throughout the questionnaire. Lets the tier 1 user:
 *  - assign response responsibility for specific products or components to
 *    another person in their organization, or
 *  - select other legal entities from the hierarchy to delegate to.
 */
export function DelegateModal({
  entities,
  currentEntityId,
  currentProductName,
  onClose,
  onDelegate,
}: {
  entities: LegalEntity[];
  currentEntityId?: string;
  currentProductName?: string;
  onClose: () => void;
  onDelegate: (d: Omit<Delegation, "id">) => void;
}) {
  const [mode, setMode] = useState<"person" | "entity">("person");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [scopeChoice, setScopeChoice] = useState<string>(currentProductName ?? "everything");
  const [entityIds, setEntityIds] = useState<string[]>([]);
  const [tried, setTried] = useState(false);

  const currentEntity = entities.find((e) => e.id === currentEntityId);
  const scopeOptions = [
    "everything",
    ...(currentEntity ? currentEntity.products.flatMap((p) => [p.name, `${p.name} - components only`]) : []),
  ];

  const submit = () => {
    if (mode === "person") {
      if (!name.trim() || !email.trim()) {
        setTried(true);
        return;
      }
      onDelegate({
        assignee: name.trim(),
        email: email.trim(),
        scope: scopeChoice === "everything" ? "Entire questionnaire" : scopeChoice,
      });
    } else {
      if (entityIds.length === 0) {
        setTried(true);
        return;
      }
      const names = entities.filter((e) => entityIds.includes(e.id)).map((e) => e.name);
      onDelegate({
        assignee: names.join(", "),
        email: "invitation will be sent",
        scope: "Their own legal entity sections",
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bluegrey-900/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-bluegrey-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-lg font-semibold text-bluegrey-900">Delegate</div>
        <p className="mb-4 text-sm text-bluegrey-500">
          Share parts of this questionnaire with someone better placed to answer.
        </p>

        <div className="mb-4 flex gap-1 rounded-xl bg-bluegrey-100 p-1">
          <button
            onClick={() => setMode("person")}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === "person" ? "bg-white text-bluegrey-900 shadow-sm" : "text-bluegrey-700"
            }`}
          >
            A person in my organization
          </button>
          <button
            onClick={() => setMode("entity")}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === "entity" ? "bg-white text-bluegrey-900 shadow-sm" : "text-bluegrey-700"
            }`}
          >
            Another legal entity
          </button>
        </div>

        {mode === "person" ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-bluegrey-700">
                What are you delegating?
              </label>
              <select
                className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-bluegrey-300 focus:ring-2 focus:ring-blue-500"
                value={scopeChoice}
                onChange={(e) => setScopeChoice(e.target.value)}
              >
                {scopeOptions.map((o) => (
                  <option key={o} value={o}>
                    {o === "everything" ? "Entire questionnaire" : o}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-bluegrey-700">Name</label>
                <input
                  className={`w-full rounded-lg border-0 px-3 py-2 text-sm shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-blue-500 ${
                    tried && !name.trim() ? "ring-red-300" : "ring-bluegrey-300"
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Colleague's name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-bluegrey-700">Email</label>
                <input
                  type="email"
                  className={`w-full rounded-lg border-0 px-3 py-2 text-sm shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-blue-500 ${
                    tried && !email.trim() ? "ring-red-300" : "ring-bluegrey-300"
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-700">
              Select legal entities from your hierarchy
            </p>
            {entities.map((e) => (
              <label
                key={e.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-inset transition ${
                  entityIds.includes(e.id) ? "bg-blue-50 ring-blue-300" : "bg-white ring-bluegrey-200 hover:bg-bluegrey-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-bluegrey-300 text-blue-600 focus:ring-blue-500"
                  checked={entityIds.includes(e.id)}
                  onChange={(ev) =>
                    setEntityIds((ids) => (ev.target.checked ? [...ids, e.id] : ids.filter((i) => i !== e.id)))
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-bluegrey-800">{e.name}</span>
                  <span className="block text-xs text-bluegrey-400">
                    {e.city}, {e.country}
                  </span>
                </span>
              </label>
            ))}
            {tried && entityIds.length === 0 && (
              <p className="text-xs text-red-600">Select at least one legal entity.</p>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-bluegrey-500 hover:text-bluegrey-700">
            Cancel
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Send delegation
          </button>
        </div>
      </div>
    </div>
  );
}
