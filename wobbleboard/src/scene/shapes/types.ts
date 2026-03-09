import type { Element } from "../elements";

export type HitType = "none" | "inside" | "border";

export type Shape = {
    render: (
        ctx: CanvasRenderingContext2D,
        element: Element
    ) => void;

    hitTest: (
        x: number,
        y: number,
        element: Element
    ) => HitType;
};