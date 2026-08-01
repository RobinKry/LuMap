import MapKit
import SwiftUI

struct MapView: View {
    private let events = MockEvents.all
    @State private var position: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 52.52, longitude: 13.405),
            span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08)
        )
    )
    @State private var selectedEvent: LumaEvent?

    var body: some View {
        ZStack(alignment: .top) {
            Map(position: $position, selection: $selectedEvent) {
                ForEach(events) { event in
                    Marker(
                        event.title,
                        coordinate: CLLocationCoordinate2D(
                            latitude: event.latitude,
                            longitude: event.longitude
                        )
                    )
                    .tint(LuMapTheme.accent)
                    .tag(event)
                }
            }
            .mapStyle(.standard(elevation: .flat))
            .ignoresSafeArea(edges: .top)

            HStack {
                Text("LuMap")
                    .font(.system(.title2, design: .rounded).weight(.bold))
                    .foregroundStyle(LuMapTheme.ink)
                Spacer()
                Text("\(events.count) Events in der Nähe")
                    .font(.footnote)
                    .foregroundStyle(LuMapTheme.muted)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                LinearGradient(
                    colors: [LuMapTheme.background.opacity(0.95), LuMapTheme.background.opacity(0)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
        }
        .sheet(item: $selectedEvent) { event in
            EventDetailSheet(event: event)
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
    }
}

private struct EventDetailSheet: View {
    let event: LumaEvent

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(event.title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(LuMapTheme.ink)

            Text("\(EventDateFormat.when.string(from: event.startsAt)) · \(event.venue)")
                .font(.subheadline)
                .foregroundStyle(LuMapTheme.muted)

            EventStatsView(overlap: event.overlap)
            Spacer()
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(LuMapTheme.background)
    }
}
