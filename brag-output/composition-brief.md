# Hyperframes Composition Brief: The Scholar Ledger

## Objective
Create a short launch-style brag video for The Scholar Ledger.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 18 seconds

## Source Material
- Project root: `c:\Users\abrar\Documents\Projets(new)\Tokenized-Academic-Credential-Verification-System-main`
- Primary files read: `frontend/index.html`, `frontend/src/index.css`, `README.md`, `frontend/src/pages/Home.jsx`
- Product name: The Scholar Ledger
- Tagline / strongest claim: Immutable Ledger-backed Proofs.
- Key UI or visual moment to recreate: The glassmorphic cards and dark starfall background from the landing page.
- Copy that must appear verbatim:
  - Tokenized Academic Credentials
  - Immutable Ledger-backed Proofs.
  - Public Verification

## Creative Direction
- Tone preset: polished
- Creative direction: Serious, premium, institutional trust
- Interpretation: Elegant typography, slow crossfades, confident pacing, minimal clutter. Let the claims breathe.
- Angle: The transition from paper certificates to immutable, cryptographic proofs. It emphasizes trust, permanence, and instant verification without intermediaries.
- Hook: "Tokenized Academic Credentials" fading in over a dark, deep blue gradient background.
- Outro / punchline: The Scholar Ledger. Immutable Ledger-backed Proofs.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign

## Visual Identity
- Background: #0f172a (Slate 900) to #0e0e0e with a deep blue glow
- Text: #f1f5f9 (Slate 100)
- Accent: #8197ff (Gradient text) and #0ea5e9 (Primary 500)
- Display font: Manrope
- Body font: Inter
- Visual references from the project: Glassmorphic cards (`background: rgba(19, 19, 19, 0.88); border: 1px solid rgba(72, 72, 72, 0.25); backdrop-filter: blur(6px);`), starfall surface gradients.

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The Hook — 4s — "Tokenized Academic Credentials" on dark gradient background
2. Issuing — 5s — Simulate cursor clicking "Mint Credential" on a glassmorphic form card, success badge pops up
3. Verification — 5s — Typing in search bar "Public Verification", verification result card slides in
4. Outro — 4s — "The Scholar Ledger. Immutable Ledger-backed Proofs."

## Audio
- Audio role: warm professional bed with sparse accents
- Audio arc: confident entrance, precise middle, authoritative ending
- Music: happy-beats-business-moves-vol-12-by-ende-dot-app.mp3
- Music treatment: fade in slowly, steady volume at 0.3, fade out at end
- Music cue guidance: detect at composition via analyze_music_cues.py / hyperframes beats
- Audio-reactive treatment: subtle; use music RMS/bass to make the hero glow and background breathe. No waveform visuals.
- Audio-coupled moments:
  - Scene 2 — simulated click and success badge reveal
  - Scene 3 — typing search and result card sliding in
- SFX selection guidance: gentle UI clicks, warm drops or soft bells for success. Nothing chaotic or abrasive.
- SFX analysis guidance: use lower high-frequency-risk sounds for repeated or polished moments
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any Hyperframes-selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer unless audio was explicitly disabled or documented as intentionally silent.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints. Hyperframes decides exact animation timing and should ignore cues that hurt readability, scene pacing, or the product story.
- Major reveals may move toward nearby strong cues within about 0.15s. Smaller entrances may align to nearby beat points within about 0.10s. Use only 1-3 strong cue locks in a 15-25s video unless the edit clearly benefits from more.
- Use SFX to support motion and interaction: card sounds for card-like reveals, short announcement cues for major payoffs, key/click sounds for text or user actions, and restraint when the edit is already busy.
- Honor planned music treatment such as fade-outs, ducking, beat-aligned reveals, or letting a final SFX ring over the music, using the best Hyperframes-supported implementation.
- When music is present and the treatment is not `none`, consider Hyperframes audio-reactive workflow: extract audio data and use RMS/frequency bands for subtle, brand-specific motion. Good targets are glow, depth, background warmth, card presence, title emphasis, or other existing visual elements. Avoid waveform/equalizer visuals, musical-note graphics, generic particle systems, strobing, or heavy pulsing.
- Use local assets for audio and any required runtime/media dependencies when possible.
- Run `hyperframes check` before render — it is brag's single gate.
