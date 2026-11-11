/** Static workspace data behind every screen. All of it is fictional:
 *  people, accounts, places, claims and figures. */

export const PERSONA = {
  name: "Nora Vance",
  role: "Finance Operations",
  email: "nora.vance@harborlight.example",
  company: "Harborlight Group",
};

export interface ClientRow {
  code: string;
  name: string;
  industry: string;
  regions: number;
  openClaims: number;
  ytdPaid: number;
}

export const CLIENTS: ClientRow[] = [
  { code: "ARVX", name: "Arvex Labs", industry: "Biotech", regions: 18, openClaims: 212, ytdPaid: 4_612_000 },
  { code: "CLDR", name: "Calder Foods", industry: "Consumer goods", regions: 32, openClaims: 186, ytdPaid: 3_904_500 },
  { code: "NMBS", name: "Nimbus Health", industry: "Healthcare", regions: 24, openClaims: 164, ytdPaid: 3_488_200 },
  { code: "ORCH", name: "Orchid Systems", industry: "Software", regions: 11, openClaims: 149, ytdPaid: 2_951_800 },
  { code: "TSSL", name: "Tessel Energy", industry: "Energy", regions: 27, openClaims: 131, ytdPaid: 2_604_300 },
  { code: "PNWD", name: "Pinewood Media", industry: "Media", regions: 9, openClaims: 102, ytdPaid: 1_892_600 },
  { code: "JNCA", name: "Junica Freight", industry: "Logistics", regions: 21, openClaims: 96, ytdPaid: 1_571_400 },
  { code: "VELD", name: "Veldt Materials", industry: "Mining", regions: 14, openClaims: 71, ytdPaid: 1_204_900 },
  { code: "SABL", name: "Sable Finance", industry: "Financial services", regions: 8, openClaims: 58, ytdPaid: 986_300 },
  { code: "QURT", name: "Quartet Hotels", industry: "Hospitality", regions: 12, openClaims: 44, ytdPaid: 721_500 },
];

export interface ClaimRow {
  claimNo: string;
  claimant: string;
  account: string;
  incident: string;
  coverage: string;
  status: "Open" | "Review" | "Settled";
  paid: number;
}

export const RECENT_CLAIMS: ClaimRow[] = [
  { claimNo: "HLG-24381", claimant: "T. Okonkwo", account: "ARVX", incident: "Lab fire, Boston MA", coverage: "Property Core", status: "Open", paid: 86_400 },
  { claimNo: "HLG-24380", claimant: "R. Castillo", account: "CLDR", incident: "Fleet collision, Dallas TX", coverage: "Auto Liability", status: "Open", paid: 42_150 },
  { claimNo: "HLG-24377", claimant: "S. Lindgren", account: "NMBS", incident: "Slip and fall, Raleigh NC", coverage: "General Liability", status: "Review", paid: 9_870 },
  { claimNo: "HLG-24371", claimant: "A. Benali", account: "ORCH", incident: "Water damage, Seattle WA", coverage: "Property Core", status: "Open", paid: 57_300 },
  { claimNo: "HLG-24368", claimant: "K. Moreau", account: "TSSL", incident: "Turbine failure, Aberdeen", coverage: "Equipment Breakdown", status: "Open", paid: 73_950 },
  { claimNo: "HLG-24362", claimant: "J. Petrov", account: "ARVX", incident: "Cargo loss, Boston MA", coverage: "Marine Cargo", status: "Settled", paid: 31_240 },
  { claimNo: "HLG-24359", claimant: "M. Adeyemi", account: "JNCA", incident: "Warehouse hail, Columbus OH", coverage: "Property Core", status: "Open", paid: 28_610 },
  { claimNo: "HLG-24355", claimant: "L. Whitaker", account: "PNWD", incident: "Studio flood, Atlanta GA", coverage: "Property Core", status: "Settled", paid: 64_020 },
];

export interface ReportRow {
  key: string;
  name: string;
  domain: "Finance" | "Operations" | "Partners";
  owner: string;
  lastOpened: string;
  live: boolean;
}

export const REPORTS: ReportRow[] = [
  { key: "program-spend", name: "Program Spend", domain: "Finance", owner: "Finance Operations", lastOpened: "Today, 9:14", live: true },
  { key: "open-reserves", name: "Open Reserves", domain: "Finance", owner: "Treasury", lastOpened: "Today, 8:42", live: true },
  { key: "payment-summary", name: "Payment Summary", domain: "Finance", owner: "Finance Operations", lastOpened: "Yesterday", live: true },
  { key: "account-position", name: "Account Cash Position", domain: "Finance", owner: "Treasury", lastOpened: "Yesterday", live: true },
  { key: "active-claims", name: "Active Claims", domain: "Operations", owner: "Claims Desk", lastOpened: "Mon", live: true },
  { key: "litigation", name: "Litigation Watch", domain: "Operations", owner: "Legal Desk", lastOpened: "Mon", live: true },
  { key: "exceptions", name: "Exception Review", domain: "Operations", owner: "Program Office", lastOpened: "Fri", live: true },
  { key: "vendor-usage", name: "Vendor Usage", domain: "Partners", owner: "Partner Network", lastOpened: "Fri", live: true },
  { key: "recovery", name: "Recovery Pipeline", domain: "Partners", owner: "Partner Network", lastOpened: "Last week", live: true },
  { key: "subrogation", name: "Subrogation Aging", domain: "Partners", owner: "Partner Network", lastOpened: "Last week", live: false },
];

export interface ActivityRow {
  time: string;
  user: string;
  action: string;
  target: string;
}

