export const ROOT_PATHS = new Set<string>([
  "/client/home",
  "/admin/home",
  "/mop/home",
  "/practice", // индексный экран "Практика"
]);

export function isRootPath(pathname: string) {
  // если у тебя возможны query-параметры — сравнивай только pathname
  return ROOT_PATHS.has(pathname);
}
