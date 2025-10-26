/**
 * Typography utility functions for consistent font weight mapping
 * and typography value handling.
 */

/**
 * Maps font style names to numeric font weights.
 * Based on CSS font-weight specification.
 */
export const FONT_WEIGHT_MAP: Record<string, number> = {
  'Thin': 100,
  'Extra Light': 200,
  'ExtraLight': 200,
  'Light': 300,
  'Regular': 400,
  'Normal': 400,
  'Medium': 500,
  'Semi Bold': 600,
  'SemiBold': 600,
  'Semibold': 600,
  'Bold': 700,
  'Extra Bold': 800,
  'ExtraBold': 800,
  'Black': 900,
  'Heavy': 900,
};

/**
 * Converts a font style name to a numeric font weight.
 *
 * @param style - The font style name (e.g., "Bold", "Regular")
 * @returns The corresponding numeric font weight (100-900), defaults to 400 if not found
 */
export function getFontWeight(style: string): number {
  return FONT_WEIGHT_MAP[style] || 400;
}

/**
 * Gets a normalized line height value for comparison.
 *
 * @param lineHeight - Figma LineHeight object
 * @returns Normalized line height as number or object with value and unit
 */
export function getLineHeightValue(lineHeight: LineHeight): number | { value: number; unit: string } {
  if (lineHeight.unit === 'PIXELS') {
    return lineHeight.value;
  } else if (lineHeight.unit === 'PERCENT') {
    return { value: lineHeight.value, unit: 'PERCENT' };
  } else {
    return { value: 0, unit: 'AUTO' };
  }
}

/**
 * Gets a normalized letter spacing value for comparison.
 *
 * @param letterSpacing - Figma LetterSpacing object
 * @returns Normalized letter spacing as number or object with value and unit
 */
export function getLetterSpacingValue(letterSpacing: LetterSpacing): number | { value: number; unit: string } {
  if (letterSpacing.unit === 'PIXELS') {
    return letterSpacing.value;
  } else {
    return { value: letterSpacing.value, unit: 'PERCENT' };
  }
}
