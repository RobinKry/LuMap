import SwiftUI

struct RootTabView: View {
    @State private var selectedTab: Tab = .map

    enum Tab: Hashable {
        case list, map, settings
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            ListView()
                .tabItem {
                    Label("Liste", systemImage: "list.bullet")
                }
                .tag(Tab.list)

            MapView()
                .tabItem {
                    Label("Karte", systemImage: "map")
                }
                .tag(Tab.map)

            SettingsView()
                .tabItem {
                    Label("Einstellungen", systemImage: "gearshape")
                }
                .tag(Tab.settings)
        }
        .tint(LuMapTheme.accent)
    }
}
