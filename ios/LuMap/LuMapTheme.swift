import SwiftUI

enum LuMapTheme {
    static let accent = Color(red: 10 / 255, green: 138 / 255, blue: 106 / 255)
    static let ink = Color(red: 18 / 255, green: 23 / 255, blue: 29 / 255)
    static let muted = Color(red: 102 / 255, green: 115 / 255, blue: 132 / 255)
    static let background = Color(red: 238 / 255, green: 241 / 255, blue: 244 / 255)
}

enum EventDateFormat {
    static let when: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "de_DE")
        formatter.dateFormat = "E, d. MMM · HH:mm"
        return formatter
    }()
}
