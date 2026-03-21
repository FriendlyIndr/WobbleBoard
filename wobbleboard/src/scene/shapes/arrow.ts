import type { RoughCanvas } from "roughjs/bin/canvas";
import { distanceToSegment } from "../hitTest";
import type { Shape } from "./types";

export const arrowShape: Shape = {
    render(rc, _ctx, element) {
        const x1 = element.x;
        const y1 = element.y;

        const x2 = element.x + element.width;
        const y2 = element.y + element.height;

        rc.line(x1, y1, x2, y2, {
            roughness: 1.5,
            stroke: "black",
            strokeWidth: 2,
            seed: element.seed,
        });

        drawArrowhead(rc, x1, y1, x2, y2, element.seed);
    },

    hitTest(x, y, element) {
        const x1 = element.x;
        const y1 = element.y;
        const x2 = element.x + element.width;
        const y2 = element.y + element.height;

        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        const HANDLE_SIZE = 8;

        // Check handles
        if (distance(x, y, x1, y1) < HANDLE_SIZE) {
            return { type: "resize", handle: "start" };
        }

        if (distance(x, y, x2, y2) < HANDLE_SIZE) {
            return { type: "resize", handle: "end" };
        }

        if (distance(x, y, mx, my) < HANDLE_SIZE) {
            return { type: "resize", handle: "middle" };
        }

        const dist = distanceToSegment(x, y, x1, y1, x2, y2);

        if (dist < 8) {
            return { type: "border" };
        }

        return { type: "none" };
    }
};

function drawArrowhead(
    rc: RoughCanvas, 
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number,
    seed: number,
) {
    const angle = Math.atan2(y2 - y1, x2 - x1);

    const size = 15;

    const leftX = x2 - size * Math.cos(angle - Math.PI / 6);
    const leftY = y2 - size * Math.sin(angle - Math.PI / 6);

    const rightX = x2 - size * Math.cos(angle + Math.PI / 6);
    const rightY = y2 - size * Math.sin(angle + Math.PI / 6);

    rc.line(x2, y2, leftX, leftY, {
        seed: seed,
    });
    rc.line(x2, y2, rightX, rightY, {
        seed: seed,
    });
}

function distance(x1: number, y1: number, x2: number, y2: number) {
    return (
        Math.hypot(Math.abs(x1 - x2), Math.abs(y1 - y2))
    )
}