import { useEffect } from "react";
import type { InteractionState } from "../editor/interaction";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";
import type { Tool } from "../tools/toolTypes";


export function useCanvasRenderer({
    canvasRef,
    cursorPosRef,
    elementsRef,
    interactionRef,
    selectedIdsRef,
    toolRef,
}: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    cursorPosRef: React.RefObject<{ x: number; y: number } | null>;
    elementsRef: React.RefObject<Element[]>;
    interactionRef: React.RefObject<InteractionState>;
    selectedIdsRef: React.RefObject<Set<string>>;
    toolRef: React.RefObject<Tool>;
}) {
    // Initialize canvas context
    useEffect(() => {
        const canvas = canvasRef.current!;

        // Get 2d drawing context
        const ctx = canvas.getContext("2d")!;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let animationFrameId: number;

        function render() {
            const interaction = interactionRef.current;

            const selectionBox =
                interaction.type === "marquee"
                ? {
                    x: interaction.start.x,
                    y: interaction.start.y,
                    width: interaction.current.x - interaction.start.x,
                    height: interaction.current.y - interaction.start.y,
                    }
                : null;

            renderScene(ctx, elementsRef.current, canvas, selectedIdsRef.current, selectionBox);

            const cursor = cursorPosRef.current;

            if (toolRef.current.type === "eraser" && cursor) {
                const radius = 5.5;

                ctx.beginPath();
                ctx.arc(cursor.x, cursor.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        }

        render();

        return() => cancelAnimationFrame(animationFrameId);
    }, []);
}