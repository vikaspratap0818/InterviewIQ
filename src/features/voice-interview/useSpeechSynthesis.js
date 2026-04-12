import { useState, useCallback } from "react";

export default function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text, { onEnd, persona } = {}) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean text for TTS (remove markdown, extra stars, etc.)
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/#{1,6}\s/g, "") // Remove headers
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    // If voices aren't loaded yet, wait for them
    if (voices.length === 0) {
      console.log("[TTS] Waiting for voices to load...");
      const handleVoicesChanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speak(text, { onEnd, persona });
      };
      // Only set if not already waiting to avoid multiple listeners
      if (!window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      }
      return;
    }

    // Select voice based on persona if possible
    let voice = null;
    if (persona === "HR Manager") {
      // Warm female voice
      voice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Samantha") ||
            v.name.includes("Female") ||
            v.name.includes("Google US English")),
      );
    } else {
      // Professional male voice
      voice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Alex") ||
            v.name.includes("Male") ||
            v.name.includes("Daniel")),
      );
    }

    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      console.log("[TTS] Started speaking");
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      console.log("[TTS] Finished speaking");
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, cancel };
}
