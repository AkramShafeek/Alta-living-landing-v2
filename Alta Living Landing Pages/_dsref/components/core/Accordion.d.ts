/** Rule-separated Q&A list, collapsed by default. No cards, no shadows — just hairlines. */
export interface AccordionItem { q: React.ReactNode; a: React.ReactNode; }
export interface AccordionProps {
  items?: AccordionItem[];
  /** Index open on mount; -1 for all closed. */
  defaultOpen?: number;
  style?: React.CSSProperties;
}
export declare function Accordion(props: AccordionProps): JSX.Element;
