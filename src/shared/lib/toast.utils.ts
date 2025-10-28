import { toast } from "sonner";

export type ToastSeverity = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Extract error message from API error response
 */
export function extractErrorMessage(error: any): string {
  // Handle different error response formats
  if (error?.error?.message) {
    return error.error.message;
  }

  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.data?.error?.message) {
    return error.data.error.message;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  // Log the error structure for debugging
  console.warn("Unknown error format:", error);

  return "Произошла неизвестная ошибка";
}

/**
 * Extract error details for form validation
 */
export function extractErrorDetails(
  error: any
): Array<{ path: string; message: string }> {
  if (error?.error?.details && Array.isArray(error.error.details)) {
    return error.error.details;
  }

  if (
    error?.response?.data?.error?.details &&
    Array.isArray(error.response.data.error.details)
  ) {
    return error.response.data.error.details;
  }

  if (error?.data?.error?.details && Array.isArray(error.data.error.details)) {
    return error.data.error.details;
  }

  if (
    error?.response?.data?.details &&
    Array.isArray(error.response.data.details)
  ) {
    return error.response.data.details;
  }

  if (error?.data?.details && Array.isArray(error.data.details)) {
    return error.data.details;
  }

  return [];
}

/**
 * Debug function to log error structure (useful for development)
 */
export function debugErrorStructure(error: any, label: string = "Error") {
  if (typeof window !== "undefined" && import.meta.env.DEV) {
    console.group(`🔍 ${label} Structure Debug`);
    console.log("Full error object:", error);
    console.log("Extracted message:", extractErrorMessage(error));
    console.log("Extracted details:", extractErrorDetails(error));
    console.log("Error type checks:", {
      conflict: isErrorType(error, "conflict"),
      unauthorized: isErrorType(error, "unauthorized"),
      forbidden: isErrorType(error, "forbidden"),
      notFound: isErrorType(error, "notFound"),
      badRequest: isErrorType(error, "badRequest"),
      internal: isErrorType(error, "internal"),
    });
    console.groupEnd();
  }
}

/**
 * Check if error is a specific type based on status code or error code
 */
export function isErrorType(
  error: any,
  type:
    | "conflict"
    | "unauthorized"
    | "forbidden"
    | "notFound"
    | "badRequest"
    | "internal"
): boolean {
  const status = error?.status || error?.response?.status;
  const code =
    error?.error?.code ||
    error?.response?.data?.error?.code ||
    error?.data?.error?.code ||
    error?.response?.data?.code ||
    error?.data?.code;

  switch (type) {
    case "conflict":
      return status === 409 || code === "CONFLICT";
    case "unauthorized":
      return status === 401 || code === "UNAUTHORIZED";
    case "forbidden":
      return status === 403 || code === "FORBIDDEN";
    case "notFound":
      return status === 404 || code === "NOT_FOUND";
    case "badRequest":
      return status === 400 || code === "BAD_REQUEST";
    case "internal":
      return status === 500 || code === "INTERNAL_ERROR";
    default:
      return false;
  }
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string, options?: ToastOptions) {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

/**
 * Show error toast
 */
export function showErrorToast(message: string, options?: ToastOptions) {
  return toast.error(message, {
    description: options?.description,
    duration: options?.duration || 6000,
    action: options?.action,
  });
}

/**
 * Show warning toast
 */
export function showWarningToast(message: string, options?: ToastOptions) {
  return toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    action: options?.action,
  });
}

/**
 * Show info toast
 */
