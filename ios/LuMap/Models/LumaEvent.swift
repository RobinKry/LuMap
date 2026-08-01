import Foundation

struct EventOverlap: Hashable {
    var attendees: Int
    var pastEventMatches: Int
    var linkedInContacts: Int
}

struct LumaEvent: Identifiable, Hashable {
    let id: String
    let title: String
    let host: String
    let startsAt: Date
    let venue: String
    let city: String
    let latitude: Double
    let longitude: Double
    let overlap: EventOverlap
}

enum MockEvents {
    static let all: [LumaEvent] = {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime]

        func date(_ value: String) -> Date {
            iso.date(from: value) ?? .now
        }

        return [
            LumaEvent(
                id: "1",
                title: "Founders Breakfast Berlin",
                host: "Startup Club",
                startsAt: date("2026-08-05T06:30:00Z"),
                venue: "Café am Moritzplatz",
                city: "Berlin",
                latitude: 52.5034,
                longitude: 13.4105,
                overlap: .init(attendees: 48, pastEventMatches: 6, linkedInContacts: 3)
            ),
            LumaEvent(
                id: "2",
                title: "AI Builders Meetup",
                host: "ML Berlin",
                startsAt: date("2026-08-06T17:00:00Z"),
                venue: "Factory Berlin",
                city: "Berlin",
                latitude: 52.5311,
                longitude: 13.3842,
                overlap: .init(attendees: 120, pastEventMatches: 11, linkedInContacts: 8)
            ),
            LumaEvent(
                id: "3",
                title: "Design Critique Night",
                host: "Product Design Circle",
                startsAt: date("2026-08-07T16:30:00Z"),
                venue: "Betahaus",
                city: "Berlin",
                latitude: 52.4968,
                longitude: 13.4195,
                overlap: .init(attendees: 32, pastEventMatches: 4, linkedInContacts: 2)
            ),
            LumaEvent(
                id: "4",
                title: "Climate Tech Salon",
                host: "Green Ventures",
                startsAt: date("2026-08-08T15:00:00Z"),
                venue: "Impact Hub",
                city: "Berlin",
                latitude: 52.5208,
                longitude: 13.4094,
                overlap: .init(attendees: 65, pastEventMatches: 2, linkedInContacts: 5)
            ),
        ]
    }()
}
