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
    }

    ctx.restore();
}