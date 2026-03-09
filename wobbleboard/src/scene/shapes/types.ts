import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Element } from "../elements";

export type HitType = "none" | "inside" | "border";

export type Shape = {
    render: (
        rc: RoughCanvas,
        element: Element
    ) => void;

    hitTest: (
        x: number,
        y: number,
        element: Element
    ) => HitType;
};