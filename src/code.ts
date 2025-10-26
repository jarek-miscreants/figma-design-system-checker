import { MessageToPlugin, MessageToUI, AvailableStyle } from './types';
import { analyzeSelection, collectAllPaintStyles, collectAllTextStyles, collectAllColorVariables } from './utils/analyzer';

// Show the plugin UI with larger window
figma.showUI(__html__, {
  width: 1000,
  height: 850
});

// Debounce timer for re-analysis to prevent race conditions
let analysisTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedules a re-analysis with debouncing to prevent overlapping analyses.
 * Cancels any pending analysis before scheduling a new one.
 */
function scheduleReanalysis() {
  if (analysisTimeout) {
    clearTimeout(analysisTimeout);
  }
  analysisTimeout = setTimeout(() => {
    analysisTimeout = null;
    handleAnalyze();
  }, 100);
}

/**
 * Type guard to check if a node supports variable binding.
 */
function supportsVariableBinding(node: SceneNode): node is SceneNode & {
  setBoundVariable: (field: 'fills' | 'strokes', variable: Variable, index?: number) => void;
} {
  return 'setBoundVariable' in node && typeof (node as any).setBoundVariable === 'function';
}

// Handle messages from the UI
figma.ui.onmessage = async (msg: MessageToPlugin) => {
  if (msg.type === 'analyze') {
    handleAnalyze();
  } else if (msg.type === 'connect-element') {
    await handleConnect(msg.nodeId, msg.styleId, msg.elementType, msg.paintIndex);
  } else if (msg.type === 'create-style') {
    await handleCreateStyle(msg.nodeId, msg.elementType, msg.styleName, msg.paintIndex);
  }
};

/**
 * Handles analysis request from UI.
 * Scans the current selection for unconnected design elements.
 */
async function handleAnalyze() {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      const message: MessageToUI = { type: 'no-selection' };
      figma.ui.postMessage(message);
      return;
    }

    const result = await analyzeSelection();
    
    // Collect all available styles for dropdown
    const paintStyles = await collectAllPaintStyles();
    const colorVariables = await collectAllColorVariables();
    const textStyles = await collectAllTextStyles();
    
    const availableStyles: AvailableStyle[] = [
      ...paintStyles.map(s => ({ id: s.id, name: s.name, type: 'color' as const, color: s.color })),
      ...colorVariables.map(v => ({ id: v.id, name: `🎨 ${v.name}`, type: 'color' as const, color: v.color })),
      ...textStyles.map(s => ({ id: s.id, name: s.name, type: 'typography' as const, typography: s.typography })),
    ];
    
    const message: MessageToUI = {
      type: 'analysis-result',
      elements: result.elements,
      totalNodes: result.totalNodes,
      availableStyles,
    };

    figma.ui.postMessage(message);
  } catch (error) {
    const message: MessageToUI = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
    figma.ui.postMessage(message);
  }
}

/**
 * Handles connecting an element to a style or variable.
 * Validates input parameters and applies the style/variable to the element.
 *
 * @param nodeId - The ID of the node to connect
 * @param styleId - The ID of the style or variable to apply
 * @param elementType - Whether to apply to fill, stroke, or typography
 * @param paintIndex - Optional index for fills/strokes with multiple paints
 */
