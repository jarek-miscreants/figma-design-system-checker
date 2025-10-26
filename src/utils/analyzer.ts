import {
  UnconnectedElement,
  ColorValue,
  TypographyValue,
  PaintStyleInfo,
  TextStyleInfo,
  ColorVariableInfo,
} from '../types';
import { findMatchingStyles } from './matcher';
import { getFontWeight, getLineHeightValue, getLetterSpacingValue } from './typography';

/**
 * Converts Figma RGB/RGBA color to our ColorValue format.
 * Figma uses 0-1 range, we convert to 0-255.
 *
 * @param color - Figma RGB or RGBA color object
 * @returns ColorValue with r, g, b in 0-255 range and alpha 0-1
 */
function figmaColorToValue(color: RGB | RGBA): ColorValue {
  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255),
    a: 'a' in color ? color.a : 1,
  };
}

// Collect all paint styles from the document
export async function collectAllPaintStyles(): Promise<PaintStyleInfo[]> {
  const paintStyles: PaintStyleInfo[] = [];
  const localStyles = await figma.getLocalPaintStylesAsync();

  for (const style of localStyles) {
    const paints = style.paints;
    if (paints.length > 0 && paints[0].type === 'SOLID') {
      const solidPaint = paints[0] as SolidPaint;
      paintStyles.push({
        id: style.id,
        name: style.name,
        color: figmaColorToValue(solidPaint.color),
      });
    }
  }

  return paintStyles;
}

// Collect all text styles from the document
export async function collectAllTextStyles(): Promise<TextStyleInfo[]> {
  const textStyles: TextStyleInfo[] = [];
  const localStyles = await figma.getLocalTextStylesAsync();

  for (const style of localStyles) {
    textStyles.push({
      id: style.id,
      name: style.name,
      typography: {
        fontFamily: style.fontName.family,
        fontSize: style.fontSize as number,
        fontWeight: getFontWeight(style.fontName.style),
        lineHeight: getLineHeightValue(style.lineHeight),
        letterSpacing: getLetterSpacingValue(style.letterSpacing),
      },
    });
  }

  return textStyles;
}

// Collect all color variables from the document
export async function collectAllColorVariables(): Promise<ColorVariableInfo[]> {
  const colorVariables: ColorVariableInfo[] = [];
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  for (const collection of collections) {
    const variablePromises = collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id));
    const variables = (await Promise.all(variablePromises)).filter(v => v !== null) as Variable[];
    
    for (const variable of variables) {
      if (variable.resolvedType === 'COLOR') {
        // Get the first mode's value
        const modeId = Object.keys(variable.valuesByMode)[0];
        const value = variable.valuesByMode[modeId];
        
        if (typeof value === 'object' && 'r' in value) {
          colorVariables.push({
            id: variable.id,
            name: variable.name,
            color: figmaColorToValue(value as RGBA),
          });
        }
      }
    }
  }

  return colorVariables;
}

// Build layer path for better identification
function buildLayerPath(node: SceneNode): string {
  const path: string[] = [];
  let current: BaseNode | null = node;

  while (current && current.type !== 'PAGE') {
    if ('name' in current) {
      path.unshift(current.name);
    }
    current = current.parent;
  }

  return path.join(' > ');
}

// Check if a paint is bound to a style or variable
function isPaintBound(node: SceneNode, paintType: 'fills' | 'strokes', index: number): boolean {
  // Check for style binding
  if (paintType === 'fills' && 'fillStyleId' in node) {
    const styleId = node.fillStyleId;
    if (typeof styleId === 'string' && styleId !== '') {
      return true;
    }
  }
  if (paintType === 'strokes' && 'strokeStyleId' in node) {
    const styleId = node.strokeStyleId;
    if (typeof styleId === 'string' && styleId !== '') {
      return true;
    }
  }

  // Check for variable binding
  try {
    const boundVariables = (node as any).boundVariables;
    if (boundVariables && boundVariables[paintType]) {
      const paintBindings = boundVariables[paintType];
      if (Array.isArray(paintBindings) && paintBindings[index]) {
        return true;
      }
    }
  } catch (e) {
    // Variable binding not supported or error
  }

  return false;
}

