import api from "./api";

export interface CreateIntentResponse {
  clientSecret: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
  merchantName: string;
  amount: number;
  currency: string;
  points: number;
  label: string;
}

export interface CreateIntentOptions {
  points?: number;
  label?: string;
}

export interface CreditTransaction {
  _id: string;
  type: "purchase" | "deduction";
  pointsAmount: number;
  amountPaidMAD: number | null;
  packLabel: string | null;
  provider?: string | null;
  status: "confirmed" | "failed" | "pending";
  createdAt: string;
}

export async function createPaymentIntent(
  amountMAD: number,
  opts: CreateIntentOptions = {},
): Promise<CreateIntentResponse> {
  try {
    const { data } = await api.post<CreateIntentResponse>(
      "/payments/create-intent",
      {
        amount: amountMAD,
        ...(opts.points !== undefined && { points: opts.points }),
        ...(opts.label !== undefined && { label: opts.label }),
      },
    );
    return data;
  } catch (err: any) {
    const message =
      err.response?.data || err.message || "Failed to start payment.";
    throw new Error(typeof message === "string" ? message : "Payment failed.");
  }
}

export async function fetchMyTransactions(): Promise<CreditTransaction[]> {
  const { data } = await api.get<CreditTransaction[]>("/transactions/me");
  return data;
}