async function handleConnect(
  nodeId: string,
  styleId: string,
  elementType: 'fill' | 'stroke' | 'typography',
  paintIndex?: number
) {
  try {
    const node = await figma.getNodeByIdAsync(nodeId);

    if (!node) {
      const message: MessageToUI = {
        type: 'error',
        message: 'Element not found',
      };
      figma.ui.postMessage(message);
      return;
    }

    if (elementType === 'typography') {
      // Apply text style
      if (node.type === 'TEXT') {
        await figma.loadFontAsync(node.fontName as FontName);
        await node.setTextStyleIdAsync(styleId);
      }
    } else if (elementType === 'fill') {
      // Apply fill style or variable
      if ('fills' in node && Array.isArray(node.fills)) {
        const fills = node.fills as Paint[];
        const targetIndex = paintIndex !== undefined ? paintIndex : 0;

        // Validate paint index
        if (targetIndex < 0 || targetIndex >= fills.length) {
          const message: MessageToUI = {
            type: 'error',
            message: `Invalid paint index: ${targetIndex}. Element has ${fills.length} fill(s).`,
          };
          figma.ui.postMessage(message);
          return;
        }

        // Try as paint style first
        const style = await figma.getStyleByIdAsync(styleId);
        if (style && style.type === 'PAINT') {
          await (node as MinimalFillsMixin).setFillStyleIdAsync(styleId);
        } else {
          // Try as variable
          try {
            const variable = await figma.variables.getVariableByIdAsync(styleId);
            if (variable && variable.resolvedType === 'COLOR') {
              // Bind the variable to the fill
              if (fills[targetIndex] && fills[targetIndex].type === 'SOLID') {
                if (supportsVariableBinding(node)) {
                  node.setBoundVariable('fills', variable, targetIndex);
                } else {
                  throw new Error('Node does not support variable binding');
                }
              } else {
                throw new Error('Target paint must be a solid fill');
              }
            } else {
              throw new Error('Variable not found or not a color variable');
            }
          } catch (varError) {
            const message: MessageToUI = {
              type: 'error',
              message: 'Could not connect variable: ' + (varError instanceof Error ? varError.message : 'Unknown error'),
            };
            figma.ui.postMessage(message);
            return;
          }
        }
      }
    } else if (elementType === 'stroke') {
      // Apply stroke style or variable
      if ('strokes' in node && Array.isArray(node.strokes)) {
        const strokes = node.strokes as Paint[];
        const targetIndex = paintIndex !== undefined ? paintIndex : 0;

        // Validate paint index
        if (targetIndex < 0 || targetIndex >= strokes.length) {
          const message: MessageToUI = {
            type: 'error',
            message: `Invalid paint index: ${targetIndex}. Element has ${strokes.length} stroke(s).`,
          };
          figma.ui.postMessage(message);
          return;
        }

        // Try as paint style first
        const style = await figma.getStyleByIdAsync(styleId);
        if (style && style.type === 'PAINT') {
          await (node as MinimalStrokesMixin).setStrokeStyleIdAsync(styleId);
        } else {
          // Try as variable
          try {
            const variable = await figma.variables.getVariableByIdAsync(styleId);
            if (variable && variable.resolvedType === 'COLOR') {
              // Bind the variable to the stroke
              if (strokes[targetIndex] && strokes[targetIndex].type === 'SOLID') {
                if (supportsVariableBinding(node)) {
                  node.setBoundVariable('strokes', variable, targetIndex);
                } else {
                  throw new Error('Node does not support variable binding');
                }
              } else {
                throw new Error('Target paint must be a solid stroke');
              }
            } else {
              throw new Error('Variable not found or not a color variable');
            }
          } catch (varError) {
            const message: MessageToUI = {
              type: 'error',
              message: 'Could not connect variable: ' + (varError instanceof Error ? varError.message : 'Unknown error'),
            };
            figma.ui.postMessage(message);
            return;
          }
        }
      }
    }

    const message: MessageToUI = {
      type: 'connection-success',
      nodeId,
    };
    figma.ui.postMessage(message);

    // Re-analyze to update the list (with debouncing)
    scheduleReanalysis();
  } catch (error) {
    const message: MessageToUI = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to connect element',
    };
    figma.ui.postMessage(message);
  }
}

/**
 * Handles creating a new style from an element's properties.
 * Creates a paint style or text style and applies it to the source element.
 *
 * @param nodeId - The ID of the node to create a style from
 * @param elementType - Whether to create a fill, stroke, or typography style
 * @param styleName - The name for the new style
 * @param paintIndex - Optional index for fills/strokes with multiple paints
 */
