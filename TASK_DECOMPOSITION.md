# HW2 — Drum Kit Engine: Task Decomposition

## 1. Project Overview

**Project:** HW2 — Drum Kit Engine  
**Methodology:** Work Breakdown Structure (WBS) + Contract-First Development  
**Technology Stack:** Vanilla HTML5, Modern CSS, ES6+ JavaScript

### Technical Constraints

- Use only Vanilla HTML5, CSS, and ES6+ JavaScript.
- Do not use jQuery, Bootstrap, Tailwind CSS, or external CDNs.
- Follow Contract-First Development: define and commit the HTML data contract before implementing JavaScript.
- Each step must be completed and verified independently.
- Each step must produce exactly one atomic commit.
- Do not implement all features in a single AI-generated solution. One-shot AI implementation receives zero points.
- Every step must have explicit verification criteria.
- The implementation must support live defense: when the instructor changes key bindings, the developer must be able to refactor and verify the change within three minutes.

---

## 2. Work Breakdown Structure (WBS)

### Step 1 — HTML Data-Sound Contract

**WBS ID:** 1.0

#### Objective

Define the HTML interface contract that connects drum pads, keyboard bindings, and sound identifiers.

The HTML contract must be completed and committed before any JavaScript implementation begins.

#### Files Involved

- `index.html`
- Relevant CSS files, only if basic pad styling is required.

#### Contract

Each drum pad must expose the following HTML data attributes:

- `data-key`: Keyboard key associated with the pad.
- `data-sound`: Stable sound identifier used by the audio engine.
- `data-pad`: Unique identifier for the drum pad.

Contract requirements:

1. Every drum pad must have all three attributes.
2. Every `data-key` value must correspond to a valid keyboard binding.
3. Every `data-sound` value must identify a sound supported by the planned audio engine.
4. Every `data-pad` value must uniquely identify its pad.
5. JavaScript must consume these attributes instead of relying on hardcoded DOM positions or duplicated key-to-sound mappings.
6. Changing a key binding in the HTML must not require rewriting the audio playback engine.

#### Verification Criteria

- [ ] All drum pads contain `data-key`, `data-sound`, and `data-pad`.
- [ ] Each pad has a unique `data-pad` identifier.
- [ ] Each keyboard binding is represented explicitly in the HTML contract.
- [ ] Sound identifiers are stable and consistent.
- [ ] The HTML can be inspected to determine the key-to-sound mapping without reading JavaScript.
- [ ] The contract commit exists before any JavaScript implementation commit.

#### Commit Message

`feat(html): define drum pad data-sound contract`

#### Prompt Link

<!-- Add the prompt/documentation link here. -->

---

### Step 2 — Polyphonic Audio Playback Engine

**WBS ID:** 2.0

#### Objective

Implement an audio playback engine that supports overlapping drum sounds without depending on UI event handling.

The engine must be responsible for sound playback only. Keyboard listeners, visual pad interactions, and recording logic must remain outside the audio engine.

#### Files Involved

- `js/audio-engine.js`
- `index.html`, only if an external JavaScript file reference must be added.

#### Contract

The audio engine consumes a sound identifier defined by the HTML `data-sound` contract.

Responsibilities:

1. Initialize or prepare the audio subsystem when required.
2. Resolve a sound identifier to its corresponding audio resource.
3. Play a requested sound without requiring a keyboard event or DOM element.
4. Support polyphonic playback, allowing multiple sounds to overlap.
5. Keep audio playback logic independent of UI rendering and keyboard bindings.
6. Handle unknown sound identifiers and unavailable audio resources without silently breaking the application.

The engine must not own:

- Keyboard event listeners.
- Drum pad DOM selection.
- Pad highlighting or other UI updates.
- Beat recording or FIFO queue management.

#### Verification Criteria

- [ ] The audio engine can be invoked independently of keyboard input.
- [ ] A valid sound identifier triggers the corresponding sound.
- [ ] Multiple playback requests can overlap without one request unnecessarily stopping another.
- [ ] An unknown sound identifier is handled safely.
- [ ] The audio engine does not depend on hardcoded keyboard bindings.
- [ ] Audio playback can be tested without implementing the recorder.
- [ ] Browser audio restrictions, including user-gesture requirements, are handled appropriately.

