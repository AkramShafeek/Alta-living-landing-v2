/**
 * Tiled hand-drawn furniture line-art behind the hero, washed back to 10% and faded in over 4.4s.
 * Needs the `alta-pattern-in` keyframes (see guidelines/motion.md).
 */
export interface PatternFieldProps {
  /** Defaults to the brand furniture-doodle tile. */
  src?: string;
  /** Tile size in px — 300 in production. */
  size?: number;
  /** Target opacity. Never above 0.12. */
  opacity?: number;
  fadeIn?: boolean;
  style?: React.CSSProperties;
}
export declare function PatternField(props: PatternFieldProps): JSX.Element;
