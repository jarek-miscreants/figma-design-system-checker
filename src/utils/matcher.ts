import {
  ColorValue,
  TypographyValue,
  StyleSuggestion,
  PaintStyleInfo,
  TextStyleInfo,
  ColorVariableInfo,
} from '../types';

// Constants for matching thresholds
const MAX_RGB_DISTANCE = Math.sqrt(255 * 255 * 4); // ~510, maximum distance in RGBA space
const MIN_COLOR_CONFIDENCE = 50; // Minimum confidence percentage to suggest color matches
const MIN_TYPOGRAPHY_SCORE = 20; // Minimum score percentage to suggest typography matches

// Typography scoring weights (must sum to 100)
const WEIGHT_FONT_FAMILY = 50;
const WEIGHT_FONT_SIZE = 20;
const WEIGHT_FONT_WEIGHT = 15;
const WEIGHT_LINE_HEIGHT = 10;
const WEIGHT_LETTER_SPACING = 5;

/**
 * Calculates Euclidean distance between two colors in RGBA space.
 * Alpha channel is normalized to 0-255 range for consistent weighting.
 *
 * @param color1 - First color to compare
 * @param color2 - Second color to compare
 * @returns Distance value (0 = identical colors, ~510 = maximum difference)
 */
function colorDistance(color1: ColorValue, color2: ColorValue): number {
  const rDiff = color1.r - color2.r;
  const gDiff = color1.g - color2.g;
  const bDiff = color1.b - color2.b;
  const aDiff = (color1.a - color2.a) * 255;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff + aDiff * aDiff);
}

/**
 * Checks if two colors are exactly the same.
 * Uses a small epsilon for alpha comparison to handle floating point precision.
 *
 * @param color1 - First color to compare
 * @param color2 - Second color to compare
 * @returns True if colors match exactly
 */
function colorsMatch(color1: ColorValue, color2: ColorValue): boolean {
  return (
    color1.r === color2.r &&
    color1.g === color2.g &&
    color1.b === color2.b &&
    Math.abs(color1.a - color2.a) < 0.01
  );
}

/**
 * Normalizes line height value for comparison.
 * Handles both numeric values and objects with value/unit properties.
 *
 * @param lh - Line height value or object
 * @returns Normalized numeric value
 */
function normalizeLineHeight(lh: number | { value: number; unit: string }): number {
  if (typeof lh === 'number') {
    return lh;
  }
  return lh.value;
}

/**
 * Normalizes letter spacing value for comparison.
 * Handles both numeric values and objects with value/unit properties.
 *
 * @param ls - Letter spacing value or object
 * @returns Normalized numeric value
 */
function normalizeLetterSpacing(ls: number | { value: number; unit: string }): number {
  if (typeof ls === 'number') {
    return ls;
  }
  return ls.value;
}

/**
 * Calculates similarity score for typography styles.
 * Uses weighted scoring: family (50%), size (20%), weight (15%), height (10%), spacing (5%).
 *
 * @param typo1 - First typography value to compare
 * @param typo2 - Second typography value to compare
 * @returns Similarity score from 0-100 (100 = perfect match)
 */
function typographyScore(typo1: TypographyValue, typo2: TypographyValue): number {
  let score = 0;
  let maxScore = 0;

  // Font family match (most important)
  maxScore += WEIGHT_FONT_FAMILY;
  if (typo1.fontFamily === typo2.fontFamily) {
    score += WEIGHT_FONT_FAMILY;
  }

  // Font size match
  maxScore += WEIGHT_FONT_SIZE;
  if (typo1.fontSize === typo2.fontSize) {
    score += WEIGHT_FONT_SIZE;
  } else {
    // Partial credit based on how close the size is
    const sizeDiff = Math.abs(typo1.fontSize - typo2.fontSize);
    // More generous scoring: full credit if within 2px, gradual decrease
    if (sizeDiff <= 2) {
      score += WEIGHT_FONT_SIZE;
    } else {
      score += Math.max(0, WEIGHT_FONT_SIZE - (sizeDiff - 2) * 2);
    }
  }

  // Font weight match
  maxScore += WEIGHT_FONT_WEIGHT;
  if (typo1.fontWeight === typo2.fontWeight) {
    score += WEIGHT_FONT_WEIGHT;
  } else {
    const weightDiff = Math.abs(typo1.fontWeight - typo2.fontWeight);
    // Full credit if weight difference is small (e.g., 400 vs 500)
    if (weightDiff <= 100) {
      score += WEIGHT_FONT_WEIGHT - (weightDiff / 100) * 5; // 15 points at 0 diff, 10 points at 100 diff
    } else {
      score += Math.max(0, 10 - (weightDiff - 100) / 100);
    }
  }

  // Line height match
  maxScore += WEIGHT_LINE_HEIGHT;
  const lh1 = normalizeLineHeight(typo1.lineHeight);
  const lh2 = normalizeLineHeight(typo2.lineHeight);
  if (Math.abs(lh1 - lh2) < 0.1) {
    score += WEIGHT_LINE_HEIGHT;
  } else {
    const lhDiff = Math.abs(lh1 - lh2);
    score += Math.max(0, WEIGHT_LINE_HEIGHT - lhDiff / 2);
  }

  // Letter spacing match
  maxScore += WEIGHT_LETTER_SPACING;
  const ls1 = normalizeLetterSpacing(typo1.letterSpacing);
  const ls2 = normalizeLetterSpacing(typo2.letterSpacing);
  if (Math.abs(ls1 - ls2) < 0.1) {
    score += WEIGHT_LETTER_SPACING;
  }

  return (score / maxScore) * 100;
}