#### Commit Message

`feat(audio): implement polyphonic playback engine`

#### Prompt Link

<!-- Add the prompt/documentation link here. -->

---

### Step 3 — Keyboard Listener and Repeat Throttling

**WBS ID:** 3.0

#### Objective

Implement keyboard input handling that translates keyboard events into sound playback requests using the HTML data contract.

Prevent a held key from generating an uncontrolled number of playback requests through `event.repeat` throttling.

#### Files Involved

- `js/keyboard-controller.js`
- `js/audio-engine.js`, integration only.
- `index.html`, only if a script reference must be added.

#### Contract

The keyboard controller must derive its bindings from the drum pad HTML attributes:

- `data-key`: Determines which keyboard key activates a pad.
- `data-sound`: Identifies the sound to request from the audio engine.
- `data-pad`: Identifies the corresponding pad for UI interaction or future event tracking.

Responsibilities:

1. Listen for keyboard input.
2. Normalize keyboard input consistently before matching it against `data-key`.
3. Resolve the pressed key through the HTML contract.
4. Request playback from the audio engine using `data-sound`.
5. Use `event.repeat` to prevent repeated playback caused by holding a key.
6. Ignore unrelated keys and avoid unintended activation when typing in editable form controls.
7. Keep keyboard mapping separate from the audio playback implementation.

The controller must not duplicate the key-to-sound mapping in a hardcoded JavaScript lookup table.

#### Verification Criteria

- [ ] Pressing a mapped key triggers the correct sound.
- [ ] Pressing an unmapped key does not trigger a sound.
- [ ] Holding a mapped key does not repeatedly trigger playback through repeated `keydown` events.
- [ ] Pressing a key again after releasing it triggers playback normally.
- [ ] The controller obtains mappings from HTML data attributes.
- [ ] Changing a pad's `data-key` value changes its keyboard binding without modifying the audio engine.
- [ ] Keyboard input does not interfere with typing in editable controls.
- [ ] The keyboard controller can be tested independently of the beat recorder.

#### Commit Message

`feat(input): add keyboard controller with repeat throttling`

#### Prompt Link

<!-- Add the prompt/documentation link here. -->

---

### Step 4 — FIFO Beat Recorder

**WBS ID:** 4.0

#### Objective

Implement a First-In, First-Out (FIFO) beat recorder that captures drum activation events in chronological order using timestamps.

The recorder must remain independent of keyboard event listeners, audio playback implementation, and UI rendering.

#### Files Involved

- `js/beat-recorder.js`
- `js/keyboard-controller.js`, integration only.
- `js/audio-engine.js`, integration only if required by the event flow.

#### Contract

The recorder receives normalized drum activation events based on the existing HTML contract.

Each recorded event must contain:

- `timestamp`: The time at which the drum activation was captured, using a consistent time source.
- `data-key`: The keyboard binding associated with the activation.
- `data-sound`: The sound identifier associated with the activation.
- `data-pad`: The identifier of the activated drum pad.

Implementation requirements:

1. Store events in a FIFO queue.
2. Append new events to the end of the queue.
3. Process or retrieve events in their original insertion order.
4. Record timestamps when activation events are captured, not when they are eventually processed.
5. Use a consistent time source for all recorded events.
6. Keep recording logic independent of DOM rendering and audio resource management.
7. Ensure that the recorder captures valid activation events without duplicating events caused by repeated `keydown` events.
8. Define a clear interface for starting, stopping, and retrieving recorded events if these operations are required by the implementation.

The recorder must not implement its own keyboard listener or duplicate the HTML key-binding configuration.

#### Verification Criteria

