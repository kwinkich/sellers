import type { ScaleOption } from "@/entities/scenarios/model/types/scenarios.types";

/**
 * Generate normalized values for scale options
 * 3 options: [-1, 0, 1]
 * 4 options: [-2, -1, 1, 2] 
 * 5 options: [-2, -1, 0, 1, 2]
 */
export function generateScaleValues(optionCount: number): number[] {
  if (optionCount === 3) return [-1, 0, 1];
  if (optionCount === 4) return [-2, -1, 1, 2];
  if (optionCount === 5) return [-2, -1, 0, 1, 2];
  
  // Fallback for other counts
  const center = Math.floor(optionCount / 2);
  return Array.from({ length: optionCount }, (_, i) => i - center);
}

/**
 * Check if a label indicates "unknown" option
 */
export function isUnknownOption(label: string): boolean {
  const unknownPatterns = ['?', 'неизвестно', 'неизв', 'unknown', 'не знаю'];
  return unknownPatterns.some(pattern => 
    label.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Create scale options from labels
 */
export function createScaleOptions(labels: string[]): ScaleOption[] {
  const values = generateScaleValues(labels.length);
  
  return labels.map((label, index) => ({
    ord: index,
    label,
    value: values[index],
    countsTowardsScore: !isUnknownOption(label)
  }));
}

/**
 * Create default scale for YN50 block
 */
export function createYN50Scale(): ScaleOption[] {
  return createScaleOptions(['ДА', 'НЕТ', '50/50', '?']);
}

/**
 * Create default scale for 1-5 block
 */
export function create1to5Scale(labels: string[]): ScaleOption[] {
  return createScaleOptions(labels);
}
