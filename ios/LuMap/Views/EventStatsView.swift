import SwiftUI

struct EventStatsView: View {
    let overlap: EventOverlap

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            stat(value: overlap.attendees, label: "dabei")
            stat(value: overlap.pastEventMatches, label: "schon getroffen")
            stat(value: overlap.linkedInContacts, label: "LinkedIn")
        }
    }

    private func stat(value: Int, label: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(value)")
                .font(.title3.weight(.semibold))
                .foregroundStyle(LuMapTheme.ink)
            Text(label)
                .font(.caption2)
                .foregroundStyle(LuMapTheme.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