export const ACTIVITY: ActivityRow[] = [
  { time: "09:14", user: "Nora Vance", action: "Asked a question", target: "Program Spend" },
  { time: "09:12", user: "Nora Vance", action: "Saved a chart", target: "Program Spend" },
  { time: "08:58", user: "Dele Akande", action: "Exported table", target: "Open Reserves" },
  { time: "08:47", user: "Priya Raman", action: "Opened report", target: "Account Cash Position" },
  { time: "08:31", user: "Sam Kowalczyk", action: "Changed date range", target: "Active Claims" },
  { time: "08:20", user: "Dele Akande", action: "Saved a chart", target: "Payment Summary" },
  { time: "07:55", user: "Mia Schulte", action: "Opened report", target: "Exception Review" },
  { time: "07:41", user: "Priya Raman", action: "Asked a question", target: "Program Spend" },
  { time: "07:30", user: "System", action: "Nightly refresh finished", target: "All reports" },
  { time: "Yesterday", user: "Sam Kowalczyk", action: "Pinned report", target: "Vendor Usage" },
];

/** Figures behind the static charts on Program Spend. */
export const SPEND_BY_GROUP = [
  { label: "Property damage", value: 7_912_400 },
  { label: "Medical", value: 6_438_900 },
  { label: "Liability", value: 3_206_750 },
  { label: "Business interruption", value: 2_118_300 },
  { label: "Legal costs", value: 1_021_600 },
  { label: "Other", value: 486_200 },
];

export const SPEND_BY_MONTH = [
  { label: "Jan", value: 1_820_000 },
  { label: "Feb", value: 1_960_000 },
  { label: "Mar", value: 1_540_000 },
  { label: "Apr", value: 2_080_000 },
  { label: "May", value: 2_230_000 },
  { label: "Jun", value: 2_410_000 },
  { label: "Jul", value: 2_150_000 },
  { label: "Aug", value: 2_320_000 },
  { label: "Sep", value: 2_190_000 },
];

export interface SpendLine {
  claimNo: string;
  account: string;
  category: string;
  detail: string;
  date: string;
  amount: number;
}

const BASE_LINES: SpendLine[] = [
  { claimNo: "HLG-24381", account: "ARVX", category: "Property damage", detail: "Contractor invoice", date: "Sep 26", amount: 18_420.5 },
  { claimNo: "HLG-24380", account: "CLDR", category: "Liability", detail: "Third party settlement", date: "Sep 26", amount: 24_118.0 },
  { claimNo: "HLG-24377", account: "NMBS", category: "Medical", detail: "Hospital invoice", date: "Sep 25", amount: 2_150.0 },
  { claimNo: "HLG-24371", account: "ORCH", category: "Business interruption", detail: "Lost revenue advance", date: "Sep 25", amount: 6_240.0 },
  { claimNo: "HLG-24368", account: "TSSL", category: "Property damage", detail: "Equipment salvage", date: "Sep 24", amount: 1_890.75 },
  { claimNo: "HLG-24362", account: "ARVX", category: "Legal costs", detail: "Defense counsel", date: "Sep 24", amount: 4_512.25 },
  { claimNo: "HLG-24359", account: "JNCA", category: "Property damage", detail: "Roof repair", date: "Sep 23", amount: 12_304.0 },
  { claimNo: "HLG-24355", account: "PNWD", category: "Property damage", detail: "Restoration crew", date: "Sep 23", amount: 19_860.0 },
  { claimNo: "HLG-24351", account: "VELD", category: "Medical", detail: "Physio program", date: "Sep 22", amount: 1_475.0 },
  { claimNo: "HLG-24347", account: "SABL", category: "Business interruption", detail: "Temporary office", date: "Sep 22", amount: 3_082.4 },
];

/** Three pages of line detail: the base rows plus two earlier batches,
 *  derived deterministically so the table can page without a backend. */
export const SPEND_LINES: SpendLine[] = [
  ...BASE_LINES,
  ...BASE_LINES.map((l, i) => ({
    ...l,
    claimNo: `HLG-${24330 - i * 3}`,
    date: i % 2 ? "Sep 18" : "Sep 19",
    amount: Math.round(l.amount * 0.87 * 100) / 100,
  })),
  ...BASE_LINES.map((l, i) => ({
    ...l,
    claimNo: `HLG-${24290 - i * 3}`,
    date: i % 2 ? "Sep 15" : "Sep 16",
    amount: Math.round(l.amount * 1.12 * 100) / 100,
  })),
];

/** Usage analytics fixtures. */
export const QUESTIONS_PER_WEEK = [
  { label: "W31", value: 42 },
  { label: "W32", value: 51 },
  { label: "W33", value: 47 },
  { label: "W34", value: 63 },
  { label: "W35", value: 58 },
  { label: "W36", value: 72 },
  { label: "W37", value: 69 },
  { label: "W38", value: 81 },
];

export const SAVES_BY_TEAM = [
  { label: "Finance Operations", value: 34 },
  { label: "Treasury", value: 21 },
  { label: "Claims Desk", value: 17 },
  { label: "Program Office", value: 11 },
  { label: "Partner Network", value: 6 },
];

export const TOP_REPORTS = [
  { label: "Program Spend", value: 268 },
  { label: "Open Reserves", value: 214 },
  { label: "Active Claims", value: 189 },
  { label: "Account Cash Position", value: 121 },
  { label: "Payment Summary", value: 98 },
];

export function money(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1000).toLocaleString()}K`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export function moneyExact(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
