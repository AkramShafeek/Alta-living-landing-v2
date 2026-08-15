/** Full-width near-black closing band: display headline, mono subline, one pill CTA. */
export interface CTABandProps {
  title?: React.ReactNode;
  /** Rendered as a mono uppercase kicker under the headline. */
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  onAction?: () => void;
  style?: React.CSSProperties;
}
export declare function CTABand(props: CTABandProps): JSX.Element;
