/**
 * Build-1 tab bar lives in `src/navigation/RootTabNavigator.tsx`.
 *
 * First iOS ship (`9014e33`) used SwiftUI `TabView` → real `UITabBar`.
 * That is restored via `@react-navigation/bottom-tabs/unstable`
 * `createNativeBottomTabNavigator` (react-native-screens native tabs).
 *
 * This file only keeps the tab id type for any leftover imports.
 */
export type AppTab = 'list' | 'map' | 'settings'

/** @deprecated Native UITabBar owns height; content inset is automatic. */
export const TAB_BAR_CONTENT_HEIGHT = 49
