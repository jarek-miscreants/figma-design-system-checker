import {
  ColorValue,
  TypographyValue,
  StyleSuggestion,
  PaintStyleInfo,
  TextStyleInfo,
  ColorVariableInfo,
} from '../types';

// Calculate Euclidean distance between two colors in RGB space
function colorDistance(color1: ColorValue, color2: ColorValue): number {
  const rDiff = color1.r - color2.r;
  const gDiff = color1.g - color2.g;
  const bDiff = color1.b - color2.b;
  const aDiff = (color1.a - color2.a) * 255;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff + aDiff * aDiff);
}

// Check if two colors are exactly the same
function colorsMatch(color1: ColorValue, color2: ColorValue): boolean {
  return (
    color1.r === color2.r &&
    color1.g === color2.g &&
    color1.b === color2.b &&
    Math.abs(color1.a - color2.a) < 0.01
  );
}

// Normalize line height for comparison
function normalizeLineHeight(lh: number | { value: number; unit: string }): number {
  if (typeof lh === 'number') {
    return lh;
  }
  return lh.value;
}

// Normalize letter spacing for comparison
function normalizeLetterSpacing(ls: number | { value: number; unit: string }): number {
  if (typeof ls === 'number') {
    return ls;
  }
  return ls.value;
}

// Calculate similarity score for typography (0-100)
function typographyScore(typo1: TypographyValue, typo2: TypographyValue): number {
  let score = 0;
  let maxScore = 0;

  // Font family match (most important) - 50 points
  maxScore += 50;
  if (typo1.fontFamily === typo2.fontFamily) {
    score += 50;
  }

  // Font size match - 20 points
  maxScore += 20;
  if (typo1.fontSize === typo2.fontSize) {
    score += 20;
  } else {
    // Partial credit based on how close the size is
    const sizeDiff = Math.abs(typo1.fontSize - typo2.fontSize);
    // More generous scoring: full credit if within 2px, gradual decrease
    if (sizeDiff <= 2) {
      score += 20;
    } else {
      score += Math.max(0, 20 - (sizeDiff - 2) * 2);
    }
  }

  // Font weight match - 15 points
  maxScore += 15;
  if (typo1.fontWeight === typo2.fontWeight) {
    score += 15;
  } else {
    const weightDiff = Math.abs(typo1.fontWeight - typo2.fontWeight);
    // Full credit if weight difference is small (e.g., 400 vs 500)
    if (weightDiff <= 100) {
      score += 15 - (weightDiff / 100) * 5; // 15 points at 0 diff, 10 points at 100 diff
    } else {
      score += Math.max(0, 10 - (weightDiff - 100) / 100);
    }
  }

  // Line height match - 10 points
  maxScore += 10;
  const lh1 = normalizeLineHeight(typo1.lineHeight);
  const lh2 = normalizeLineHeight(typo2.lineHeight);
  if (Math.abs(lh1 - lh2) < 0.1) {
    score += 10;
  } else {
    const lhDiff = Math.abs(lh1 - lh2);
    score += Math.max(0, 10 - lhDiff / 2);
  }

  // Letter spacing match - 5 points
  maxScore += 5;
  const ls1 = normalizeLetterSpacing(typo1.letterSpacing);
  const ls2 = normalizeLetterSpacing(typo2.letterSpacing);
  if (Math.abs(ls1 - ls2) < 0.1) {
    score += 5;
  }

  return (score / maxScore) * 100;
}

// Check if two typography values match exactly
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

// Find matching color styles
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
      const maxDistance = 441.67; // Maximum possible distance in RGB space (sqrt(255^2 + 255^2 + 255^2 + 255^2))
      for (let i = 0; i < Math.min(3, distances.length); i++) {
        const { style, distance } = distances[i];
        const confidence = Math.max(0, Math.round((1 - distance / maxDistance) * 100));
        
        if (confidence > 50) { // Only suggest if confidence > 50%
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
        
        if (score > 20) { // Only suggest if score > 20% (lowered to catch size matches with different fonts)
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


