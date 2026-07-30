// Data model + seed data for the Supplier Questionnaire demo (Exxon buyer).
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
  buyer: "ExxonMobil",
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
            "Polycrystalline diamond compact (PDC) rotary drill bit for medium-hard formations. Supplied to ExxonMobil upstream drilling operations under master agreement MDT-EXX-2024.",
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
                mpn: "",
                mpnDescription: "",
                site: noSite,
                companyName: "Sinotech Carbide Co., Ltd.",
                contactName: "Wei Zhang",
                contactEmail: "",
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
                mpn: "",
                mpnDescription: "",
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
              mapped: false,
              hs: { code: "4016.93", description: "Gaskets, washers and other seals of vulcanised rubber" },
              fields: {
                mpn: "",
                mpnDescription: "",
                site: noSite,
                companyName: "",
                contactName: "",
                contactEmail: "",
                contractStart: "",
                contractEnd: "",
                expectedVolume: "",
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
            "Integral-blade string stabilizer for directional drilling assemblies. Supplied to ExxonMobil under master agreement MDT-EXX-2024.",
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
                mpn: "",
                mpnDescription: "",
                site: noSite,
                companyName: "Vallourec Star LP",
                contactName: "",
                contactEmail: "",
                contractStart: "2024-01-10",
                contractEnd: "2025-12-31",
                expectedVolume: "500 units / yr",
              },
              status: "pending",
            },
            {
              id: "c-hardface",
              mapped: false,
              hs: { code: "8311.90", description: "Wire and rods for metal surfacing or hardfacing" },
              fields: {
                mpn: "",
                mpnDescription: "",
                site: noSite,
                companyName: "",
                contactName: "",
                contactEmail: "",
                contractStart: "",
                contractEnd: "",
                expectedVolume: "",
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
            "High-pressure gate valve assembly rated to 15,000 psi for wellhead control. Supplied to ExxonMobil European operations under agreement MPG-EXX-2025.",
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
                mpn: "",
                mpnDescription: "",
                site: noSite,
                companyName: "Bharat Precision Castings Pvt.",
                contactName: "Anita Rao",
                contactEmail: "",
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
                mpn: "",
                mpnDescription: "",
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
