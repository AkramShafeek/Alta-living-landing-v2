/** Handwritten pinned note — the brand's voice-of-the-house-hunter device. */
export interface StickyNoteProps {
  /** Short text; newlines are preserved. */
  children?: React.ReactNode;
  /** Tilt in degrees, -6..6. */
  rotate?: number;
  width?: number;
  style?: React.CSSProperties;
}
export declare function StickyNote(props: StickyNoteProps): JSX.Element;
