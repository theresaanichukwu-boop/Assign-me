// Shared plan catalog — client-safe (no Node imports).
// Amounts in kobo (NGN × 100). Placeholders to be tested with real users.

export const PLANS = {
  weekly: { amount: 150000, label: "Weekly" },
  monthly: { amount: 400000, label: "Monthly" },
  "pay-per-work": { amount: 200000, label: "Pay per work" },
} as const;

export type PlanSlug = keyof typeof PLANS;
