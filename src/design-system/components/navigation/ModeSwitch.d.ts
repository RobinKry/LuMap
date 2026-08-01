/**
 * The product's signature control: a blurred segmented pill that swaps the whole
 * app between 💼 WORK (the default) and 🔥 PARTY. Set `data-mode="party" | "work"` on an
 * ancestor so the accent tokens follow.
 */
export interface ModeSwitchProps {
  /** @default "WORK" */
  mode?: 'PARTY' | 'WORK';
  onChange?: (mode: 'PARTY' | 'WORK') => void;
  style?: React.CSSProperties;
}
export declare function ModeSwitch(props: ModeSwitchProps): JSX.Element;
