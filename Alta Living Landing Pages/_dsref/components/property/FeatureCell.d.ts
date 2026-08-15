/** Reason-to-believe cell: Lucide glyph, short display title, one sentence, on a pastel ground. */
export interface FeatureCellProps {
  /** Lucide slug. */
  icon?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  tone?: 'blue' | 'sage' | 'peach' | 'lilac' | 'butter';
  style?: React.CSSProperties;
}
export declare function FeatureCell(props: FeatureCellProps): JSX.Element;
