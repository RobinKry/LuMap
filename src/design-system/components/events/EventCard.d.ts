/**
 * One row of the Live Radar feed: source badge, title, venue, two stats, the
 * friends who are going, and an accent CTA. Composes PlatformBadge, StatBlock,
 * FriendAvatarStack and (for LinkedIn events) LinkedInMentionCard.
 *
 * @startingPoint section="Events" subtitle="Live Radar event card" viewport="700x400"
 */
export interface EventCardEvent {
  id?: string;
  title?: string;
  venue_name?: string | null;
  source_platform?: 'LUMA' | 'PARTIFUL' | 'LINKEDIN' | 'EVENTBRITE';
  /** Blurs the map pin and shows the "neighborhood (blurred)" tag. */
  is_residential?: boolean;
  attendee_count?: number | null;
  linkedin_match_count?: number;
  /** First names shown as "z. B. …". */
  match_preview?: string[];
  guest_list_public?: boolean;
  friends?: { id: string; display_name: string; avatar_url?: string | null }[];
  otherCount?: number;
  original_author_name?: string | null;
  original_author_headline?: string | null;
}
export interface EventCardProps {
  event: EventCardEvent;
  /** Swaps the hairline stroke for `--accent`. @default false */
  selected?: boolean;
  onSelect?: () => void;
  onOpenLink?: () => void;
  style?: React.CSSProperties;
}
export declare function EventCard(props: EventCardProps): JSX.Element;
