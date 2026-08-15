/** Lucide glyph rendered from the lucide-static CDN, tinted with currentColor. */
export interface IconProps {
  /** Lucide icon slug, e.g. "bed", "map-pin", "arrow-right", "star", "door-open", "home". */
  name: string;
  /** Square size in px. Alta uses 12 (in tags), 16 (inline), 20 (nav). */
  size?: number | string;
  /** CSS colour. Defaults to currentColor. */
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
