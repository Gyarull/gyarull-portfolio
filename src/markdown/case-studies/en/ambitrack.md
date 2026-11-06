---
title: 'Ambitrack: from an idea to a working prototype in four days'
summary: "A dynamic music engine for tabletop games, built with Web Audio and WebGL, technologies I didn't know, working with Claude Code: specification first, a technical spike for each risk and small deliveries."
date: '2026-11-05'
project: ambitrack
---

## The problem

Music helps a lot in a tabletop or RPG session, until it breaks the mood. A playlist doesn't know the fight just started, and switching tracks by hand kills the atmosphere. The tools that exist, like Syrinscape, are built mostly around sound effects, are slow to load, and their soundpad lags.

I wanted what video games have done since _Ocarina of Time_: music that follows the state of the game without showing the seams. In practice that meant:

- **Exact splices.** Musical blocks chain with no gaps or clicks, down to the audio sample.
- **Musical changes.** When I go from calm to combat, the current phrase finishes before the new one comes in.
- **A single intensity control** that brings layers (bass, harmony, melody, drums) up or down without jumps.
- **A phone with the screen locked.** It has to keep playing, because that's how I use it at the table.

## Starting point

My background is backend: ASP.NET Core and C# APIs for production systems. The frontend I knew was Angular, from a few years back. I had never used the Web Audio API, WebGL or React. [TODO: confirm or adjust]

I set two goals: reach a prototype that proved the core mechanic quickly and, if it didn't take off as a product, make it a concrete example of how I work with AI.

## Architecture and decisions

| Decision                                     | Why                                                                                                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web PWA** (React + Vite + TypeScript)      | One version for computer and Android, installable and offline. TypeScript makes generated code verifiable.                                                                                                             |
| **Engine in plain TypeScript**, no Web Audio | It receives the audio clock time and decides what to schedule. That way state changes, randomness and intensity curves are tested with Vitest, without speakers. A thin layer is the only code that touches Web Audio. |
| **Manifest-based scheduling**                | Each block starts at an exact audio-clock time computed as `bars × beats × 60 / tempo`, not from the file length. Any extra silence at the end of a file is simply discarded.                                          |
| **FLAC**, not MP3                            | MP3 adds about 23 ms of silence at the start of every file, which opens a gap at every splice. FLAC has no such padding, is about 5× smaller than WAV and decodes to identical samples.                                |
| **Bounded memory**                           | Files stay compressed in memory and only the current block plus one candidate per state are decoded. A decoded 4-layer block takes about 20 MB: a whole pack doesn't fit on a phone.                                   |
| **Orb with a custom shader**                 | A WebGL fragment shader, no react-three-fiber: about 0.1 ms of JavaScript per frame and 60 fps with no audio glitches on desktop.                                                                                      |
| **Zod, IndexedDB and Cloudflare**            | Zod validates packs with clear messages, the user's effects are stored on the device, and the deploy is a Cloudflare Worker with static assets.                                                                        |

## How I worked with Claude Code

Every stage followed the same process:

1. **Product interview and risk research.** Before any code.
2. **`SPEC.md`:** what gets built, with numbered requirements (F1, F2…) and acceptance criteria.
3. **`STACK.md`:** how it gets built and why, including the pack format.
4. **A throwaway spike for each technical risk** (splices, latency, locked screen, orb performance), each with metrics and a results README.
5. **The prototype, in small pull requests**, each linked to an issue on a board of user stories.

The roles were clear. I set the vision, made the product and technical decisions, reviewed every PR and ran the tests an AI can't: listening to the splices, using it on a phone with the screen off for more than ten minutes. Claude Code wrote most of the code, built the spikes with their measurements and kept the documentation up to date. A `CLAUDE.md` in the repo fixes the conventions (language, board, naming) so every session starts from the same context.

## Hard problems

**Splices without clicks.** The first spike generates a synthetic pack and renders random sequences with an `OfflineAudioContext`, checking every splice for silences and signal jumps. With WAV and FLAC all 11 splices came out clean. With a file that simulates an MP3 encoder delay, every one failed with a 23 ms gap. That result settled the pack format.

**Music with the screen locked.** Android can suspend background pages, and Chrome only shows notification controls for `<audio>` or `<video>` elements, not for Web Audio. The spike compares three ways of routing the sound and logs clock stalls, pauses and drift. Playback ran for more than ten minutes with the screen off without a break.

**An animated orb that doesn't hurt the audio.** The orb reacts to the music's energy, the state and the intensity. The spike measures frame time, audio glitches and the block scheduler's margin. With a raw WebGL shader and no library, it held 60 fps with no glitches.

**Test music that wasn't borrowed.** A commercial track cut into bars was enough to test the splices, but it had a single layer and wasn't cut by phrase. So the project includes a generator for an original 8-bit pack: 9 blocks and 4 layers inspired by the NES sound channels. Every block ends on the same chord, so any block can follow any other.

## Result and timeline

- **Four days** from the first commit (specification and stack, November 2, 2026) to the published prototype (November 5): 66 commits and 29 pull requests.
  - **Day 1:** specification, stack, three spikes and the engine core.
  - **Day 2:** soundpad, orb, offline PWA and an alternative theme (Leit, a pixel-art flame).
  - **Day 3:** phone interface, 44 px touch targets, AA contrast and built-in packs.
  - **Day 4:** Cloudflare deploy and the rename to Ambitrack.
- **Tests:** 14 test files cover the engine and run without audio.
- **Where it runs:** on desktop and on Android, as an installable app.
- **Pending:** final visual design, onboarding and a pack market.
- **Hours of actual work:** [TODO: hours]

## What I'd do differently

- **Measure on the phone from the start.** Several spikes were left ready to test on the phone, but the Android numbers were never recorded. Today the performance conclusions hold for desktop.
- **Check the size with a real FLAC encoder** before treating it as a constraint. The minimal encoder used in testing produced a 45 MB pack, far more than expected.
- **Settle the visual design with a designer before polishing the interface.** Several layout iterations could have been avoided. [TODO: confirm]
