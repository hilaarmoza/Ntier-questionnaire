// Data model + seed data for the Supplier Questionnaire demo (Acme Corp buyer).
// Hierarchy: Supplier Family > Legal Entity > Product > Tier 2 Components.
// Sites and Tier 2 suppliers are attributes, not hierarchy levels.

export type SiteValue =
  | { kind: "known"; value: string }
  | { kind: "unknown" } // supplier explicitly confirmed they don't know
  | { kind: "empty" }; // not yet answered - blocks confirmation

export interface HsCode {
  code: string;
  description: string;
}

export interface RecordFields {
  mpn: string;
  mpnDescription: string;
  site: SiteValue;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contractStart: string;
  contractEnd: string;
  expectedVolume: string;
}

export type RecordStatus = "pending" | "confirmed" | "rejected";

export interface ComponentRecord {
  id: string;
  /** Matched via trade data in the product blueprint → prepopulated values. */
  mapped: boolean;
  /** Added by the supplier via "Add component". */
  supplierAdded?: boolean;
  hs?: HsCode;
  fields: RecordFields;
  status: RecordStatus;
}

export interface Product {
  id: string;
  name: string;
  hs: HsCode;
  blurb: string;
  fields: RecordFields;
  confirmed: boolean;
  components: ComponentRecord[];
}

export interface LegalEntity {
  id: string;
  name: string;
  country: string;
  city: string;
  products: Product[];
}

export interface SupplierFamily {
  name: string;
  buyer: string;
  /** The signed-in family-level respondent - default contact for tier 1 products. */
  respondent: { name: string; email: string };
  entities: LegalEntity[];
}

export interface Delegation {
  id: string;
  assignee: string;
  email: string;
  scope: string; // human-readable description of what was delegated
}

const site = (value: string): SiteValue => ({ kind: "known", value });
const noSite: SiteValue = { kind: "empty" };

