import { isPointInsideRectangle } from "../hitTest";
import type { Shape } from "./types";

export const textShape: Shape = {
    render(_rc, ctx, element) {
        if (!element.text) return;

        const LINE_HEIGHT = 24;
        const BASELINE_OFFSET = 4;

        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.textBaseline = "top";

        const lines = element.text.split("\n");

        lines.forEach((line, index) => {
            ctx.fillText(line, element.x, element.y + BASELINE_OFFSET + index * LINE_HEIGHT)
        });
    },

    hitTest(x, y, element) {
        if (!element.text) return "none";

        if (isPointInsideRectangle(x, y, element)) {
            return "inside";
        }

        return "none";
    }
};