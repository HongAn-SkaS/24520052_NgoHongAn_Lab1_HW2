# HW2 — Drum Kit Engine: Task Decomposition

## 1. Project Overview

- **Project:** HW2 — Drum Kit Engine
- **Methodology:** Work Breakdown Structure (WBS) + Contract-First Development
- **Technology Stack:** Vanilla HTML5, Modern CSS, ES6+ JavaScript

### Technical Constraints

1. Only Vanilla HTML5, CSS, and ES6+ JavaScript are allowed.
2. Do not use jQuery, Bootstrap, Tailwind CSS, or external CDNs.
3. Define and commit the HTML data contract before implementing JavaScript.
4. Complete and verify each task independently.
5. Each WBS task must produce exactly one atomic commit.
6. Do not implement all features in one AI-generated solution.
7. Each task must have explicit verification criteria.
8. The implementation must support live defense: changing a keyboard binding must be possible within three minutes.

---

## 2. Work Breakdown Structure (WBS)

| WBS ID | Task | Main Activities | Deliverables | Commit Message |
|---|---|---|---|---|
| 1.0 | HTML Data-Sound Contract | Define `data-key`, `data-sound`, and `data-pad` for every drum pad | `index.html` | `feat(html): define drum pad data-sound contract` |
| 2.0 | Polyphonic Audio Engine | Initialize audio, resolve sound IDs, support overlapping playback, handle errors | `js/audio-engine.js` | `feat(audio): implement polyphonic playback engine` |
| 3.0 | Keyboard Controller | Read key mappings from HTML, trigger sounds, suppress repeated key events | `js/keyboard-controller.js` | `feat(input): add keyboard controller with repeat throttling` |
| 4.0 | FIFO Beat Recorder | Capture activation events and timestamps, store and retrieve events in FIFO order | `js/beat-recorder.js` | `feat(recorder): implement FIFO timestamped beat recorder` |

### 2.1. Step 1 — HTML Data-Sound Contract

**WBS ID:** 1.0

**Objective:** Define the HTML interface connecting keyboard bindings, drum pads, and sound identifiers before writing JavaScript.

**Requirements:**
- Every drum pad must define `data-key`, `data-sound`, and `data-pad`.
- Each `data-pad` must be unique.
- Keyboard bindings must be explicit and unambiguous.
- Sound identifiers must be stable and supported by the planned audio engine.
- JavaScript must read the contract instead of relying on hardcoded DOM positions or duplicated mappings.

**Files:** `index.html` and relevant CSS files if basic pad styling is needed.

**Verification:**
- [ ] All pads contain the three required attributes.
- [ ] Pad identifiers are unique.
- [ ] Key bindings and sound identifiers are consistent.
- [ ] The key-to-sound mapping can be understood by inspecting HTML.
- [ ] The contract is committed before any JavaScript implementation.

**Commit:** `feat(html): define drum pad data-sound contract`

---

### 2.2. Step 2 — Polyphonic Audio Playback Engine

**WBS ID:** 2.0

**Objective:** Implement an audio engine that plays sounds independently of keyboard events and UI rendering.

**Requirements:**
- Initialize or prepare the audio subsystem when needed.
- Resolve a sound identifier to its corresponding audio resource.
- Provide an interface to request playback by sound ID.
- Support overlapping playback without unnecessarily stopping previous sounds.
- Handle unknown sound identifiers and unavailable resources safely.
- Keep keyboard listeners, pad highlighting, and recording logic outside the engine.

**Files:** `js/audio-engine.js`; `index.html` only if a script reference is needed.

**Verification:**
- [ ] A valid sound ID triggers the correct sound.
- [ ] Multiple sounds can overlap.
- [ ] Unknown sound IDs are handled safely.
- [ ] Playback can be tested without keyboard input or the recorder.
- [ ] Browser audio restrictions and user-gesture requirements are handled.

**Commit:** `feat(audio): implement polyphonic playback engine`

---

### 2.3. Step 3 — Keyboard Controller and Repeat Throttling

**WBS ID:** 3.0

**Objective:** Translate keyboard input into playback requests using the HTML data contract.

**Requirements:**
- Read `data-key`, `data-sound`, and `data-pad` from drum pads.
- Normalize keyboard input consistently before matching bindings.
- Request playback through the audio engine.
- Use `event.repeat` to suppress repeated playback when a key is held.
- Ignore unmapped keys.
- Avoid unintended activation while typing in editable controls.
- Keep keyboard mappings out of the audio engine.

