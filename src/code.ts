import { MessageToPlugin, MessageToUI, AvailableStyle } from './types';
import { analyzeSelection, collectAllPaintStyles, collectAllTextStyles, collectAllColorVariables } from './utils/analyzer';

// Show the plugin UI with larger window
figma.showUI(__html__, { 
  width: 1000, 
  height: 850
});

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

// Handle analyze request
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

// Handle connect element request
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
        // Try as paint style first
        const style = await figma.getStyleByIdAsync(styleId);
        if (style && style.type === 'PAINT') {
          await (node as MinimalFillsMixin).setFillStyleIdAsync(styleId);
        } else {
          // Try as variable
          try {
            const variable = await figma.variables.getVariableByIdAsync(styleId);
            if (variable && variable.resolvedType === 'COLOR') {
              const fills = node.fills as Paint[];
              const targetIndex = paintIndex !== undefined ? paintIndex : 0;
              
              // Bind the variable to the fill
              if (fills[targetIndex] && fills[targetIndex].type === 'SOLID') {
                (node as any).setBoundVariable('fills', variable, targetIndex);
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
        // Try as paint style first
        const style = await figma.getStyleByIdAsync(styleId);
        if (style && style.type === 'PAINT') {
          await (node as MinimalStrokesMixin).setStrokeStyleIdAsync(styleId);
        } else {
          // Try as variable
          try {
            const variable = await figma.variables.getVariableByIdAsync(styleId);
            if (variable && variable.resolvedType === 'COLOR') {
              const strokes = node.strokes as Paint[];
              const targetIndex = paintIndex !== undefined ? paintIndex : 0;
              
              // Bind the variable to the stroke
              if (strokes[targetIndex] && strokes[targetIndex].type === 'SOLID') {
                (node as any).setBoundVariable('strokes', variable, targetIndex);
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

    // Re-analyze to update the list
    setTimeout(() => handleAnalyze(), 100);
  } catch (error) {
    const message: MessageToUI = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to connect element',
    };
    figma.ui.postMessage(message);
  }
}

// Handle create style request
async function handleCreateStyle(
  nodeId: string,
  elementType: 'fill' | 'stroke' | 'typography',
  styleName: string,
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
        
        if (fills[targetIndex] && fills[targetIndex].type === 'SOLID') {
          const newStyle = figma.createPaintStyle();
          newStyle.name = styleName;
          newStyle.paints = [fills[targetIndex]];
          
          // Apply the new style to the node
          await (node as MinimalFillsMixin).setFillStyleIdAsync(newStyle.id);
        }
      }
    } else if (elementType === 'stroke') {
      // Create paint style for stroke
      if ('strokes' in node && Array.isArray(node.strokes)) {
        const strokes = node.strokes as Paint[];
        const targetIndex = paintIndex !== undefined ? paintIndex : 0;
        
        if (strokes[targetIndex] && strokes[targetIndex].type === 'SOLID') {
          const newStyle = figma.createPaintStyle();
          newStyle.name = styleName;
          newStyle.paints = [strokes[targetIndex]];
          
          // Apply the new style to the node
          await (node as MinimalStrokesMixin).setStrokeStyleIdAsync(newStyle.id);
        }
      }
    }

    const message: MessageToUI = {
      type: 'style-created',
      nodeId,
      styleName,
    };
    figma.ui.postMessage(message);

    // Re-analyze to update the list
    setTimeout(() => handleAnalyze(), 100);
  } catch (error) {
    const message: MessageToUI = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to create style',
    };
    figma.ui.postMessage(message);
  }
}

