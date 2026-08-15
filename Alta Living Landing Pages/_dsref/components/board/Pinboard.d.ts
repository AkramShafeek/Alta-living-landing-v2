/**
 * Full-bleed corkboard overlay: notes land one by one, then rust strings draw between them.
 * Mount inside a `position:relative` hero. Requires the `alta-note-land` / `alta-draw`
 * keyframes (see guidelines/motion.md) in the page.
 */
export interface PinboardNote {
  id: string;
  /** Position in % of the container. */
  x: number;
  y: number;
  rotate?: number;
  text: string;
}
export interface PinboardProps {
  notes?: PinboardNote[];
  /** Pairs of note ids to connect with string. */
  connections?: [string, string][];
  animate?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Pinboard(props: PinboardProps): JSX.Element;
