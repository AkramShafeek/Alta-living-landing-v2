/** The Alta Living identity: 4-glyph mark, League Gothic wordmark, or the two locked up. */
export interface WordmarkProps {
  /** lockup = mark + wordmark. mark = boxed logo only. condensed = League Gothic type only. */
  variant?: 'lockup' | 'mark' | 'condensed';
  /** Mark edge length / wordmark cap size in px. */
  size?: number;
  /** Mark sits in a white 12px-radius box with a 3px hard shadow. */
  boxed?: boolean;
  style?: React.CSSProperties;
}
export declare function Wordmark(props: WordmarkProps): JSX.Element;
