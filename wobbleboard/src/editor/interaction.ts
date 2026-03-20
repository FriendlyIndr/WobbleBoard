export type InteractionState =
  | { type: "idle" }
  | { type: "drawing"; start: { x: number; y: number } }
  | {
      type: "dragging";
      cursorStart: { x: number; y: number };
      intitialPositions: Map<string, { x: number; y: number }>;
    }
  | { type: "erasing" }
  | {
      type: "marquee";
      start: { x: number; y: number };
      current: { x: number; y: number };
    };