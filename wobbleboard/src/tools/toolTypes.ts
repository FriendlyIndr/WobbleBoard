export const TOOLS = {
    selection: { type: 'selection', cursor: 'default' },
    rectangle: { type: 'rectangle', cursor: 'crosshair' },
    diamond: { type: 'diamond', cursor: 'crosshair' },
    ellipse: { type: 'ellipse', cursor: 'crosshair' }
};

export type Tool = typeof TOOLS[keyof typeof TOOLS];