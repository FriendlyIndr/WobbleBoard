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

    ctx.setLineDash([5, 5]);

    if (element.type === "rectangle") {
        ctx.strokeRect(
            element.x,
            element.y,
            element.width,
            element.height
        );
    }

    ctx.restore();
}