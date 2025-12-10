
export interface Analysis {
  id: string;
  title: string;
  platform: "Instagram" | "TikTok" | "YouTube" | "Facebook";
  score: number;
  date: string;
  status: "Completed" | "Processing" | "Failed";
  thumbnail?: string;
}

export const mockAnalyses: Analysis[] = [
  {
    id: "1",
    title: "Viral Tech Review Strategy",
    platform: "TikTok",
    score: 94,
    date: "2025-12-02",
    status: "Completed",
  },
  {
    id: "2",
    title: "Summer Fashion Haul",
    platform: "Instagram",
    score: 88,
    date: "2025-12-01",
    status: "Completed",
  },
  {
    id: "3",
    title: "Crypto Market Update",
    platform: "YouTube",
    score: 76,
    date: "2025-11-30",
    status: "Completed",
  },
  {
    id: "4",
    title: "Gadget Unboxing #42",
    platform: "YouTube",
    score: 91,
    date: "2025-11-29",
    status: "Completed",
  },
  {
    id: "5",
    title: "Daily Vlog - New Office",
    platform: "Facebook",
    score: 65,
    date: "2025-11-28",
    status: "Completed",
  },
];

export const creditHistory = [
  { id: 1, type: "Purchase", amount: 500, date: "2025-12-01", status: "Completed" },
  { id: 2, type: "Usage", amount: -10, date: "2025-12-02", description: "Analysis #1284" },
  { id: 3, type: "Usage", amount: -10, date: "2025-12-03", description: "Analysis #1289" },
];

export const plans = [
  {
    name: "Starter",
    credits: 100,
    price: "$29",
    features: ["Basic Analysis", "7 Day History", "Email Support"],
    popular: false
  },
  {
    name: "Pro",
    credits: 500,
    price: "$99",
    features: ["Deep Analysis", "30 Day History", "Priority Support", "API Access"],
    popular: true
  },
  {
    name: "Agency",
    credits: 2000,
    price: "$299",
    features: ["Unlimited History", "White Label", "Dedicated Manager", "API Access"],
    popular: false
  }
];
