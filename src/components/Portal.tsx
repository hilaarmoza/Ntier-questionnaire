"use client";

import { useState } from "react";
import {
  seedFamily,
  emptyFields,
  type ComponentRecord,
  type Delegation,
  type LegalEntity,
  type Product,
  type RecordFields,
  type SupplierFamily,
} from "@/lib/data";
import { RecordCard } from "./RecordCard";
import { DelegateModal } from "./DelegateModal";
import { HsChip, MappedBadge, StatusPill, siteLabel } from "./ui";

export default function Portal() {
  const [family, setFamily] = useState<SupplierFamily>(seedFamily);
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selectedEntity = family.entities.find((e) => e.id === selectedEntityId);
  const expandedProduct = selectedEntity?.products.find((p) => p.id === expandedProductId);

  const updateProduct = (productId: string, fn: (p: Product) => Product) =>
    setFamily((f) => ({
      ...f,
      entities: f.entities.map((e) => ({
        ...e,
        products: e.products.map((p) => (p.id !== productId ? p : fn(p))),
      })),
    }));

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const selectEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
    setExpandedProductId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProduct = (productId: string) => {
    setExpandedProductId(productId);
    setTimeout(() => {
      document.getElementById(`product-${productId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const scrollToComponent = (componentId: string) => {
    document.getElementById(`component-${componentId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-bluegrey-50">
        <main className="mx-auto max-w-5xl px-6 py-8">
          <InviteScreen family={family} onLogin={() => setLoggedIn(true)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bluegrey-50">
      <header className="sticky top-0 z-40 border-b border-bluegrey-200 bg-white/90 backdrop-blur">
        <div className="flex items-center gap-4 px-6 py-3">
          <button
            onClick={() => {
              setSelectedEntityId(null);
              setExpandedProductId(null);
            }}
            className="flex items-center gap-2.5"
          >
            <Logo />
            <span className="text-sm font-semibold text-bluegrey-800">{family.buyer} Supplier Questionnaire</span>
          </button>
          <div className="ml-auto flex items-center gap-3">
            {delegations.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                {delegations.length} delegation{delegations.length > 1 ? "s" : ""} sent
              </span>
            )}
            {/* Delegate is an option, not a step: available throughout the questionnaire. */}
            <button
              onClick={() => setDelegateOpen(true)}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Delegate
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar
          family={family}
          selectedEntityId={selectedEntityId}
          expandedProductId={expandedProductId}
          onSelectEntity={selectEntity}
          onSelectProduct={openProduct}
          onSelectComponent={scrollToComponent}
        />

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
          {selectedEntity ? (
            <div className="mx-auto max-w-4xl">
              <div className="mb-4">
                <button
                  onClick={() => {
                    setSelectedEntityId(null);
                    setExpandedProductId(null);
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  ← All legal entities
                </button>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-bluegrey-900">{selectedEntity.name}</h1>
                <p className="text-sm text-bluegrey-400">
                  {selectedEntity.city}, {selectedEntity.country} · {selectedEntity.products.length} product
                  {selectedEntity.products.length > 1 ? "s" : ""} sold to {family.buyer}. Select a product to review
                  and confirm it.
                </p>
              </div>
              <div className="space-y-3">
                {selectedEntity.products.map((product) => (
                  <ProductAccordion
                    key={product.id}
                    product={product}
                    expanded={expandedProductId === product.id}
                    onToggle={() =>
                      expandedProductId === product.id ? setExpandedProductId(null) : openProduct(product.id)
                    }
                    onUpdate={(fn) => updateProduct(product.id, fn)}
                    onFlash={flash}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EntityPicker family={family} onSelect={selectEntity} />
          )}
        </main>
      </div>

      {delegateOpen && (
        <DelegateModal
          entities={family.entities}
          currentEntityId={selectedEntity?.id}
          currentProductName={expandedProduct?.name}
          onClose={() => setDelegateOpen(false)}
          onDelegate={(d) => {
            setDelegations((ds) => [...ds, { ...d, id: `d-${ds.length + 1}` }]);
            flash(`Delegated “${d.scope}” to ${d.assignee}`);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-bluegrey-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
      SQ
    </span>
  );
}

/* ---------------- Status helpers ---------------- */

function productState(p: Product): "done" | "in-progress" | "todo" {
  const active = p.components.filter((c) => c.status !== "rejected");
  const confirmed = active.filter((c) => c.status === "confirmed").length;
  if (p.confirmed && confirmed === active.length) return "done";
  if (p.confirmed) return "in-progress";
  return "todo";
}

function entityState(e: LegalEntity): "done" | "in-progress" | "todo" {
  const states = e.products.map(productState);
  if (states.every((s) => s === "done")) return "done";
  if (states.some((s) => s !== "todo")) return "in-progress";
  return "todo";
}

function StateDot({ state }: { state: "done" | "in-progress" | "todo" }) {
  const cls = state === "done" ? "bg-green-500" : state === "in-progress" ? "bg-yellow-400" : "bg-bluegrey-300";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${cls}`} />;
}

function componentDot(c: ComponentRecord) {
  const cls =
    c.status === "confirmed" ? "bg-green-500" : c.status === "rejected" ? "bg-red-400" : "bg-bluegrey-300";
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cls}`} />;
}

function productSubline(p: Product): string {
  const active = p.components.filter((c) => c.status !== "rejected");
  const confirmed = active.filter((c) => c.status === "confirmed").length;
  if (!p.confirmed) return "Product not confirmed";
  return `${confirmed}/${active.length} components confirmed`;
}

/* ----------------------------------------------------------------
   Left sidebar - a staged tree that mirrors where you are:
   entities always; products only under the selected entity;
   components only under the expanded product.
----------------------------------------------------------------- */

function Sidebar({
  family,
  selectedEntityId,
  expandedProductId,
  onSelectEntity,
  onSelectProduct,
  onSelectComponent,
}: {
  family: SupplierFamily;
  selectedEntityId: string | null;
  expandedProductId: string | null;
  onSelectEntity: (id: string) => void;
  onSelectProduct: (id: string) => void;
  onSelectComponent: (id: string) => void;
}) {
  const allProducts = family.entities.flatMap((e) => e.products);
  const doneCount = allProducts.filter((p) => productState(p) === "done").length;

  return (
    <aside className="sticky top-[53px] hidden h-[calc(100vh-53px)] w-72 shrink-0 flex-col overflow-y-auto border-r border-bluegrey-200 bg-white px-4 py-5 md:flex">
      <div className="mb-4 px-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-bluegrey-600">Supplier family</div>
        <div className="mt-0.5 text-sm font-semibold text-bluegrey-800">{family.name}</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bluegrey-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${allProducts.length ? (doneCount / allProducts.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-bluegrey-400">
            {doneCount}/{allProducts.length}
          </span>
        </div>
      </div>

      <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-bluegrey-600">Legal entities</div>
      <nav className="space-y-1">
        {family.entities.map((entity) => {
          const isSelected = entity.id === selectedEntityId;
          return (
            <div key={entity.id}>
              <button
                onClick={() => onSelectEntity(entity.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-bluegrey-100 font-semibold text-bluegrey-900"
                    : "text-bluegrey-600 hover:bg-bluegrey-50 hover:text-bluegrey-900"
                }`}
                title={entity.name}
              >
                <StateDot state={entityState(entity)} />
                <span className="min-w-0 flex-1 truncate">{entity.name}</span>
                <Chevron open={isSelected} small />
              </button>

              {/* Products appear only once their entity is selected. */}
              {isSelected && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-bluegrey-200 pl-2">
                  {entity.products.map((p) => {
                    const isOpen = expandedProductId === p.id;
                    return (
                      <div key={p.id}>
                        <button
                          onClick={() => onSelectProduct(p.id)}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                            isOpen
                              ? "bg-blue-50 font-semibold text-blue-800"
                              : "text-bluegrey-600 hover:bg-bluegrey-50 hover:text-bluegrey-900"
                          }`}
                        >
                          <StateDot state={productState(p)} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{p.name}</span>
                            <span
                              className={`block truncate text-xs font-normal ${
                                isOpen ? "text-blue-500" : "text-bluegrey-400"
                              }`}
                            >
                              {productSubline(p)}
                            </span>
                          </span>
                        </button>

                        {/* Components appear only once their product is open. */}
                        {isOpen && p.confirmed && (
                          <div className="ml-3 mt-0.5 space-y-0.5 border-l border-blue-100 pl-2">
                            {p.components.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => onSelectComponent(c.id)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-bluegrey-500 hover:bg-bluegrey-50 hover:text-bluegrey-800"
                              >
                                {componentDot(c)}
                                <span className={`truncate ${c.status === "rejected" ? "line-through" : ""}`}>
                                  {c.fields.mpnDescription ||
                                    c.fields.mpn ||
                                    (c.supplierAdded ? "New component" : c.hs?.description || "Mapped component")}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        {isOpen && !p.confirmed && (
                          <div className="ml-5 py-1 text-xs italic text-bluegrey-400">
                            Confirm the product to see components
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pt-6 text-xs leading-5 text-bluegrey-400">
        <span className="mb-1 flex items-center gap-2">
          <StateDot state="todo" /> Needs review
        </span>
        <span className="mb-1 flex items-center gap-2">
          <StateDot state="in-progress" /> In progress
        </span>
        <span className="flex items-center gap-2">
          <StateDot state="done" /> Complete
        </span>
      </div>
    </aside>
  );
}

/* ---------------- Step 1: Invitation and login ---------------- */

function InviteScreen({ family, onLogin }: { family: SupplierFamily; onLogin: () => void }) {
  return (
    <div className="mx-auto mt-10 max-w-xl">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-bluegrey-200">
        <div className="mb-6 flex items-center gap-3">
          <Logo />
          <span className="text-sm font-semibold text-bluegrey-500">Supplier Questionnaire</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-bluegrey-900">
          {family.buyer} has invited {family.name} to map its supply chain
        </h1>
        <p className="mt-3 text-sm leading-6 text-bluegrey-500">
          This single invitation covers <span className="font-semibold text-bluegrey-700">all legal entities</span>
          {" in your supplier family. "}
          You&apos;ll confirm the products each entity sells to {family.buyer} and the tier 2 components inside
          them - or delegate sections to the right people in your organization.
        </p>
        <div className="mt-6 rounded-xl bg-bluegrey-50 p-4 ring-1 ring-inset ring-bluegrey-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-bluegrey-600">Signed in as</div>
          <div className="mt-1 text-sm font-medium text-bluegrey-800">
            {family.respondent.name} · {family.respondent.email}
          </div>
          <div className="text-xs text-bluegrey-400">{family.name} - family-level respondent</div>
        </div>
        <button
          onClick={onLogin}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
        >
          Open questionnaire
        </button>
        <p className="mt-3 text-center text-xs text-bluegrey-400">Demo prototype - no real authentication.</p>
      </div>
    </div>
  );
}

/* ---------------- Step 2: pick a legal entity ---------------- */

function EntityPicker({ family, onSelect }: { family: SupplierFamily; onSelect: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-bold tracking-tight text-bluegrey-900">Select a legal entity to begin</h1>
      <p className="mt-1 text-sm text-bluegrey-500">
        These are the legal entities in the {family.name} family that you are responsible for representing. Pick one
        to review the products it sells to {family.buyer}.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {family.entities.map((e) => {
          const total = e.products.length;
          const done = e.products.filter((p) => productState(p) === "done").length;
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              className="group rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-bluegrey-200 transition hover:shadow-md hover:ring-blue-300"
            >
              <div className="flex items-center gap-2.5">
                <StateDot state={entityState(e)} />
                <span className="text-base font-semibold text-bluegrey-900 group-hover:text-blue-700">{e.name}</span>
              </div>
              <div className="mt-0.5 text-sm text-bluegrey-400">
                {e.city}, {e.country}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-bluegrey-500">
                  {total} product{total > 1 ? "s" : ""} sold to {family.buyer}
                </span>
                <span className={`font-medium ${done === total ? "text-green-600" : "text-yellow-600"}`}>
                  {done}/{total} complete
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Product accordion: expands in place ---------------- */

function ProductAccordion({
  product,
  expanded,
  onToggle,
  onUpdate,
  onFlash,
}: {
  product: Product;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (fn: (p: Product) => Product) => void;
  onFlash: (msg: string) => void;
}) {
  const comps = product.components.filter((c) => c.status !== "rejected");
  const confirmedComps = comps.filter((c) => c.status === "confirmed").length;

  return (
    <div
      id={`product-${product.id}`}
      className={`scroll-mt-20 rounded-2xl bg-white shadow-sm ring-1 transition ${
        expanded ? "ring-blue-300" : "ring-bluegrey-200 hover:ring-blue-200"
      }`}
    >
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-5 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-bluegrey-900">{product.name}</span>
            <HsChip hs={product.hs} />
          </div>
          <div className="mt-1 truncate text-sm text-bluegrey-400">
            {product.fields.mpn} · {product.fields.mpnDescription}
          </div>
        </div>
        <div className="shrink-0 text-right text-sm">
          {product.confirmed ? <StatusPill status="confirmed-product" /> : <StatusPill status="pending" />}
          <div className="mt-1 text-xs text-bluegrey-400">
            {product.confirmed ? `${confirmedComps}/${comps.length} components confirmed` : "Product not yet confirmed"}
          </div>
        </div>
        <Chevron open={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-bluegrey-100 p-5 pt-4">
          <ProductDetail product={product} onUpdate={onUpdate} onFlash={onFlash} />
        </div>
      )}
    </div>
  );
}

function Chevron({ open, small }: { open: boolean; small?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`${small ? "h-4 w-4" : "h-5 w-5"} shrink-0 text-bluegrey-400 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ---------------- Steps 3–6: product confirm box, components, add ---------------- */

function ProductDetail({
  product,
  onUpdate,
  onFlash,
}: {
  product: Product;
  onUpdate: (fn: (p: Product) => Product) => void;
  onFlash: (msg: string) => void;
}) {
  const activeComponents = product.components.filter((c) => c.status !== "rejected");
  const rejectedComponents = product.components.filter((c) => c.status === "rejected");
  const confirmedCount = activeComponents.filter((c) => c.status === "confirmed").length;

  const setComponent = (id: string, fn: (c: ComponentRecord) => ComponentRecord) =>
    onUpdate((p) => ({ ...p, components: p.components.map((c) => (c.id === id ? fn(c) : c)) }));

  /* Step 6: Add component - appends a real "New component" card immediately.
     It stays "New component" until the supplier names it, and can be discarded
     until it is confirmed. */
  const addComponent = () => {
    const newId = `c-new-${Date.now()}`;
    onUpdate((p) => ({
      ...p,
      components: [
        ...p.components,
        { id: newId, mapped: false, supplierAdded: true, fields: emptyFields(), status: "pending" },
      ],
    }));
    onFlash("New component added - name it and fill in its details");
    setTimeout(() => {
      document.getElementById(`component-${newId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  const removeComponent = (id: string) =>
    onUpdate((p) => ({ ...p, components: p.components.filter((c) => c.id !== id) }));

  return (
    <div className="space-y-6">
      {/* Step 3: product confirmation - Confirm and Edit only, no Reject.
          After confirmation the record stays editable. */}
      <section>
        <p className="max-w-2xl text-sm leading-6 text-bluegrey-500">{product.blurb}</p>
        <div className="mt-4">
          {!product.confirmed && (
            <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 ring-1 ring-inset ring-blue-100">
              Review this product&apos;s details, fill in anything missing, and confirm - confirming unlocks the
              component list below.
            </p>
          )}
          <RecordCard
            fields={product.fields}
            locked={product.confirmed}
            mpnPrepopulated
            allowUnknownSite={false}
            onSave={(f) => onUpdate((p) => ({ ...p, fields: f }))}
            onConfirm={(f) => {
              const wasConfirmed = product.confirmed;
              onUpdate((p) => ({ ...p, fields: f, confirmed: true }));
              onFlash(wasConfirmed ? "Product updated" : "Product confirmed - component list unlocked");
            }}
          />
        </div>
      </section>

      {/* Step 4–6: component list appears only after product confirmation. */}
      {product.confirmed ? (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold tracking-tight text-bluegrey-900">Tier 2 components</h3>
              <p className="text-sm text-bluegrey-500">
                {confirmedCount}/{activeComponents.length} confirmed
                {rejectedComponents.length > 0 && ` · ${rejectedComponents.length} rejected`}
              </p>
            </div>
            <button
              onClick={addComponent}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-inset ring-blue-200 hover:bg-blue-50"
            >
              + Add component
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {product.components.map((c) => (
              <ComponentCard
                key={c.id}
                component={c}
                onSave={(f) => setComponent(c.id, (x) => ({ ...x, fields: f }))}
                onConfirm={(f) => {
                  const wasConfirmed = c.status === "confirmed";
                  setComponent(c.id, (x) => ({ ...x, fields: f, status: "confirmed" }));
                  onFlash(wasConfirmed ? "Component updated" : "Component confirmed");
                }}
                onReject={
                  c.supplierAdded
                    ? undefined
                    : () => {
                        setComponent(c.id, (x) => ({ ...x, status: "rejected" }));
                        onFlash("Component rejected - marked as not part of this product");
                      }
                }
                onRemove={
                  c.supplierAdded && c.status !== "confirmed" ? () => removeComponent(c.id) : undefined
                }
                onUndoReject={() => setComponent(c.id, (x) => ({ ...x, status: "pending" }))}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border-2 border-dashed border-bluegrey-200 p-6 text-center">
          <div className="text-sm font-semibold text-bluegrey-400">Tier 2 components are locked</div>
          <p className="mt-1 text-sm text-bluegrey-400">Confirm the product above to review its components.</p>
        </section>
      )}
    </div>
  );
}

function ComponentCard({
  component,
  onSave,
  onConfirm,
  onReject,
  onRemove,
  onUndoReject,
}: {
  component: ComponentRecord;
  onSave: (f: RecordFields) => void;
  onConfirm: (f: RecordFields) => void;
  onReject?: () => void;
  onRemove?: () => void;
  onUndoReject: () => void;
}) {
  const c = component;
  const [confirmingReject, setConfirmingReject] = useState(false);
  // A supplier-added component is "New component" until it's named. Blueprint
  // components always carry an identity - at minimum their HS part type.
  const title =
    c.fields.mpnDescription ||
    c.fields.mpn ||
    (c.supplierAdded ? "New component" : c.hs?.description || "Mapped component");

  if (c.status === "rejected") {
    return (
      <div id={`component-${c.id}`} className="scroll-mt-24 rounded-2xl bg-white p-5 opacity-70 shadow-sm ring-1 ring-red-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-bluegrey-500 line-through">{title}</span>
          <StatusPill status="rejected" />
          <button onClick={onUndoReject} className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-500">
            Undo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`component-${c.id}`}
      className={`scroll-mt-24 rounded-2xl bg-bluegrey-50/60 p-5 ring-1 ${c.status === "confirmed" ? "ring-green-200" : "ring-bluegrey-200"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-bluegrey-900">{title}</span>
        {c.hs && <HsChip hs={c.hs} />}
        <MappedBadge mapped={c.mapped} supplierAdded={c.supplierAdded} />
        <span className="ml-auto flex items-center gap-3">
          <StatusPill status={c.status} />
          {onRemove && (
            <button onClick={onRemove} className="text-sm font-medium text-bluegrey-400 hover:text-red-600">
              Discard
            </button>
          )}
        </span>
      </div>
      {c.fields.companyName && (
        <div className="mt-1 text-xs text-bluegrey-400">
          Tier 2 supplier: <span className="font-medium text-bluegrey-500">{c.fields.companyName}</span>
          {" · "}Site: <span className="font-medium text-bluegrey-500">{siteLabel(c.fields.site)}</span>
        </div>
      )}
      <div className="mt-4 border-t border-bluegrey-200/70 pt-4">
        <RecordCard
          fields={c.fields}
          locked={c.status === "confirmed"}
          startInEdit={!c.mapped}
          mpnPrepopulated={false}
          onSave={onSave}
          onConfirm={onConfirm}
          onReject={onReject ? () => setConfirmingReject(true) : undefined}
        />
      </div>
      {confirmingReject && onReject && (
        <RejectConfirmDialog
          title={title}
          onCancel={() => setConfirmingReject(false)}
          onConfirm={() => {
            setConfirmingReject(false);
            onReject();
          }}
        />
      )}
    </div>
  );
}

/* Rejecting is a strong statement, so it asks for confirmation first. */
function RejectConfirmDialog({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bluegrey-900/40 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-bluegrey-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold text-bluegrey-900">Reject this component?</div>
        <p className="mt-2 text-sm leading-6 text-bluegrey-500">
          Are you sure you want to reject <span className="font-semibold text-bluegrey-700">{title}</span>? This tells
          the buyer that it is not part of this product. You can undo this afterwards.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-bluegrey-500 hover:text-bluegrey-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
          >
            Yes, reject it
          </button>
        </div>
      </div>
    </div>
  );
}

