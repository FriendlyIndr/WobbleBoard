export const TOOLS = {
    selection: { type: 'selection', cursor: 'default' },
    rectangle: { type: 'rectangle', cursor: 'crosshair' }
};

export type Tool = typeof TOOLS[keyof typeof TOOLS];