// Scan for unconnected color elements (fills and strokes)
export function scanColorElements(
  nodes: readonly SceneNode[],
  paintStyles: PaintStyleInfo[],
  colorVariables: ColorVariableInfo[]
): UnconnectedElement[] {
  const unconnectedElements: UnconnectedElement[] = [];
  const allColorStyles = [...paintStyles, ...colorVariables];

  function traverse(node: SceneNode) {
    // Check fills
    if ('fills' in node && Array.isArray(node.fills)) {
      const fills = node.fills as Paint[];
      fills.forEach((fill, index) => {
        if (fill.type === 'SOLID' && fill.visible !== false) {
          if (!isPaintBound(node, 'fills', index)) {
            const color = figmaColorToValue(fill.color);
            const suggestions = findMatchingStyles(color, allColorStyles, 'color');
            
            unconnectedElements.push({
              id: node.id,
              name: node.name,
              type: 'fill',
              layerPath: buildLayerPath(node),
              currentValue: color,
              suggestions,
              paintIndex: index,
            });
          }
        }
      });
    }

    // Check strokes
    if ('strokes' in node && Array.isArray(node.strokes)) {
      const strokes = node.strokes as Paint[];
      strokes.forEach((stroke, index) => {
        if (stroke.type === 'SOLID' && stroke.visible !== false) {
          if (!isPaintBound(node, 'strokes', index)) {
            const color = figmaColorToValue(stroke.color);
            const suggestions = findMatchingStyles(color, allColorStyles, 'color');
            
            unconnectedElements.push({
              id: node.id,
              name: node.name,
              type: 'stroke',
              layerPath: buildLayerPath(node),
              currentValue: color,
              suggestions,
              paintIndex: index,
            });
          }
        }
      });
    }

    // Recursively traverse children
    if ('children' in node) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return unconnectedElements;
}

// Scan for unconnected typography elements
export function scanTypographyElements(
  nodes: readonly SceneNode[],
  textStyles: TextStyleInfo[]
): UnconnectedElement[] {
  const unconnectedElements: UnconnectedElement[] = [];

  function traverse(node: SceneNode) {
    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      
      // Check if text style is applied
      if (textNode.textStyleId === '' || !textNode.textStyleId) {
        // Text is not bound to a style
        const fontName = textNode.fontName !== figma.mixed ? textNode.fontName : { family: 'Mixed', style: 'Regular' };
        const fontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 12;
        const lineHeight = textNode.lineHeight !== figma.mixed ? textNode.lineHeight : { unit: 'AUTO', value: 0 };
        const letterSpacing = textNode.letterSpacing !== figma.mixed ? textNode.letterSpacing : { unit: 'PIXELS', value: 0 };

        const typography: TypographyValue = {
          fontFamily: fontName.family,
          fontSize: fontSize as number,
          fontWeight: getFontWeight(fontName.style),
          lineHeight: getLineHeightValue(lineHeight as LineHeight),
          letterSpacing: getLetterSpacingValue(letterSpacing as LetterSpacing),
        };

        const suggestions = findMatchingStyles(typography, textStyles, 'typography');

        unconnectedElements.push({
          id: node.id,
          name: node.name,
          type: 'typography',
          layerPath: buildLayerPath(node),
          currentValue: typography,
          suggestions,
        });
      }
    }

    // Recursively traverse children
    if ('children' in node) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return unconnectedElements;
}

// Main analysis function
export async function analyzeSelection(): Promise<{ elements: UnconnectedElement[]; totalNodes: number }> {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return { elements: [], totalNodes: 0 };
  }

  // Collect all styles and variables
  const paintStyles = await collectAllPaintStyles();
  const textStyles = await collectAllTextStyles();
  const colorVariables = await collectAllColorVariables();

  // Scan for unconnected elements
  const colorElements = scanColorElements(selection, paintStyles, colorVariables);
  const typographyElements = scanTypographyElements(selection, textStyles);

  const allElements = [...colorElements, ...typographyElements];

  // Count total nodes for statistics
  let totalNodes = 0;
  function countNodes(node: SceneNode) {
    totalNodes++;
    if ('children' in node) {
      for (const child of node.children) {
        countNodes(child);
      }
    }
  }
  for (const node of selection) {
    countNodes(node);
  }

  return { elements: allElements, totalNodes };
}

