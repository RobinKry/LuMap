import { Image, Linking, Pressable, Text, View } from 'react-native'
import type { EventAttendeePreview, EventItem } from '../types'

type Props = {
  event: EventItem
}

export function LinkedInEventCard({ event }: Props) {
  const author = event.original_author_name ?? 'Unknown'
  const headline = event.original_author_headline ?? 'LinkedIn'

  return (
    <View className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <Text className="text-xs font-semibold uppercase tracking-wide text-[#0A66C2]">
        LinkedIn mention
      </Text>
      <Text className="mt-2 text-sm leading-5 text-white/90">
        Mentioned by {author} • {headline}
      </Text>
      <Pressable
        className="mt-3 self-start rounded-full bg-[#0A66C2] px-3 py-2"
        onPress={() => {
          if (event.event_url) void Linking.openURL(event.event_url)
        }}
      >
        <Text className="text-xs font-bold text-white">View original post</Text>
      </Pressable>
    </View>
  )
}

export function FriendAvatarStack({
  friends,
  extraCount = 0,
}: {
  friends: EventAttendeePreview[]
  extraCount?: number
}) {
  if (friends.length === 0 && extraCount === 0) return null

  return (
    <View className="mt-3 flex-row items-center">
      {friends.slice(0, 4).map((friend, index) => (
        <View
          key={friend.id}
          className="h-8 w-8 overflow-hidden rounded-full border-2 border-[#12161A] bg-white/20"
          style={{ marginLeft: index === 0 ? 0 : -8 }}
        >
          {friend.avatar_url ? (
            <Image
              source={{ uri: friend.avatar_url }}
              className="h-full w-full"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text className="text-[10px] font-bold text-white">
                {friend.display_name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      ))}
      {extraCount > 0 ? (
        <Text className="ml-2 text-xs text-white/60">+{extraCount} others</Text>
      ) : null}
    </View>
  )
}
