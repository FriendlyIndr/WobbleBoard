import { normalizeElement } from "../normalizeElement";
import type { Shape } from "./types";

export const ellipseShape: Shape = {
    render(rc, _ctx, element) {
        const x = Math.min(element.x, element.x + element.width);
        const y = Math.min(element.y, element.y + element.height);

        const width = Math.abs(element.width);
        const height = Math.abs(element.height);

        const cx = x + width / 2;
        const cy = y + height / 2;

        rc.ellipse(
            cx, 
            cy, 
            width, 
            height,
            {
                roughness: 1.5,
                stroke: "black",
                strokeWidth: 2,
                seed: element.seed,
            }
        );
    },

    hitTest(x, y, element) {
        const el = normalizeElement(element);

        const rx = el.width / 2;
        const ry = el.height / 2;

        const cx = el.x + rx;
        const cy = el.y + ry;

        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;

        const distance = dx * dx + dy * dy;

        if (Math.abs(distance - 1) < 0.1) {
            return { type: "border" };
        }

        return { type: "none" };
    }
};