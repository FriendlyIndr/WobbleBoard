// Shape registry

import { diamondShape } from "./diamond";
import { ellipseShape } from "./ellipse";
import { rectangleShape } from "./rectangle";

export const SHAPES = {
    rectangle: rectangleShape,
    diamond: diamondShape,
    ellipse: ellipseShape,
};