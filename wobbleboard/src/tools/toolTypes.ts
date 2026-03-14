export const TOOLS = {
    selection: { type: 'selection', cursor: 'default' },
    rectangle: { type: 'rectangle', cursor: 'crosshair' },
    diamond: { type: 'diamond', cursor: 'crosshair' },
    ellipse: { type: 'ellipse', cursor: 'crosshair' },
    arrow: { type: 'arrow', cursor: 'crosshair' },
    text: { type: 'text', cursor: 'crosshair' },
    eraser: { type: 'eraser', cursor: 'none' },
} as const;

export type Tool = typeof TOOLS[keyof typeof TOOLS];