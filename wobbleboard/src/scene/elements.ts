
export type Element = 
    | {
        id: string;
        type: "arrow";
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        seed: number;
      }
    | {
        id: string;
        type: "rectangle" | "diamond" | "ellipse";
        x: number;
        y: number;
        width: number;
        height: number;
        seed: number;
      }
    | {
        id: string;
        type: "text";
        x: number;
        y: number;
        width: number;
        height: number;
        seed: number;
        text: string;
      };