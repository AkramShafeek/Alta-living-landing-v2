/** A property photo pinned to the corkboard: pushpin, hand-placed tilt, polaroid lip. */
export interface PinnedPhotoProps {
  src: string;
  alt?: string;
  /** Photo box size before tilt. Source uses 152–176 x 132. */
  width?: number;
  height?: number;
  /** Explicit tilt in degrees; omit to derive a stable -5deg..5deg tilt from `seed`. */
  rotate?: number;
  /** Any integer — same seed always yields the same tilt. */
  seed?: number;
  /** Handwritten caption on the white lip. */
  caption?: string;
  style?: React.CSSProperties;
}
export declare function PinnedPhoto(props: PinnedPhotoProps): JSX.Element;
