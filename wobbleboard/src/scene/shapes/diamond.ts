import { isPointInsideRectangle, isPointOnDiamondBorder } from "../hitTest";
import type { Shape } from "./types";

export const diamondShape: Shape = {
    render(ctx, element) {
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;

        ctx.beginPath();

        ctx.moveTo(cx, element.y); // top
        ctx.lineTo(element.x + element.width, cy); // right
        ctx.lineTo(cx, element.y + element.height); // bottom
        ctx.lineTo(element.x, cy); // left

        ctx.closePath();
        ctx.stroke();
    },

    hitTest(x, y, element) {
        if (isPointOnDiamondBorder(x, y, element)) {
            return "border";
        }

        if (isPointInsideRectangle(x, y, element)) {
            return "inside";
        }

        return "none";
    },
};