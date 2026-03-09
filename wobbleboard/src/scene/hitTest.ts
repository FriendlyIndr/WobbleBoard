import type { Element, RectangleElement } from "./elements";

export type HitType = 
    | "none"
    | "inside"
    | "border"
    | "resize";

export type HitResult = {
    type: HitType;
    element: Element | null;
};


export function isPointOnRectangleBorder(
    x: number,
    y: number,
    rect: RectangleElement
) {
    const BORDER_THRESHOLD = 8;

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
    );
}

export function hitTest(
    x: number,
    y: number,
    elements: Element[]
): HitResult {
    // Loop backwards
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];

        if (isPointOnRectangleBorder(x, y, element)) {
            return { type: "border", element };
        }

        if (isPointInsideRectangle(x, y, element)) {
            return { type: "inside", element };
        }
    }

    return { type: "none", element: null };
}