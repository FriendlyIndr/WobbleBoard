import type { Element } from "../scene/elements";
import { SHAPES } from "../scene/shapes";
import rough from "roughjs";

export function renderScene(
    ctx: CanvasRenderingContext2D, 
    elements: Element[], 
    canvas: HTMLCanvasElement, 
    selectedIds: Set<string>,
    selectionBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null
) {
    const rc = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
        const shape = SHAPES[element.type];

        shape.render(rc, ctx, element);

        if (selectedIds.has(element.id)) {
            drawSelection(ctx, element);
        }
    });

    if (selectionBox) {
        ctx.save();
        ctx.setLineDash([5, 5]);

        ctx.strokeRect(
            selectionBox.x,
            selectionBox.y,
            selectionBox.width,
            selectionBox.height
        );

        ctx.restore();
    }
}

function drawSelection(ctx: CanvasRenderingContext2D, element: Element) {
    ctx.save();

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;

    const PADDING = 6;

    const { x, y, width, height } = getElementBounds(element);

    ctx.strokeRect(
        x - PADDING,
        y - PADDING,
        width + PADDING * 2,
        height + PADDING * 2
    );

    drawHandle(ctx, x  - PADDING, y - PADDING);
    drawHandle(ctx, x + width + PADDING, y - PADDING);
    drawHandle(ctx, x + width + PADDING, y + height + PADDING);
    drawHandle(ctx, x - PADDING, y + height + PADDING);

    ctx.restore();
}

function getElementBounds(element: Element) {
    return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
    };
}

function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const SIZE = 6;

    ctx.fillStyle = "white";
    ctx.strokeStyle = "blue";

    ctx.beginPath();
    ctx.rect(x - SIZE / 2, y - SIZE / 2, SIZE, SIZE);
    ctx.fill();
    ctx.stroke();
}