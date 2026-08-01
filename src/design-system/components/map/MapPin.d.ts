/**
 * A heat pin on the map. `public` is a hard accent dot with a white ring and a
 * soft halo; `residential` is a two-layer accent bloom with no core — the visual
 * form of LuMap's privacy blur (exact coordinates are never plotted).
 */
export interface MapPinProps {
  /** @default "public" */
  kind?: 'public' | 'residential';
  /** Adds an outer accent glow ring. @default false */
  selected?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function MapPin(props: MapPinProps): JSX.Element;
