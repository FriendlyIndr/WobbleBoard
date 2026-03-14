import { isPointInsideRectangle } from "../hitTest";
import type { Shape } from "./types";

export const textShape: Shape = {
    render(_rc, ctx, element) {
        if (!element.text) return;

        ctx.font = "20px sans-serif";
        ctx.fillStyle = "black";
        ctx.textBaseline = "top";

        ctx.fillText(element.text, element.x, element.y);
    },

    hitTest(x, y, element) {
        if (!element.text) return "none";

        if (isPointInsideRectangle(x, y, element)) {
            return "inside";
        }

        return "none";
    }
};