- [ ] Each accepted drum activation creates a timestamped event.
- [ ] Events are appended to the end of the FIFO queue.
- [ ] Events are retrieved or processed in the order they were recorded.
- [ ] Timestamps use a consistent clock and preserve event ordering.
- [ ] Recorded events retain the correct key, sound, and pad identifiers.
- [ ] Repeated `keydown` events suppressed by the keyboard controller do not create duplicate recording events.
- [ ] The recorder can be tested with simulated events without requiring actual audio playback.
- [ ] Recording logic does not depend on UI rendering.
- [ ] Starting, stopping, and retrieving recordings behave consistently according to the implemented interface.

#### Commit Message

`feat(recorder): implement FIFO timestamped beat recorder`

#### Prompt Link

<!-- Add the prompt/documentation link here. -->

---

## 3. Dependency Order

The implementation must follow the dependency order below.

| Order | WBS ID | Task | Depends On |
|---|---|---|---|
| 1 | 1.0 | HTML Data-Sound Contract | None |
| 2 | 2.0 | Polyphonic Audio Engine | Step 1 contract |
| 3 | 3.0 | Keyboard Listener and Repeat Throttling | Steps 1 and 2 |
| 4 | 4.0 | FIFO Beat Recorder | Steps 1, 2, and 3 integration |

**Mandatory rule:** Step 1 must be committed and verified before any JavaScript implementation begins.

The audio engine must remain independent of the keyboard controller. The recorder must consume activation events through a defined interface rather than owning the keyboard listener.

---

## 4. Atomic Commit Policy

Each WBS step must be implemented, verified, and committed separately.

| Step | Commit Message | Acceptance Gate |
|---|---|---|
| 1 | `feat(html): define drum pad data-sound contract` | HTML contract verified |
| 2 | `feat(audio): implement polyphonic playback engine` | Independent and overlapping playback verified |
| 3 | `feat(input): add keyboard controller with repeat throttling` | Key mapping and repeat suppression verified |
| 4 | `feat(recorder): implement FIFO timestamped beat recorder` | Timestamped FIFO recording verified |

Rules:

1. One step equals one atomic commit.
2. Do not combine all four steps into one commit.
3. Do not begin the next step before verifying the current step.
4. Keep each commit limited to the files and changes required for its task.
5. If a step fails verification, fix and verify it before proceeding.
6. Keep commit history available for review and live defense.
7. Document the prompt link for each step when the corresponding prompt is available.

---

## 5. Live Defense: Three-Minute Key-Binding Refactor

### Objective

Demonstrate that keyboard bindings are controlled by the HTML contract rather than hardcoded into the JavaScript implementation.

### Defense Scenario

The instructor changes a drum pad's keyboard binding.

### Expected Procedure

1. **Inspect the HTML contract:** Locate the relevant pad and its `data-key` attribute.
2. **Update the binding:** Change the attribute to the instructor's requested key, ensuring the binding remains unique.
3. **Verify the mapping:** Confirm that the keyboard controller resolves the updated binding from the HTML.
4. **Test the new key:** Press the new key and confirm that the correct sound plays.
5. **Test the old key:** Confirm that the old binding no longer activates that pad, unless another pad explicitly uses it.
6. **Check regression:** Confirm that other pads and the audio engine still work.

### Acceptance Criteria

- [ ] The refactor is completed within three minutes.
- [ ] No hardcoded key-to-sound lookup needs to be rewritten.
- [ ] The audio playback engine remains unchanged.
- [ ] The recorder continues to capture the correct key, sound, and pad identifiers.
- [ ] The updated behavior is demonstrated successfully.

---

## 6. Definition of Done

The HW2 implementation is complete when:

- [ ] The HTML data contract was committed before JavaScript implementation.
- [ ] All four WBS steps have separate atomic commits.
- [ ] Every step passes its verification criteria.
- [ ] Audio playback supports overlapping sounds.
- [ ] Keyboard input uses the HTML contract and suppresses repeated `keydown` events.
- [ ] The recorder stores timestamped activation events in FIFO order.
- [ ] Audio, input handling, and recording logic remain appropriately separated.
- [ ] No prohibited libraries or external CDNs are used.
- [ ] The three-minute live-defense scenario can be completed successfully.
- [ ] Each step's prompt link is documented when available.

**Final principle:** Contract first, implement incrementally, verify every step, and preserve the ability to explain and refactor each component independently.