export const seedFamily: SupplierFamily = {
  name: "Meridian Drilling Technologies",
  buyer: "Acme Corp",
  respondent: { name: "Rachel Okafor", email: "r.okafor@meridian-drilling.com" },
  entities: [
    {
      id: "le-us",
      name: "Meridian Drilling Tools US LLC",
      country: "United States",
      city: "Houston, TX",
      products: [
        {
          id: "p-pdc90",
          name: "Rotary Drill Bit PDC-90",
          hs: { code: "8207.19", description: "Drill bits for oil and gas field equipment" },
          blurb:
            "Polycrystalline diamond compact (PDC) rotary drill bit for medium-hard formations. Supplied to Acme Corp upstream drilling operations under master agreement MDT-ACME-2024.",
          fields: {
            mpn: "PDC-90-8T",
            mpnDescription: "8-blade PDC drill bit, 8.75in, medium-hard formation",
            site: noSite,
            companyName: "Meridian Drilling Tools US LLC",
            contactName: "Rachel Okafor",
            contactEmail: "r.okafor@meridian-drilling.com",
            contractStart: "2024-03-01",
            contractEnd: "2027-02-28",
            expectedVolume: "1,200 units / yr",
          },
          confirmed: false,
          components: [
            {
              id: "c-tci",
              mapped: true,
              hs: { code: "8209.00", description: "Plates and tips of sintered metal carbides for tools" },
              fields: {
                mpn: "TCI-8-D40",
                mpnDescription: "Tungsten carbide insert, 8mm dome",
                site: site("Sinotech Carbide Plant 3 - Zhuzhou, Hunan, China"),
                companyName: "Sinotech Carbide Co., Ltd.",
                contactName: "Wei Zhang",
                contactEmail: "wei.zhang@sinotech-carbide.cn",
                contractStart: "2024-06-15",
                contractEnd: "2026-06-14",
                expectedVolume: "9,600 units / yr",
              },
              status: "pending",
            },
            {
              id: "c-body",
              mapped: true,
              hs: { code: "7326.90", description: "Forged articles of iron or steel" },
              fields: {
                mpn: "OFW-BB-875",
                mpnDescription: "Forged steel bit body blank, 8.75in",
                site: site("Ohio Forge Works - Canton, OH, USA"),
                companyName: "Ohio Forge Works Inc.",
                contactName: "Dan Kowalski",
                contactEmail: "d.kowalski@ohioforge.com",
                contractStart: "2023-11-01",
                contractEnd: "2026-10-31",
                expectedVolume: "1,300 units / yr",
              },
              status: "pending",
            },
            {
              id: "c-seal",
              mapped: true,
              hs: { code: "4016.93", description: "Gaskets, washers and other seals of vulcanised rubber" },
              fields: {
                mpn: "NBR-OR-226",
                mpnDescription: "HNBR O-ring seal kit for bearing assembly",
                site: site("Parker O-Ring Division - Lexington, KY, USA"),
                companyName: "Parker Hannifin Corp.",
                contactName: "Laura Mitchell",
                contactEmail: "l.mitchell@parker.com",
                contractStart: "2024-04-01",
                contractEnd: "2026-03-31",
                expectedVolume: "4,800 units / yr",
              },
              status: "pending",
            },
          ],
        },
        {
          id: "p-ds40",
          name: "Downhole Stabilizer DS-40",
          hs: { code: "8431.43", description: "Parts for boring or sinking machinery" },
          blurb:
            "Integral-blade string stabilizer for directional drilling assemblies. Supplied to Acme Corp under master agreement MDT-ACME-2024.",
          fields: {
            mpn: "DS-40-IB",
            mpnDescription: "Integral blade stabilizer, 6.5in body",
            site: site("Meridian Plant 2 - Odessa, TX, USA"),
            companyName: "Meridian Drilling Tools US LLC",
            contactName: "Rachel Okafor",
            contactEmail: "r.okafor@meridian-drilling.com",
            contractStart: "2024-03-01",
            contractEnd: "2027-02-28",
            expectedVolume: "450 units / yr",
          },
          confirmed: false,
          components: [
            {
              id: "c-bar",
              mapped: true,
              hs: { code: "7228.30", description: "Bars and rods of alloy steel, hot-rolled" },
              fields: {
                mpn: "VS-4145H-70",
                mpnDescription: "AISI 4145H alloy steel round bar, 7in",
                site: site("Vallourec Star - Youngstown, OH, USA"),
                companyName: "Vallourec Star LP",
                contactName: "Mike Brennan",
                contactEmail: "m.brennan@vallourec.com",
                contractStart: "2024-01-10",
                contractEnd: "2025-12-31",
                expectedVolume: "500 units / yr",
              },
              status: "pending",
            },
            {
              id: "c-hardface",
              mapped: true,
              hs: { code: "8311.90", description: "Wire and rods for metal surfacing or hardfacing" },
              fields: {
                mpn: "HF-WC-332",
                mpnDescription: "Tungsten carbide hardfacing rod, 3/32in",
                site: site("Postle Industries - Cleveland, OH, USA"),
                companyName: "Postle Industries Inc.",
                contactName: "Greg Novak",
                contactEmail: "g.novak@postle.com",
                contractStart: "2024-02-01",
                contractEnd: "2026-01-31",
                expectedVolume: "2,000 lb / yr",
              },
              status: "pending",
            },
          ],
        },
      ],
    },
    {
      id: "le-de",
      name: "Meridian Precision GmbH",
      country: "Germany",
      city: "Essen",
      products: [
        {
          id: "p-hpv3",
          name: "High-Pressure Valve Assembly HPV-3",
          hs: { code: "8481.80", description: "Valves for pipes, boiler shells, tanks or vats" },
          blurb:
            "High-pressure gate valve assembly rated to 15,000 psi for wellhead control. Supplied to Acme Corp European operations under agreement MPG-ACME-2025.",
          fields: {
            mpn: "HPV-3-15K",
            mpnDescription: "15K psi gate valve assembly, API 6A",
            site: noSite,
            companyName: "Meridian Precision GmbH",
            contactName: "Jonas Weber",
            contactEmail: "j.weber@meridian-precision.de",
            contractStart: "2025-01-01",
            contractEnd: "2027-12-31",
            expectedVolume: "300 units / yr",
          },
          confirmed: false,
          components: [
            {
              id: "c-gate",
              mapped: true,
              hs: { code: "8481.90", description: "Parts of taps, cocks and valves" },
              fields: {
                mpn: "BPC-GV-15K",
                mpnDescription: "Cast gate and seat set, 15K psi",
                site: site("Bharat Precision Castings - Pune, Maharashtra, India"),
                companyName: "Bharat Precision Castings Pvt.",
                contactName: "Anita Rao",
                contactEmail: "anita.rao@bharatcastings.in",
                contractStart: "2024-09-01",
                contractEnd: "2026-08-31",
                expectedVolume: "350 units / yr",
              },
              status: "pending",
            },
            {
              id: "c-elastomer",
              mapped: true,
              hs: { code: "4016.93", description: "Gaskets, washers and other seals of vulcanised rubber" },
              fields: {
                mpn: "TSS-GS-HPV3",
                mpnDescription: "Stem packing and bonnet seal set",
                site: site("Trelleborg Sealing - Stein am Rhein, Switzerland"),
                companyName: "Trelleborg Sealing Solutions",
                contactName: "Marc Keller",
                contactEmail: "marc.keller@trelleborg.com",
                contractStart: "2024-05-01",
                contractEnd: "2026-04-30",
                expectedVolume: "1,000 sets / yr",
              },
              status: "pending",
            },
          ],
        },
      ],
    },
  ],
};

