/**
 * Глобальный interceptor для обработки 401 ошибок
 * Очищает токен и перезагружает страницу при фатальных ошибках авторизации
 */

let isHandlingUnauthorized = false;

export function handleUnauthorized() {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  console.log("🚨 Unauthorized: очищаем токен и перезагружаем страницу");
  localStorage.removeItem("accessToken");

  // Небольшая задержка для предотвращения множественных вызовов
  setTimeout(() => {
    window.location.reload();
  }, 100);
}

export function resetUnauthorizedHandler() {
  isHandlingUnauthorized = false;
}
