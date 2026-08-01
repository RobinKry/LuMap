/** Overlapping 32px friend avatars (max 4) plus a "+N others" tail — the social proof on an event card. */
export interface FriendPreview {
  id: string;
  display_name: string;
  avatar_url?: string | null;
}
export interface FriendAvatarStackProps {
  friends?: FriendPreview[];
  /** Count shown after the avatars. @default 0 */
  extraCount?: number;
  style?: React.CSSProperties;
}
export declare function FriendAvatarStack(props: FriendAvatarStackProps): JSX.Element | null;
