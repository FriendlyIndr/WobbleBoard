import type { Element } from "../scene/elements";

export function renderScene(
    ctx: CanvasRenderingContext2D, 
    elements: Element[], 
    canvas: HTMLCanvasElement, 
    selectedElementId: string | null
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
        if (element.type === 'rectangle') {
            ctx.strokeRect(
                element.x,
                element.y,
                element.width,
                element.height
            );
        }

        if (element.id === selectedElementId) {
            drawSelection(ctx, element);
        }
    });
}

function drawSelection(ctx: CanvasRenderingContext2D, element: Element) {
    ctx.save();

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;

    const PADDING = 6;

    if (element.type === "rectangle") {
        ctx.strokeRect(
            element.x - PADDING,
            element.y - PADDING,
            element.width + PADDING * 2,
            element.height + PADDING * 2
        );

        drawHandle(ctx, element.x  - PADDING, element.y - PADDING);
        drawHandle(ctx, element.x + element.width + PADDING, element.y - PADDING);
        drawHandle(ctx, element.x + element.width + PADDING, element.y + element.height + PADDING);
        drawHandle(ctx, element.x - PADDING, element.y + element.height + PADDING);
    }

    ctx.restore();
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