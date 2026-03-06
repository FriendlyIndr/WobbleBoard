import type { Element, RectangleElement } from "./elements";

export function isPointInsideRectangle(
    x: number,
    y: number,
    rect: RectangleElement
) {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    )
}

export function getElementAtPosition(
    x: number,
    y: number,
    elements: Element[]
) {
    // Loop backwards
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];

        if (isPointInsideRectangle(x, y, element)) {
            return element;
        }
    }

    return null;
}