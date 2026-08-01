/** Emoji + lowercase source name in the top-left of every event card. */
export interface PlatformBadgeProps {
  platform: 'LUMA' | 'PARTIFUL' | 'LINKEDIN' | 'EVENTBRITE';
  style?: React.CSSProperties;
}
export declare function PlatformBadge(props: PlatformBadgeProps): JSX.Element;
