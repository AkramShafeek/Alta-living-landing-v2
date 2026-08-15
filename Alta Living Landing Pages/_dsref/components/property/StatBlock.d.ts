/** Oversized number with an extra-light right-aligned caption. Stacked three-up in a bordered rail. */
export interface StatBlockProps {
  /** e.g. "12+", "5+", "100+". */
  value?: React.ReactNode;
  label?: React.ReactNode;
  size?: 'lg' | 'sm';
  style?: React.CSSProperties;
}
export declare function StatBlock(props: StatBlockProps): JSX.Element;
