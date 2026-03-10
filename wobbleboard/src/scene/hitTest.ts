import type { Element } from "./elements";
import { SHAPES } from "./shapes";

export type HitType = 
    | "none"
    | "inside"
    | "border"
    | "resize";

export type HitResult = {
    type: HitType;
    element: Element | null;
};

export function distanceToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
        return Math.hypot(px - x1, py - y1);
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;

    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.hypot(px - projX, py - projY);
}

export function isPointOnPolygon(
    x: number,
    y: number,
    points: { x: number, y: number }[],
    threshold = 8
) {
    const count = points.length;

    for (let i = 0; i < count; i++) {
        const a = points[i];
        const b = points[(i + 1) % count];

        const dist = distanceToSegment(
            x,
            y,
            a.x,
            a.y,
            b.x,
            b.y
        );

        if (dist <= threshold) {
            return true;
        }
    }

    return false;
}

export function isPointOnDiamondBorder(
    x: number,
    y: number,
    element: Element
) {
    const cx = element.x + element.width / 2;
    const cy = element.y + element.height / 2;

    const points = [
        { x: cx, y: element.y },
        { x: element.x + element.width, y: cy },
        { x: cx, y: element.y + element.height },
        { x: element.x, y: cy },
    ];

    return isPointOnPolygon(x, y, points);
}

export function isPointOnRectangleBorder(
    x: number,
    y: number,
    rect: Element
) {
    const points = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height },
    ];
    
    return isPointOnPolygon(x, y, points);
}

export function isPointInsideRectangle(
    x: number,
    y: number,
    rect: Element
) {
    const left = Math.min(rect.x, rect.x + rect.width);
    const right = Math.max(rect.x, rect.x + rect.width);
    const top = Math.min(rect.y, rect.y + rect.height);
    const bottom = Math.max(rect.y, rect.y + rect.height);

    return (
        x >= left &&
        x <= right &&
        y >= top &&
        y <= bottom
    );
}

export function hitTest(
    x: number,
    y: number,
    elements: Element[],
    selectedIds: Set<string>,
): HitResult {
    // Loop backwards
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        const shape = SHAPES[element.type];

        const isSelected = selectedIds.has(element.id);

        if (isSelected) {
            if (isPointInsideRectangle(x, y, element)) {
                return { type: "inside", element };
            }
        }

        const result = shape.hitTest(x, y, element);

        if (result !== "none") {
            return { type: result, element };
        }
    }

    return { type: "none", element: null };
}