**Files:** `js/keyboard-controller.js`; integration with `js/audio-engine.js` and `index.html` if needed.

**Verification:**
- [ ] A mapped key triggers the correct sound.
- [ ] An unmapped key does nothing.
- [ ] Holding a key does not repeatedly trigger playback through repeated `keydown` events.
- [ ] Releasing and pressing the key again triggers playback normally.
- [ ] Changing `data-key` updates the binding without modifying the audio engine.
- [ ] Typing in editable controls does not trigger drum sounds.

**Commit:** `feat(input): add keyboard controller with repeat throttling`

---

### 2.4. Step 4 — FIFO Beat Recorder

**WBS ID:** 4.0

**Objective:** Record drum activation events in chronological order using a First-In, First-Out (FIFO) queue.

**Requirements:**

Each event must contain:
- `timestamp`: Capture time from a consistent clock.
- `data-key`: Keyboard binding associated with the activation.
- `data-sound`: Sound identifier.
- `data-pad`: Activated pad identifier.

The recorder must:
- Append events to the end of the queue.
- Retrieve or process events in insertion order.
- Capture timestamps when events occur, not when they are later processed.
- Avoid duplicate events caused by repeated keydown events.
- Expose a clear interface for recording and retrieving events.
- Remain independent of keyboard listeners, audio resource management, and UI rendering.

**Files:** `js/beat-recorder.js`; integration with the keyboard controller and audio engine if required.

**Verification:**
- [ ] Each accepted activation creates a timestamped event.
- [ ] Events remain in FIFO order.
- [ ] Each event contains the correct key, sound, and pad identifiers.
- [ ] Timestamps use a consistent time source.
- [ ] Repeated keydown events do not create duplicate recording events.
- [ ] The recorder can be tested using simulated events without audio playback.
- [ ] Start, stop, and retrieval operations behave consistently.

**Commit:** `feat(recorder): implement FIFO timestamped beat recorder`

---

## 3. Dependency Order

| Order | WBS ID | Task | Dependency |
|---|---|---|---|
| 1 | 1.0 | HTML Data-Sound Contract | None |
| 2 | 2.0 | Polyphonic Audio Engine | Step 1 |
| 3 | 3.0 | Keyboard Controller | Steps 1 and 2 |
| 4 | 4.0 | FIFO Beat Recorder | Steps 1, 2, and 3 integration |

**Mandatory rule:** Step 1 must be verified and committed before JavaScript implementation begins.

---

## 4. Atomic Commit Policy

Each WBS task must be completed, tested, and committed separately.

1. One WBS task equals one atomic commit.
2. Do not combine multiple tasks into one commit.
3. Do not start the next task before the current task passes verification.
4. Limit each commit to the files and changes required for that task.
5. Fix and retest failed verification before proceeding.
6. Preserve commit history for review and live defense.
7. Document the prompt or documentation link for each task when available.

---

## 5. Live Defense — Three-Minute Key-Binding Refactor

**Scenario:** The instructor requests a different keyboard binding for a drum pad.

**Procedure:**
1. Locate the target pad in `index.html`.
2. Change its `data-key` value to the requested key.
3. Confirm the keyboard controller reads the updated contract.
4. Press the new key and verify the correct sound plays.
5. Press the old key and verify it no longer activates that pad, unless another pad uses that binding.
6. Confirm other pads and recording behavior remain correct.

**Acceptance criteria:**
- [ ] Complete the refactor within three minutes.
- [ ] No hardcoded key-to-sound mapping needs to be rewritten.
- [ ] The audio engine remains unchanged.
- [ ] Recorded events contain the updated key and correct sound/pad identifiers.
- [ ] No regression is introduced.

---

## 6. Definition of Done

- [ ] The HTML contract is committed before JavaScript implementation.
- [ ] All four WBS tasks have separate atomic commits.
- [ ] Every task passes its verification criteria.
- [ ] The audio engine supports overlapping playback.
- [ ] The keyboard controller reads HTML bindings and suppresses repeated keydown events.
- [ ] The recorder stores timestamped events in FIFO order.
- [ ] Audio, keyboard input, and recording responsibilities remain separated.
- [ ] No prohibited libraries or external CDNs are used.
- [ ] The three-minute live-defense scenario succeeds.
- [ ] Prompt/documentation links are included when available.

**Final principle:** Define the contract first, implement one task at a time, verify each task independently, and preserve the ability to explain and refactor every component.