/**
 * Checks if two typography values match exactly.
 * Uses epsilon comparison for line height and letter spacing to handle floating point precision.
 *
 * @param typo1 - First typography value to compare
 * @param typo2 - Second typography value to compare
 * @returns True if typography values match exactly
 */
function typographyMatches(typo1: TypographyValue, typo2: TypographyValue): boolean {
  const lh1 = normalizeLineHeight(typo1.lineHeight);
  const lh2 = normalizeLineHeight(typo2.lineHeight);
  const ls1 = normalizeLetterSpacing(typo1.letterSpacing);
  const ls2 = normalizeLetterSpacing(typo2.letterSpacing);

  return (
    typo1.fontFamily === typo2.fontFamily &&
    typo1.fontSize === typo2.fontSize &&
    typo1.fontWeight === typo2.fontWeight &&
    Math.abs(lh1 - lh2) < 0.1 &&
    Math.abs(ls1 - ls2) < 0.1
  );
}

/**
 * Finds matching styles for a given color or typography value.
 * Returns top 3 suggestions with confidence scores.
 * For exact matches, confidence is 100%. For closest matches, uses distance/similarity algorithms.
 *
 * @param value - The color or typography value to match
 * @param styles - Available styles to match against
 * @param type - Whether matching 'color' or 'typography'
 * @returns Array of style suggestions sorted by confidence (best first)
 */
export function findMatchingStyles(
  value: ColorValue | TypographyValue,
  styles: (PaintStyleInfo | TextStyleInfo | ColorVariableInfo)[],
  type: 'color' | 'typography'
): StyleSuggestion[] {
  const suggestions: StyleSuggestion[] = [];

  if (type === 'color') {
    const colorValue = value as ColorValue;
    const colorStyles = styles as (PaintStyleInfo | ColorVariableInfo)[];

    // First, find exact matches
    for (const style of colorStyles) {
      if (colorsMatch(colorValue, style.color)) {
        suggestions.push({
          styleId: style.id,
          styleName: style.name,
          matchType: 'exact',
          confidence: 100,
          styleValue: style.color,
        });
      }
    }

    // If no exact match, find closest matches
    if (suggestions.length === 0) {
      const distances = colorStyles.map(style => ({
        style,
        distance: colorDistance(colorValue, style.color),
      }));

      // Sort by distance (closest first)
      distances.sort((a, b) => a.distance - b.distance);

      // Take top 3 closest matches
      for (let i = 0; i < Math.min(3, distances.length); i++) {
        const { style, distance } = distances[i];
        const confidence = Math.max(0, Math.round((1 - distance / MAX_RGB_DISTANCE) * 100));

        if (confidence > MIN_COLOR_CONFIDENCE) {
          suggestions.push({
            styleId: style.id,
            styleName: style.name,
            matchType: 'closest',
            confidence,
            styleValue: style.color,
          });
        }
      }
    }
  } else {
    // Typography matching
    const typoValue = value as TypographyValue;
    const textStyles = styles as TextStyleInfo[];

    // First, find exact matches
    for (const style of textStyles) {
      if (typographyMatches(typoValue, style.typography)) {
        suggestions.push({
          styleId: style.id,
          styleName: style.name,
          matchType: 'exact',
          confidence: 100,
          styleValue: style.typography,
        });
      }
    }

    // If no exact match, find closest matches
    if (suggestions.length === 0) {
      const scores = textStyles.map(style => ({
        style,
        score: typographyScore(typoValue, style.typography),
      }));

      // Sort by score (highest first)
      scores.sort((a, b) => b.score - a.score);

      // Take top 3 closest matches
      for (let i = 0; i < Math.min(3, scores.length); i++) {
        const { style, score } = scores[i];

        if (score > MIN_TYPOGRAPHY_SCORE) {
          suggestions.push({
            styleId: style.id,
            styleName: style.name,
            matchType: 'closest',
            confidence: Math.round(score),
            styleValue: style.typography,
          });
        }
      }
    }
  }

  return suggestions;
}


