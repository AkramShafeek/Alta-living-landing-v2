/** Guest quote card: name + filled stars, quote, then a location tag / verified row. */
export interface TestimonialCardProps {
  quote?: string;
  name?: string;
  location?: string;
  /** 0–5 filled stars. */
  rating?: number;
  verified?: boolean;
  /** Pastel card ground — alternate across the grid. */
  tone?: 'blue' | 'sage' | 'peach' | 'lilac' | 'butter';
  style?: React.CSSProperties;
}
export declare function TestimonialCard(props: TestimonialCardProps): JSX.Element;
