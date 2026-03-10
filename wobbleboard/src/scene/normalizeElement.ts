import type { Element } from "./elements";

export function normalizeElement(el: Element) {
    const x = el.width < 0 ? el.x + el.width : el.x;
    const y = el.height < 0 ? el.y + el.height : el.y;

    return {
        ...el,
        x,
        y,
        width: Math.abs(el.width),
        height: Math.abs(el.height),
    };
}