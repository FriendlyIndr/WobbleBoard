import { isPointInsideRectangle, isPointOnRectangleBorder } from "../hitTest";
import type { Shape } from "./types";

export const rectangleShape: Shape = {
    render(ctx, element) {
        ctx.strokeRect(
            element.x,
            element.y,
            element.width,
            element.height
        );
    },

    hitTest(x, y, element) {
        if (isPointOnRectangleBorder(x, y, element)) {
            return "border";
        }

        if (isPointInsideRectangle(x, y, element)) {
            return "inside";
        }

        return "none";
    }
};