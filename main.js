``
"use strict";

class AudioEngine {
    constructor() {
        this.audioPool = new Set();
        this.preloadedSounds = new Map();
        this.volume = 1;

        this.preloadSounds();
    }

    preloadSounds() {
        const drumPads = document.querySelectorAll(".drum-pad");

        drumPads.forEach((pad) => {
            const soundPath = pad.dataset.sound;

            if (!soundPath || this.preloadedSounds.has(soundPath)) {
                return;
            }

            const audio = new Audio(soundPath);

            audio.preload = "auto";
            this.preloadedSounds.set(soundPath, audio);
        });
    }

    playSound(soundPath) {
        if (!soundPath) {
            return;
        }

        // Create a new Audio instance for every playback.
        // This allows multiple sounds to overlap.
        const audio = new Audio(soundPath);

        audio.volume = this.volume;
        audio.preload = "auto";

        this.audioPool.add(audio);

        // Release the audio reference after playback finishes.
        audio.addEventListener("ended", () => {
            this.audioPool.delete(audio);
            audio.removeAttribute("src");
            audio.load();
        }, { once: true });

        // Handle playback errors and release the reference.
        audio.addEventListener("error", () => {
            this.audioPool.delete(audio);
        }, { once: true });

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                this.audioPool.delete(audio);
                console.error("Unable to play sound:", soundPath, error);
            });
        }
    }
}

const audioEngine = new AudioEngine();

function playPadByKey(key) {
    if (typeof key !== "string") {
        return;
    }

    const normalizedKey = key.toLowerCase();

    const pad = document.querySelector(
    '.drum-pad[data-key="' + normalizedKey + '"]'
    );

    if (!pad) {
        return;
    }

    
    audioEngine.playSound(pad.dataset.sound);

    // Record the key and its relative timestamp.
    if (isRecording) {
    beatQueue.push({
        key: normalizedKey,
        timestamp: performance.now() - recordingStartTime
        });
    }


    pad.classList.add("active");

    setTimeout(() => {
        pad.classList.remove("active");
    }, 100);
} 

// Expose the engine and helper for later steps.
window.audioEngine = audioEngine;
window.playPadByKey = playPadByKey;


// Listen for keyboard input.
window.addEventListener("keydown", (e) => {
    if (e.repeat) {
        return;
    }

    playPadByKey(e.key);
});



 // Step 4: FIFO Beat Recorder state.
let isRecording = false;
let isPlaying = false;
let beatQueue = [];
let recordingStartTime = 0;

const recordButton = document.querySelector("#record-btn");
const playButton = document.querySelector("#play-btn");
const clearButton = document.querySelector("#clear-btn");

// Update the Play button based on the recorded beat queue.
function updateRecorderUI() {
    playButton.disabled = beatQueue.length === 0 || isPlaying;
}

// Start or stop recording.
recordButton.addEventListener("click", () => {
    if (isRecording) {
        isRecording = false;
        recordButton.setAttribute("aria-pressed", "false");
        recordButton.textContent = "Record";
    } else {
        if (isPlaying) {
            return;
        }

        isRecording = true;
        recordingStartTime = performance.now();
        beatQueue = [];

        recordButton.setAttribute("aria-pressed", "true");
        recordButton.textContent = "Stop";

        updateRecorderUI();
    }
});

// Play the recorded beat in FIFO order.
playButton.addEventListener("click", () => {
    if (beatQueue.length === 0 || isPlaying || isRecording) {
        return;
    }

    isPlaying = true;
    updateRecorderUI();

    const recordedBeat = [...beatQueue];
    let previousTimestamp = 0;

    
    let elapsedTime = 0;

    recordedBeat.forEach((event, index) => {
        const delta = event.timestamp - elapsedTime;
        elapsedTime = event.timestamp;

        setTimeout(() => {
            playPadByKey(event.key);

            if (index === recordedBeat.length - 1) {
                isPlaying = false;
                updateRecorderUI();
            }
        }, elapsedTime);
});

});

// Clear the recorded beat queue.
clearButton.addEventListener("click", () => {
    if (isPlaying) {
        return;
    }

    beatQueue = [];
    updateRecorderUI();
});

// Initialize the recorder UI.
updateRecorderUI();
