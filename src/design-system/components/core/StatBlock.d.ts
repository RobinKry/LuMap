/** The two-up counter inside an event card: 16px value over a 10px caption ("dabei", "LinkedIn-Match"). */
export interface StatBlockProps {
  /** Falls back to an em dash when null/undefined. */
  value?: number | string | null;
  label?: string;
  style?: React.CSSProperties;
}
export declare function StatBlock(props: StatBlockProps): JSX.Element;
