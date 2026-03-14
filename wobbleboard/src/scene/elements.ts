
export type Element = {
    id: string;
    type: "rectangle" | "diamond" | "ellipse" | "arrow" | "text",
    x: number;
    y: number;
    width: number;
    height: number;
    seed: number;

    text?: string;
};