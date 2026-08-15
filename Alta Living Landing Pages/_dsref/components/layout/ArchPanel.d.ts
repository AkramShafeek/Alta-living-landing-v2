/**
 * Section container with the brand's signature 60px arch — rounded on the top two corners only,
 * hairline sand border, no bottom edge, so bands stack like tabs down the page.
 */
export interface ArchPanelProps {
  title?: React.ReactNode;
  /** Optional right-aligned control on the heading row. */
  action?: React.ReactNode;
  children?: React.ReactNode;
  /** Padding in px; 64 on desktop, 24 on mobile. */
  pad?: number;
  style?: React.CSSProperties;
}
export declare function ArchPanel(props: ArchPanelProps): JSX.Element;
