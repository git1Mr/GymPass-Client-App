import Constants, { ExecutionEnvironment } from "expo-constants";

export const isExpoGo: boolean =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === "expo";

export const isStripeAvailable: boolean = !isExpoGo;
