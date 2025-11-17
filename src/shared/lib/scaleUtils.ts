import type { ScaleOption } from "@/entities/scenarios/model/types/scenarios.types";

/**
 * Генерирует значения для опций шкалы
 * Распределяет значения равномерно от отрицательных к положительным так, чтобы сумма всех значений равнялась 0
 *
 * @param count - Количество опций, влияющих на оценку
 * @returns Массив значений от отрицательных к положительным
 *
 * @example
 * generateScaleValues(2) => [-1, 1] (сумма = 0)
 * generateScaleValues(3) => [-1, 0, 1] (сумма = 0)
 * generateScaleValues(4) => [-2, -1, 1, 2] (сумма = 0, без 0)
 * generateScaleValues(5) => [-2, -1, 0, 1, 2] (сумма = 0)
 * generateScaleValues(6) => [-3, -2, -1, 1, 2, 3] (сумма = 0, без 0)
 */
export function generateScaleValues(count: number): number[] {
  if (count < 2) {
    // Минимум 2 опции
    return [];
  }

  const values: number[] = [];

  if (count === 2) {
    // Для 2 опций: отрицательное и положительное (без 0)
    // Сумма: -1 + 1 = 0
    values.push(-1, 1);
  } else if (count % 2 === 1) {
    // Нечётное количество: симметрично вокруг 0
    // Пример для 5: [-2, -1, 0, 1, 2] (сумма = 0)
    const half = Math.floor(count / 2);
    for (let i = -half; i <= half; i++) {
      values.push(i);
    }
  } else {
    // Чётное количество (>= 4): симметрично БЕЗ 0
    // Пример для 4: [-2, -1, 1, 2] (сумма = 0)
    // Пример для 6: [-3, -2, -1, 1, 2, 3] (сумма = 0)
    const half = count / 2;
    // Создаём симметричный ряд без 0
    for (let i = -half; i <= half; i++) {
      if (i !== 0) {
        values.push(i);
      }
    }
  }

  return values;
}

/**
 * Check if a label indicates "unknown" option
 */
export function isUnknownOption(label: string): boolean {
  const unknownPatterns = ["?", "неизвестно", "неизв", "unknown", "не знаю"];
  return unknownPatterns.some((pattern) =>
    label.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Регенерирует значения для всех опций шкалы
 *
 * @param options - Массив опций с label, countsTowardsScore, ord
 * @returns Массив опций с обновлёнными значениями
 */
export function regenerateScaleValues(options: ScaleOption[]): ScaleOption[] {
  // Фильтруем опции, которые влияют на оценку
  const scoredOptions = options
    .filter((opt) => opt.countsTowardsScore !== false)
    .sort((a, b) => a.ord - b.ord); // Сортируем по порядку

  const nonScoredOptions = options
    .filter((opt) => opt.countsTowardsScore === false)
    .sort((a, b) => a.ord - b.ord);

  if (scoredOptions.length < 2) {
    // Минимум 2 опции, влияющие на оценку
    // Если меньше, возвращаем опции без изменений (валидация на бэкенде поймает ошибку)
    return options;
  }

  // Генерируем новые значения для опций, влияющих на оценку
  const newValues = generateScaleValues(scoredOptions.length);

  // Обновляем значения для опций, влияющих на оценку
  const updatedScored = scoredOptions.map((opt, index) => ({
    ...opt,
    value: newValues[index],
  }));

  // Опции, не влияющие на оценку, получают значение больше максимального
  const maxValue = Math.max(...newValues);
  const updatedNonScored = nonScoredOptions.map((opt) => ({
    ...opt,
    value: opt.value ?? maxValue + 1, // Сохраняем текущее значение или устанавливаем max + 1
  }));

  // Объединяем и сортируем по ord
  return [...updatedScored, ...updatedNonScored].sort((a, b) => a.ord - b.ord);
}

/**
 * Create scale options from labels
 */
export function createScaleOptions(labels: string[]): ScaleOption[] {
  const options: ScaleOption[] = labels.map((label, index) => ({
    ord: index,
    label,
    value: 0, // Временное значение, будет пересчитано
    countsTowardsScore: !isUnknownOption(label),
  }));

  // Регенерируем значения для правильного распределения
  return regenerateScaleValues(options);
}

/**
 * Create default scale for YN50 block
 * Порядок: НЕТ, 50/50, ДА, ? (от отрицательного к положительному)
 */
export function createYN50Scale(): ScaleOption[] {
  const options: ScaleOption[] = [
    { label: "НЕТ", value: 0, countsTowardsScore: true, ord: 0 },
    { label: "50/50", value: 0, countsTowardsScore: true, ord: 1 },
    { label: "ДА", value: 0, countsTowardsScore: true, ord: 2 },
    { label: "?", value: 0, countsTowardsScore: false, ord: 3 },
  ];

  // Регенерируем значения для правильного распределения
  return regenerateScaleValues(options);
}

/**
 * Create default scale for 1-5 block
 */
export function create1to5Scale(labels: string[]): ScaleOption[] {
  return createScaleOptions(labels);
}
