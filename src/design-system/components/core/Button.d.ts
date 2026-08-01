/**
 * LuMap's pressable — a full-round pill. `primary` is the accent action at the
 * bottom of every card and settings block; `soft` is the tinted low-emphasis
 * twin; `ghost` is a white bordered secondary; `chrome` floats over the map.
 */
export interface ButtonProps {
  /** Visual treatment. @default "primary" */
  variant?: 'primary' | 'soft' | 'ghost' | 'chrome' | 'linkedin';
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Stretch to the container width — how every in-card CTA is used. @default false */
  block?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
