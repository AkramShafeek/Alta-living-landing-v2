/**
 * Alta Living button. `hard` is the signature: white face, 1px ink border,
 * 5px/6px zero-blur ink shadow, inverting to solid ink on hover and travelling
 * 3px into its shadow on press.
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** hard = white/ink + offset shadow (primary CTA). hard-invert = ink face. solid/outline/ghost/link are quieter. */
  variant?: 'hard' | 'hard-invert' | 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  /** square is default; pill only for hero CTAs and nav capsules. */
  shape?: 'square' | 'pill';
  /** Lucide slug rendered before the label. */
  iconStart?: string;
  /** Lucide slug rendered after the label — usually "arrow-right". */
  iconEnd?: string;
  block?: boolean;
  disabled?: boolean;
  justify?: React.CSSProperties['justifyContent'];
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
