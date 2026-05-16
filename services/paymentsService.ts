// services/paymentsService.ts
//
// Thin wrapper around the backend Stripe endpoints. The Payment Sheet flow
// asks the server for a PaymentIntent + Ephemeral Key + Customer triplet
// and then presents them to the Stripe SDK on the device.

import api from "./api";

export interface CreateIntentResponse {
  clientSecret:   string;
  ephemeralKey:   string;
  customer:       string;
  publishableKey: string;
  merchantName:   string;
  amount:         number; // minor units (e.g. centimes)
  currency:       string;
  points:         number;
}

export interface CreditTransaction {
  _id:            string;
  type:           "purchase" | "deduction";
  pointsAmount:   number;
  amountPaidMAD:  number | null;
  packLabel:      string | null;
  provider?:      string | null;
  status:         "confirmed" | "failed" | "pending";
  createdAt:      string;
}

export async function createPaymentIntent(
  amountMAD: number,
): Promise<CreateIntentResponse> {
  try {
    const { data } = await api.post<CreateIntentResponse>(
      "/payments/create-intent",
      { amount: amountMAD },
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
