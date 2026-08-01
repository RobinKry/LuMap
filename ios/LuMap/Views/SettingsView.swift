import SwiftUI

struct SettingsView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    header

                    settingsGroup(title: "Konten") {
                        settingsRow(title: "Luma verbinden", meta: "Bald", disabled: true)
                        settingsRow(title: "LinkedIn verbinden", meta: "Bald", disabled: true)
                    }

                    settingsGroup(title: "Backend") {
                        settingsRow(title: "Supabase", meta: "Projekt bereit", disabled: false)
                    }

                    settingsGroup(title: "Über") {
                        settingsRow(title: "Version", meta: "0.1.0 · iOS Scaffold", disabled: false)
                        settingsRow(title: "Bundle ID", meta: "com.lumap.app.lumap", disabled: false)
                        settingsRow(title: "Team", meta: "3RS7CS256A", disabled: false)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
            .background(LuMapTheme.background.ignoresSafeArea())
            .navigationBarHidden(true)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("LuMap")
                .font(.system(.title2, design: .rounded).weight(.bold))
            Text("Einstellungen")
                .font(.largeTitle.weight(.semibold))
            Text("Verbindungen und Präferenzen – Daten folgen später.")
                .font(.subheadline)
                .foregroundStyle(LuMapTheme.muted)
        }
        .padding(.top, 8)
    }

    private func settingsGroup<Content: View>(
        title: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(title.uppercased())
                .font(.caption.weight(.bold))
                .tracking(1)
                .foregroundStyle(LuMapTheme.muted)
                .padding(.bottom, 8)
            content()
        }
    }

    private func settingsRow(title: String, meta: String, disabled: Bool) -> some View {
        HStack {
            Text(title)
                .foregroundStyle(LuMapTheme.ink)
            Spacer()
            Text(meta)
                .font(.subheadline)
                .foregroundStyle(disabled ? LuMapTheme.muted : LuMapTheme.accent)
        }
        .padding(.vertical, 14)
        .opacity(disabled ? 0.7 : 1)
        .overlay(alignment: .top) {
            Divider()
        }
    }
}
