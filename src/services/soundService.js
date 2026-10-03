// soundService.js - Audio playback service for incoming calls and tickets

class SoundService {
  constructor() {
    this.callAudio = null;
    this.ticketAudio = null;
    this.isUnlocked = false;

    if (typeof window !== "undefined") {
      this.initAudio();
      // Unlock on first click or touch
      const unlock = () => {
        this.isUnlocked = true;
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("click", unlock);
      window.addEventListener("touchstart", unlock);
      window.addEventListener("keydown", unlock);
    }
  }

  initAudio() {
    try {
      this.callAudio = new Audio("/audio/call.mp3");
      this.ticketAudio = new Audio("/audio/ticket.mp3");

      this.callAudio.preload = "auto";
      this.ticketAudio.preload = "auto";
    } catch (e) {
      console.warn("[SoundService] Could not initialize audio elements:", e);
    }
  }

  async playSound(type) {
    try {
      const audio = type === "call" ? this.callAudio : this.ticketAudio;
      if (!audio) return;

      audio.currentTime = 0;
      await audio.play();
    } catch (err) {
      console.warn(`[SoundService] Autoplay blocked or error playing ${type} sound:`, err);
    }
  }
}

export const soundService = new SoundService();
export default soundService;
