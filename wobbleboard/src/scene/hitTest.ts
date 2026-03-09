import type { Element, RectangleElement } from "./elements";

export function isPointOnRectangleBorder(
    x: number,
    y: number,
    rect: RectangleElement
) {
    const BORDER_THRESHOLD = 5;

    const left = rect.x;
    const right = rect.x + rect.width;
    const top = rect.y;
    const bottom = rect.y + rect.height;

    const nearLeft =
        Math.abs(x - left) <= BORDER_THRESHOLD &&
        y >= top - BORDER_THRESHOLD &&
        y <= bottom + BORDER_THRESHOLD;

    const nearRight =
        Math.abs(x - right) <= BORDER_THRESHOLD &&
        y >= top - BORDER_THRESHOLD &&
        y <= bottom + BORDER_THRESHOLD;

    const nearTop =
        Math.abs(y - top) <= BORDER_THRESHOLD &&
        x >= left - BORDER_THRESHOLD &&
        x <= right + BORDER_THRESHOLD;

    const nearBottom =
        Math.abs(y - bottom) <= BORDER_THRESHOLD &&
        x >= left - BORDER_THRESHOLD &&
        x <= right + BORDER_THRESHOLD;
    
    return nearLeft || nearRight || nearTop || nearBottom;
}

export function isPointInsideRectangle(
    x: number,
    y: number,
    rect: Element
) {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    )
}

// return (
//         x >= rect.x &&
//         x <= rect.x + rect.width &&
//         y >= rect.y &&
//         y <= rect.y + rect.height
//     )

export function getElementAtPosition(
    x: number,
    y: number,
    elements: Element[]
) {
    // Loop backwards
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];

        if (isPointOnRectangleBorder(x, y, element)) {
            return element;
        }
    }

    return null;
}