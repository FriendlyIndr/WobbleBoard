import { isPointOnDiamondBorder } from "../hitTest";
import type { Shape } from "./types";

export const diamondShape: Shape = {
    render(rc, _ctx, element) {
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;

        rc.polygon(
            [
                [cx, element.y], // top
                [element.x + element.width, cy], // right
                [cx, element.y + element.height], // bottom
                [element.x, cy] // left
            ],
            {
                roughness: 1.5,
                stroke: "black",
                strokeWidth: 2,
                bowing: 1,
                seed: element.seed,
            }
        );
    },

    hitTest(x, y, element) {
        if (isPointOnDiamondBorder(x, y, element)) {
            return "border";
        }

        return "none";
    },
};