async function handleCreateStyle(
  nodeId: string,
  elementType: 'fill' | 'stroke' | 'typography',
  styleName: string,
  paintIndex?: number
) {
  try {
    // Validate style name
    if (!styleName || styleName.trim() === '') {
      const message: MessageToUI = {
        type: 'error',
        message: 'Style name cannot be empty',
      };
      figma.ui.postMessage(message);
      return;
    }

    const node = await figma.getNodeByIdAsync(nodeId);

    if (!node) {
      const message: MessageToUI = {
        type: 'error',
        message: 'Element not found',
      };
      figma.ui.postMessage(message);
      return;
    }

    if (elementType === 'typography') {
      // Create text style
      if (node.type === 'TEXT') {
        const textNode = node as TextNode;
        const newStyle = figma.createTextStyle();
        newStyle.name = styleName;
        
        // Copy properties from the text node
        await figma.loadFontAsync(textNode.fontName as FontName);
        newStyle.fontName = textNode.fontName as FontName;
        newStyle.fontSize = textNode.fontSize as number;
        newStyle.lineHeight = textNode.lineHeight as LineHeight;
        newStyle.letterSpacing = textNode.letterSpacing as LetterSpacing;
        newStyle.paragraphSpacing = textNode.paragraphSpacing;
        
        // Only set textCase and textDecoration if not mixed
        if (textNode.textCase !== figma.mixed) {
          newStyle.textCase = textNode.textCase;
        }
        if (textNode.textDecoration !== figma.mixed) {
          newStyle.textDecoration = textNode.textDecoration;
        }
        
        // Apply the new style to the text node
        await textNode.setTextStyleIdAsync(newStyle.id);
      }
    } else if (elementType === 'fill') {
      // Create paint style for fill
      if ('fills' in node && Array.isArray(node.fills)) {
        const fills = node.fills as Paint[];
        const targetIndex = paintIndex !== undefined ? paintIndex : 0;

        // Validate paint index
        if (targetIndex < 0 || targetIndex >= fills.length) {
          const message: MessageToUI = {
            type: 'error',
            message: `Invalid paint index: ${targetIndex}. Element has ${fills.length} fill(s).`,
          };
          figma.ui.postMessage(message);
          return;
        }

        if (fills[targetIndex] && fills[targetIndex].type === 'SOLID') {
          const newStyle = figma.createPaintStyle();
          newStyle.name = styleName;
          newStyle.paints = [fills[targetIndex]];

          // Apply the new style to the node
          await (node as MinimalFillsMixin).setFillStyleIdAsync(newStyle.id);
        } else {
          const message: MessageToUI = {
            type: 'error',
            message: 'Can only create styles from solid fills',
          };
          figma.ui.postMessage(message);
          return;
        }
      }
    } else if (elementType === 'stroke') {
      // Create paint style for stroke
      if ('strokes' in node && Array.isArray(node.strokes)) {
        const strokes = node.strokes as Paint[];
        const targetIndex = paintIndex !== undefined ? paintIndex : 0;

        // Validate paint index
        if (targetIndex < 0 || targetIndex >= strokes.length) {
          const message: MessageToUI = {
            type: 'error',
            message: `Invalid paint index: ${targetIndex}. Element has ${strokes.length} stroke(s).`,
          };
          figma.ui.postMessage(message);
          return;
        }

        if (strokes[targetIndex] && strokes[targetIndex].type === 'SOLID') {
          const newStyle = figma.createPaintStyle();
          newStyle.name = styleName;
          newStyle.paints = [strokes[targetIndex]];

          // Apply the new style to the node
          await (node as MinimalStrokesMixin).setStrokeStyleIdAsync(newStyle.id);
        } else {
          const message: MessageToUI = {
            type: 'error',
            message: 'Can only create styles from solid strokes',
          };
          figma.ui.postMessage(message);
          return;
        }
      }
    }

    const message: MessageToUI = {
      type: 'style-created',
      nodeId,
      styleName,
    };
    figma.ui.postMessage(message);

    // Re-analyze to update the list (with debouncing)
    scheduleReanalysis();
  } catch (error) {
    const message: MessageToUI = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to create style',
    };
    figma.ui.postMessage(message);
  }
}

