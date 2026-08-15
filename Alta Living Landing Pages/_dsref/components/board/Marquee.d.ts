/** Ticker band of live facts. Mono, uppercase, em-dash separated, 26s loop. */
export interface MarqueeProps {
  items?: string[];
  /** Seconds for one full loop. */
  speed?: number;
  tone?: 'rust' | 'ink' | 'paper';
  style?: React.CSSProperties;
}
export declare function Marquee(props: MarqueeProps): JSX.Element;
