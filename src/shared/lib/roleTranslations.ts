import type { PracticeParticipantRole } from "@/shared/types/user.types";

/**
 * Переводы ролей участников практики на русский язык
 */
export const ROLE_TRANSLATIONS: Record<PracticeParticipantRole, string> = {
  SELLER: "Продавец",
  BUYER: "Покупатель", 
  MODERATOR: "Модератор",
  OBSERVER: "Наблюдатель",
} as const;

/**
 * Получить русское название роли участника практики
 * @param role - роль на английском языке
 * @returns русское название роли
 */
export function getRoleLabel(role: PracticeParticipantRole): string {
  return ROLE_TRANSLATIONS[role] || role;
}

/**
 * Получить русское название роли участника практики (с проверкой на null/undefined)
 * @param role - роль на английском языке или null/undefined
 * @returns русское название роли или "—" если роль не указана
 */
export function getRoleLabelSafe(role: PracticeParticipantRole | null | undefined): string {
  if (!role) return "—";
  return getRoleLabel(role);
}
