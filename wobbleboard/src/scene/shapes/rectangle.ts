import { isPointOnRectangleBorder } from "../hitTest";
import type { Shape } from "./types";

export const rectangleShape: Shape = {
    render(rc, element) {
        rc.rectangle(
            element.x,
            element.y,
            element.width,
            element.height,
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