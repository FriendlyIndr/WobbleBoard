import { useEffect } from "react";
import type { InteractionState } from "../editor/interaction";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";
import type { Tool } from "../tools/toolTypes";


export function useCanvasRenderer({
    canvasRef,
    interaction,
    elements,
    selectedIds,
    cursorPosRef,
    tool,
}: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    interaction: InteractionState;
    elements: Element[];
    selectedIds: Set<string>;
    cursorPosRef: React.RefObject<{ x: number; y: number } | null>;
    tool: Tool;
}) {
    // Initialize canvas context
    useEffect(() => {
        const canvas = canvasRef.current!;
        if (!canvas) return;

        // Get 2d drawing context
        const ctx = canvas.getContext("2d")!;
        if (!ctx) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const selectionBox =
            interaction.type === "marquee"
            ? {
                x: interaction.start.x,
                y: interaction.start.y,
                width: interaction.current.x - interaction.start.x,
                height: interaction.current.y - interaction.start.y,
                }
            : null;

        function render() {
            renderScene(ctx, elements, canvas, selectedIds, selectionBox);

            const cursor = cursorPosRef.current;

            if (tool.type === "eraser" && cursor) {
            const radius = 5.5;

            ctx.beginPath();
            ctx.arc(cursor.x, cursor.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.stroke();
            }

            requestAnimationFrame(render);
        }

        render();
        }, [elements, selectedIds, interaction]);
}