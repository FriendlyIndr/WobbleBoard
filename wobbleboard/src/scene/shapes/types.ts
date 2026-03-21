import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Element } from "../elements";
import type { HitType } from "../hitTest";

export type Shape = {
    render: (
        rc: RoughCanvas,
        ctx: CanvasRenderingContext2D,
        element: Element
    ) => void;

    hitTest: (
        x: number,
        y: number,
        element: Element
    ) => HitType;
};