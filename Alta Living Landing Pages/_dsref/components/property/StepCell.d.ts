/** One beat of the three-step "how it works" rail: mono step label, display verb, one sentence. */
export interface StepCellProps {
  /** Step number, 1-indexed. */
  n?: number | string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function StepCell(props: StepCellProps): JSX.Element;
