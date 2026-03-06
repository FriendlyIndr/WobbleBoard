export type SelectionTool = {
    type: "selection",
    cursor: 'default'
};

export const selectionTool : SelectionTool = {
    type: 'selection',
    cursor: 'default'
}

export type RectangleTool = {
    type: 'rectangle',
    cursor: 'crosshair'
};

export const rectangleTool : RectangleTool = {
    type: 'rectangle',
    cursor: 'crosshair'
}

export type Tool = SelectionTool | RectangleTool;