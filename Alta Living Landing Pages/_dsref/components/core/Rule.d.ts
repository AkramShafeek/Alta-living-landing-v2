/** Hairline divider. Alta separates every block with a rule rather than with space. */
export interface RuleProps {
  orientation?: 'horizontal' | 'vertical';
  /** soft = 1px 18% ink (inside cards). hard = 1px solid ink. thick = 2px ink. */
  weight?: 'soft' | 'hard' | 'thick';
  style?: React.CSSProperties;
}
export declare function Rule(props: RuleProps): JSX.Element;
