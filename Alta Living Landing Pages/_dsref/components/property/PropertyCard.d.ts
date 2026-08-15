/**
 * The listing card: photo above a hairline, title + hook, a metadata row between two rules,
 * price, and a full-width hard-shadow View button.
 */
export interface PropertyCardProps {
  src: string;
  alt?: string;
  title?: string;
  /** One editorial line — concrete and sensory, not marketing. */
  hook?: string;
  location?: string;
  /** e.g. "1BHK", "2 BHK". */
  beds?: string;
  /** e.g. "Available 1/3". Omit to hide. */
  availability?: string;
  /** Formatted with the ₹ symbol and a space, e.g. "₹ 30,000". */
  price?: string;
  unit?: string;
  /** Pastel card ground. Vary tone across a grid; blue is the default. */
  tone?: 'blue' | 'sage' | 'peach' | 'lilac' | 'butter';
  onView?: () => void;
  style?: React.CSSProperties;
}
export declare function PropertyCard(props: PropertyCardProps): JSX.Element;
