import { isPointOnRectangleBorder } from "../hitTest";
import type { Shape } from "./types";

export const rectangleShape: Shape = {
    render(rc, _ctx, element) {
        const { x, y } = element;

        const width = Math.abs(element.width);
        const height = Math.abs(element.height);

        const r = Math.min(element.width, element.height) * 0.2;

        const path = `
            M ${x + r} ${y}
            L ${x + width - r} ${y}
            A ${r} ${r} 0 0 1 ${x + width} ${y + r}
            L ${x + width} ${y + height - r}
            A ${r} ${r} 0 0 1 ${x + width - r} ${y + height}
            L ${x + r} ${y + height}
            A ${r} ${r} 0 0 1 ${x} ${y + height - r}
            L ${x} ${y + r}
            A ${r} ${r} 0 0 1 ${x + r} ${y}
            Z
        `;

        rc.path(
            path,
            {
                roughness: 1.5,
                stroke: "black",
                strokeWidth: 2,
                seed: element.seed,
            }
        );
    },

    hitTest(x, y, element) {
        if (isPointOnRectangleBorder(x, y, element)) {
            return "border";
        }

        return "none";
    }
};