/* ---------------- Record source (shown on Review and submit) ---------------- */

export type RecordSource = "sayari" | "vendor-added" | "vendor-edited";

const seedFieldsById = new Map<string, RecordFields>(
  seedFamily.entities.flatMap((e) =>
    e.products.flatMap((p) => [[p.id, p.fields] as const, ...p.components.map((c) => [c.id, c.fields] as const)]),
  ),
);

/**
 * Sayari-mapped records stay "sayari" while the vendor only fills blanks
 * (e.g. the missing site). Changing any prepopulated value makes it "vendor-edited".
 */
export function recordSource(id: string, fields: RecordFields, supplierAdded?: boolean): RecordSource {
  if (supplierAdded) return "vendor-added";
  const seed = seedFieldsById.get(id);
  if (!seed) return "vendor-added";
  const edited = (Object.keys(seed) as (keyof RecordFields)[]).some((key) => {
    const before = seed[key];
    const after = fields[key];
    if (typeof before === "string") return before !== "" && before !== after;
    const b = before as SiteValue;
    const a = after as SiteValue;
    return b.kind === "known" && (a.kind !== "known" || a.value !== b.value);
  });
  return edited ? "vendor-edited" : "sayari";
}

export const emptyFields = (): RecordFields => ({
  mpn: "",
  mpnDescription: "",
  site: { kind: "empty" },
  companyName: "",
  contactName: "",
  contactEmail: "",
  contractStart: "",
  contractEnd: "",
  expectedVolume: "",
});

/**
 * Mandatory checks shared by product + component confirm boxes.
 * Components may confirm the site as unknown; the tier 1 product may not -
 * a manufacturer always knows where its own product is made.
 */
export function missingMandatory(f: RecordFields, allowUnknownSite = true): string[] {
  const missing: string[] = [];
  if (!f.mpn.trim()) missing.push("MPN");
  if (!f.mpnDescription.trim()) missing.push("MPN description");
  if (allowUnknownSite) {
    if (f.site.kind === "empty") missing.push("Site / Facility (fill in or confirm unknown)");
  } else if (f.site.kind !== "known") {
    missing.push("Site / Facility");
  }
  if (!f.companyName.trim()) missing.push("Company name");
  if (!f.contactName.trim()) missing.push("Contact name");
  if (!f.contactEmail.trim()) missing.push("Contact email (needed to cascade to Tier 2)");
  return missing;
}
