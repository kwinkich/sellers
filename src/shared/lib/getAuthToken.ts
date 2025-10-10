export const getAuthToken = (): string => {
  const token = localStorage.getItem("accessToken");
  if (token) return token;

  return "";
};

export const updateAuthToken = (t: string): boolean => {
  if (!t) return false;

  localStorage.setItem("accessToken", t);

  return true;
};

// Функция для полной очистки всех токенов
export const clearAllTokens = (): void => {
  console.log("🧹 clearAllTokens: Очищаем все токены");
  localStorage.removeItem("accessToken");
};
