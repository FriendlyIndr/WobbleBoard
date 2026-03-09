export type RectangleElement = {
    id: string;
    type: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
    seed: number;
};

export type DiamondElement = {
    id: string;
    type: "diamond";
    x: number;
    y: number;
    width: number;
    height: number;
    seed: number;
};

export type EllipseElement = {
    id: string;
    type: "ellipse";
    x: number;
    y: number;
    width: number;
    height: number;
    seed: number;
};

export type Element = RectangleElement | DiamondElement | EllipseElement;