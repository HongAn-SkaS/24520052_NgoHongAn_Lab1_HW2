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
