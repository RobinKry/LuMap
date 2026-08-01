/**
 * The Live Radar sheet: a translucent, blurred panel anchored to the bottom of
 * the map with a grab handle, a title/count header and a scrolling body.
 * Native snap points are 18% / 42% / 78%.
 */
export interface BottomSheetProps {
  /** e.g. "Live Radar" */
  title?: string;
  /** e.g. "4 events · PARTY" */
  subtitle?: string;
  /** Sheet height; use one of the snap values. @default "58%" */
  height?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function BottomSheet(props: BottomSheetProps): JSX.Element;
