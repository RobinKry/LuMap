import SwiftUI

struct ListView: View {
    private let events = MockEvents.all.sorted { $0.startsAt < $1.startsAt }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    header
                    ForEach(events) { event in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(alignment: .firstTextBaseline) {
                                Text(event.title)
                                    .font(.title3.weight(.semibold))
                                    .foregroundStyle(LuMapTheme.ink)
                                Spacer(minLength: 8)
                                Text(EventDateFormat.when.string(from: event.startsAt))
                                    .font(.caption)
                                    .foregroundStyle(LuMapTheme.muted)
                            }

                            Text("\(event.venue) · \(event.city)")
                                .font(.subheadline)
                                .foregroundStyle(LuMapTheme.ink.opacity(0.8))

                            Text("Host: \(event.host)")
                                .font(.caption)
                                .foregroundStyle(LuMapTheme.muted)

                            EventStatsView(overlap: event.overlap)
                        }
                        .padding(.vertical, 16)
                        .overlay(alignment: .top) {
                            Divider().opacity(events.first?.id == event.id ? 0 : 1)
                        }
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
            Text("Events")
                .font(.largeTitle.weight(.semibold))
            Text("Wer geht hin – und wen kennst du schon?")
                .font(.subheadline)
                .foregroundStyle(LuMapTheme.muted)
        }
        .padding(.top, 8)
        .padding(.bottom, 12)
    }
}
