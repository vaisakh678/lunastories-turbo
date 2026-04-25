//
//  StoryAudioPlayer.swift
//  Milo Tales
//

import AVFoundation
import Foundation
import Observation

@Observable
@MainActor
final class StoryAudioPlayer {
    private(set) var isPlaying: Bool = false
    private(set) var elapsed: Double = 0
    private(set) var total: Double = 0
    private(set) var loadedURL: URL?

    private var player: AVPlayer?
    private var timeObserver: Any?
    private var endObserver: NSObjectProtocol?

    func load(url: URL, fallbackTotal: Double = 0) {
        if loadedURL == url { return }
        teardown()

        let item = AVPlayerItem(url: url)
        let player = AVPlayer(playerItem: item)
        self.player = player
        self.loadedURL = url
        self.elapsed = 0
        self.total = fallbackTotal

        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.25, preferredTimescale: 600),
            queue: .main
        ) { [weak self] time in
            MainActor.assumeIsolated {
                guard let self else { return }
                self.elapsed = time.seconds.isFinite ? time.seconds : 0
                if let dur = self.player?.currentItem?.duration,
                    dur.isNumeric {
                    let s = dur.seconds
                    if s.isFinite, s > 0 { self.total = s }
                }
            }
        }

        endObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: item,
            queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self else { return }
                self.isPlaying = false
                self.player?.seek(to: .zero)
                self.elapsed = 0
            }
        }
    }

    func togglePlay() {
        guard let player else { return }
        if isPlaying {
            player.pause()
            isPlaying = false
        } else {
            player.play()
            isPlaying = true
        }
    }

    func seek(to seconds: Double) {
        guard let player else { return }
        let target = CMTime(seconds: max(0, min(seconds, total)), preferredTimescale: 600)
        player.seek(to: target, toleranceBefore: .zero, toleranceAfter: .zero)
        elapsed = target.seconds
    }

    func skip(by delta: Double) {
        seek(to: elapsed + delta)
    }

    func teardown() {
        if let observer = timeObserver, let player {
            player.removeTimeObserver(observer)
        }
        timeObserver = nil
        if let endObserver {
            NotificationCenter.default.removeObserver(endObserver)
        }
        endObserver = nil
        player?.pause()
        player = nil
        loadedURL = nil
        isPlaying = false
        elapsed = 0
        total = 0
    }

}
