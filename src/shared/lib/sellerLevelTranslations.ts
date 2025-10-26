/**
 * Переводы уровней продавцов на русский язык
 */
export const SELLER_LEVEL_TRANSLATIONS: Record<string, string> = {
  LEVEL_1: "Уровень 1",
  LEVEL_2: "Уровень 2", 
  LEVEL_3: "Уровень 3",
  LEVEL_4: "Уровень 4",
} as const;

/**
 * Получить русское название уровня продавца
 * @param level - уровень на английском языке
 * @returns русское название уровня
 */
export function getSellerLevelLabel(level: string): string {
  return SELLER_LEVEL_TRANSLATIONS[level] || level;
}

/**
 * Получить русское название уровня продавца (с проверкой на null/undefined)
 * @param level - уровень на английском языке или null/undefined
 * @returns русское название уровня или "—" если уровень не указан
 */
export function getSellerLevelLabelSafe(level: string | null | undefined): string {
  if (!level) return "—";
  return getSellerLevelLabel(level);
}
