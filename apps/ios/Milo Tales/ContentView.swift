//
//  ContentView.swift
//  Milo Tales
//
//  Created by vaisakh b on 25/04/26.
//

import SwiftUI

struct ContentView: View {
    @State private var hasOnboarded: Bool = false

    var body: some View {
        if hasOnboarded {
            HomeView()
        } else {
            GetStartedView(onContinue: { hasOnboarded = true })
        }
    }
}

#Preview {
    ContentView()
}
