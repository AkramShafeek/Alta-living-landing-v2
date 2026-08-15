/**
 * The site's only navigation: a white pill with a 1px ink border floating top-right,
 * holding link-style buttons.
 */
export interface NavCapsuleProps {
  items?: string[];
  active?: string;
  onSelect?: (item: string) => void;
  style?: React.CSSProperties;
}
export declare function NavCapsule(props: NavCapsuleProps): JSX.Element;
