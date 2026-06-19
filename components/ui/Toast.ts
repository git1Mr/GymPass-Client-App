import Toast from "react-native-toast-message";

interface ToastHelper {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const toast: ToastHelper = {
  success: (message: string, title = "Succès"): void =>
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      visibilityTime: 3000,
    }),
  error: (message: string, title = "Erreur"): void =>
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      visibilityTime: 4000,
    }),
  info: (message: string, title = "Info"): void =>
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      visibilityTime: 3000,
    }),
};

export default toast;