export function showInfoToast(message: string, options?: ToastOptions) {
  return toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

/**
 * Show toast based on severity
 */
export function showToast(
  severity: ToastSeverity,
  message: string,
  options?: ToastOptions
) {
  switch (severity) {
    case "success":
      return showSuccessToast(message, options);
    case "error":
      return showErrorToast(message, options);
    case "warning":
      return showWarningToast(message, options);
    case "info":
      return showInfoToast(message, options);
    default:
      return showInfoToast(message, options);
  }
}

/**
 * Handle API error and show appropriate toast
 * Prioritizes backend error messages over generic fallback messages
 */
export function handleApiError(
  error: any,
  fallbackMessage: string = "Произошла ошибка"
): string {
  const errorMessage = extractErrorMessage(error);
  const errorDetails = extractErrorDetails(error);

  // Determine if this is a network error or server error (5xx)
  const isNetworkError = !error?.response && !error?.error;
  const isServerError = isErrorType(error, "internal");
  const isClientError =
    isErrorType(error, "badRequest") ||
    isErrorType(error, "conflict") ||
    isErrorType(error, "unauthorized") ||
    isErrorType(error, "forbidden") ||
    isErrorType(error, "notFound");

  // For client errors (4xx), always prioritize backend message
  // For server errors (5xx) and network errors, use backend message if available, otherwise fallback
  const shouldUseBackendMessage =
    isClientError ||
    (errorMessage && errorMessage !== "Произошла неизвестная ошибка");

  const mainMessage = shouldUseBackendMessage ? errorMessage : fallbackMessage;

  // Build description from backend error details or provide contextual info
  let description: string | undefined;

  if (errorDetails.length > 0) {
    // Show validation details from backend
    description = errorDetails
      .map((detail) => `${detail.path}: ${detail.message}`)
      .join(", ");
  } else if (shouldUseBackendMessage && errorMessage) {
    // If we have a specific backend message, don't override with generic descriptions
    description = undefined;
  } else {
    // Only use generic descriptions as fallback for network/server errors
    description = isNetworkError
      ? "Проверьте подключение к интернету"
      : isServerError
      ? "Внутренняя ошибка сервера, попробуйте позже"
      : isErrorType(error, "conflict")
      ? "Проверьте уникальность данных"
      : isErrorType(error, "unauthorized")
      ? "Необходимо войти в систему"
      : isErrorType(error, "forbidden")
      ? "Недостаточно прав для выполнения операции"
      : isErrorType(error, "notFound")
      ? "Запрашиваемый ресурс не найден"
      : isErrorType(error, "badRequest")
      ? "Проверьте корректность введенных данных"
      : undefined;
  }

  showErrorToast(mainMessage, {
    description,
    duration: errorDetails.length > 0 ? 5000 : 6000,
  });

  return mainMessage;
}

/**
 * Handle form submission success
 */
export function handleFormSuccess(message: string, options?: ToastOptions) {
  return showSuccessToast(message, {
    duration: 1500,
    ...options,
  });
}

/**
 * Handle form submission error with detailed error handling
 * Prioritizes backend error messages over generic fallback messages
 */
export function handleFormError(
  error: any,
  fallbackMessage: string = "Ошибка при сохранении данных"
): string {
  const errorMessage = extractErrorMessage(error);
  const errorDetails = extractErrorDetails(error);

  // Determine error types
  const isNetworkError = !error?.response && !error?.error;
  const isServerError = isErrorType(error, "internal");
  const isClientError =
    isErrorType(error, "badRequest") ||
    isErrorType(error, "conflict") ||
    isErrorType(error, "unauthorized") ||
    isErrorType(error, "forbidden") ||
    isErrorType(error, "notFound");
  const isValidationError =
    errorDetails.length > 0 || isErrorType(error, "badRequest");

  // For client errors (4xx), always prioritize backend message
  // For server errors (5xx) and network errors, use backend message if available, otherwise fallback
  const shouldUseBackendMessage =
    isClientError ||
    (errorMessage && errorMessage !== "Произошла неизвестная ошибка");

  const mainMessage = shouldUseBackendMessage ? errorMessage : fallbackMessage;

  // Build description from backend error details or provide contextual info
  let description: string | undefined;

  if (errorDetails.length > 0) {
    // Show validation details from backend
    description = errorDetails
      .map((detail) => `${detail.path}: ${detail.message}`)
      .join(", ");
  } else if (shouldUseBackendMessage && errorMessage) {
    // If we have a specific backend message, don't override with generic descriptions
    description = undefined;
  } else {
    // Only use generic descriptions as fallback for network/server errors
    description = isNetworkError
      ? "Проверьте подключение к интернету"
      : isServerError
      ? "Внутренняя ошибка сервера, попробуйте позже"
      : isValidationError
      ? "Проверьте корректность заполнения полей"
      : isErrorType(error, "conflict")
      ? "Данные с такими параметрами уже существуют"
      : isErrorType(error, "unauthorized")
      ? "Сессия истекла, необходимо войти заново"
      : isErrorType(error, "forbidden")
      ? "У вас нет прав для выполнения этой операции"
      : isErrorType(error, "notFound")
      ? "Запрашиваемый ресурс не найден"
      : "Попробуйте еще раз или обратитесь в поддержку";
  }

  showErrorToast(mainMessage, {
    description,
    duration: isValidationError ? 4500 : 6000,
  });

  return mainMessage;
}

/**
 * Common success messages for different operations
 */
export const SUCCESS_MESSAGES = {
  CREATE: "Успешно создано",
  UPDATE: "Успешно обновлено",
  DELETE: "Успешно удалено",
  SAVE: "Успешно сохранено",
  SEND: "Успешно отправлено",
  UPLOAD: "Успешно загружено",
  DOWNLOAD: "Успешно скачано",
  COPY: "Скопировано в буфер обмена",
  LOGIN: "Успешный вход в систему",
  LOGOUT: "Успешный выход из системы",
} as const;

/**
 * Common error messages for different operations
 */
export const ERROR_MESSAGES = {
  CREATE: "Ошибка при создании",
  UPDATE: "Ошибка при обновлении",
  DELETE: "Ошибка при удалении",
  SAVE: "Ошибка при сохранении",
  SEND: "Ошибка при отправке",
  UPLOAD: "Ошибка при загрузке",
  DOWNLOAD: "Ошибка при скачивании",
  LOAD: "Ошибка при загрузке данных",
  LOGIN: "Ошибка входа в систему",
  LOGOUT: "Ошибка выхода из системы",
  NETWORK: "Ошибка сети",
  VALIDATION: "Ошибка валидации данных",
  PERMISSION: "Недостаточно прав",
  NOT_FOUND: "Ресурс не найден",
  CONFLICT: "Конфликт данных",
} as const;
