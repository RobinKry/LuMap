/** Nested card shown inside an event card when the event was surfaced by a LinkedIn post. */
export interface LinkedInMentionCardProps {
  authorName?: string;
  /** The poster's LinkedIn headline, e.g. "Partner @ Green Ventures". */
  authorHeadline?: string;
  onOpen?: () => void;
  style?: React.CSSProperties;
}
export declare function LinkedInMentionCard(props: LinkedInMentionCardProps): JSX.Element;
