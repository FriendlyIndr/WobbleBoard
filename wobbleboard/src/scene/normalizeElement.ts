import type { Element } from "./elements";

type BoxElement = Extract<
    Element,
    { type: "rectangle" | "ellipse" | "text" | "diamond" }
>;

export function normalizeElement(el: BoxElement) {
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