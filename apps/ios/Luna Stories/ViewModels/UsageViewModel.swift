//
//  UsageViewModel.swift
//  Luna Stories
//
//  Holds the latest weekly usage (GET /usage). Best-effort: a failed refresh
//  keeps the previous value, since usage display is non-critical.
//

import Foundation
import Observation

@Observable
@MainActor
final class UsageViewModel {
    private(set) var summary: UsageSummary?

    func refresh() async {
        summary = try? await UsageAPI.fetch()
    }
}
