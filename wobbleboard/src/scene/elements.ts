export type RectangleElement = {
    id: string;
    type: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
};

export type DiamondElement = {
    id: string;
    type: "diamond";
    x: number;
    y: number;
    width: number;
    height: number;
};

export type Element = RectangleElement | DiamondElement;