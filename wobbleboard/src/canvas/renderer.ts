import type { Element } from "../scene/elements";

export function renderScene(ctx: CanvasRenderingContext2D, elements: Element[], canvas: HTMLCanvasElement) {
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
    });
}