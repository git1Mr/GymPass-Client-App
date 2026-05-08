export interface User {
  _id: string;
  name: string;
  email: string;
  role: "member" | "gym_staff" | "admin";
  pointsBalance: number;
  deviceId: string;
  status: "active" | "suspended" | "pending";
  createdAt: string;
}

export interface Gym {
  _id: string;
  name: string;
  city: string;
  tier: 1 | 2 | 3;
  pointsPerSession: number;
  equipment: string[];
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  status: "active" | "pending" | "suspended";
}

export interface Transaction {
  _id: string;
  userId: string;
  gymId?: string | Gym;
  type: "purchase" | "deduction";
  pointsAmount: number;
  amountPaidMAD?: number;
  packLabel?: string;
  source: "online" | "offline";
  status: "confirmed" | "failed" | "pending";
  createdAt: string;
}

export type TabParamList = {
  index: undefined;
  explore: undefined;
  plans: undefined;
  profile: undefined;
};
