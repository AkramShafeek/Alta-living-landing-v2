/** Small square metadata chip — location, feature, status. Ink-filled by default. */
export interface TagProps {
  children?: React.ReactNode;
  /** ink = default black chip. glass = pill over photography. wash = cool blue. */
  tone?: 'ink' | 'paper' | 'wash' | 'rust' | 'outline' | 'glass';
  /** Lucide slug shown at 12px before the label. */
  icon?: string;
  /** Set for numeric / code-like values (prices, dates). */
  mono?: boolean;
  style?: React.CSSProperties;
}
export declare function Tag(props: TagProps): JSX.Element;
