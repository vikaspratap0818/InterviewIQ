import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useVoiceRecorder - Hook for Web Speech API transcription.
 * Features: Continuous recording, interim results, auto-restart on silence, robust error handling.
 */
export default function useVoiceRecorder({ onTranscript, onFinalTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState("");
  const interimTextRef = useRef("");

  const recognitionRef = useRef(null);
  const shouldBeRecording = useRef(false);
  const callbacksRef = useRef({ onTranscript, onFinalTranscript });

  // Update callbacks ref when they change to avoid re-running useEffect
  useEffect(() => {
    callbacksRef.current = { onTranscript, onFinalTranscript };
  }, [onTranscript, onFinalTranscript]);

  const updateInterim = (text) => {
    interimTextRef.current = text;
    setInterimText(text);
    if (callbacksRef.current.onTranscript) {
      callbacksRef.current.onTranscript(text);
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("[Voice] Recognition started");
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      // Important: Always update interim state
      updateInterim(interim);

      if (finalText) {
        console.log("[Voice] Final transcript segment:", finalText.trim());
        if (callbacksRef.current.onFinalTranscript) {
          callbacksRef.current.onFinalTranscript(finalText.trim());
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("[Voice] Recognition error:", event.error);

      // Handle specific errors
      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          setIsSupported(false);
          shouldBeRecording.current = false;
          setIsRecording(false);
          break;
        case "no-speech":
          // no-speech is common, we'll let onend handle the restart
          break;
        case "aborted":
          // usually means we stopped it manually
          break;
        default:
          // For other errors, we might want to stop
          console.warn("[Voice] Unhandled error type:", event.error);
      }
    };

    recognition.onend = () => {
      console.log(
        "[Voice] Recognition ended. shouldBeRecording:",
        shouldBeRecording.current,
      );

      // If we have remaining interim text and we're stopping,
      // treat it as a final result for the UI
      if (!shouldBeRecording.current && interimTextRef.current) {
        console.log(
          "[Voice] Flushing final interim text:",
          interimTextRef.current,
        );
        if (callbacksRef.current.onFinalTranscript) {
          callbacksRef.current.onFinalTranscript(interimTextRef.current.trim());
        }
      }

      // If the browser ends it automatically but we still want to record, restart it
      if (shouldBeRecording.current) {
        try {
          console.log("[Voice] Attempting auto-restart...");
          recognition.start();
        } catch (err) {
          // If already started or other error, ignore
          if (!err.message?.includes("already started")) {
            console.error("[Voice] Failed to restart:", err);
            setIsRecording(false);
            shouldBeRecording.current = false;
          }
        }
      } else {
        setIsRecording(false);
        updateInterim("");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      console.log("[Voice] Cleaning up recognition...");
      shouldBeRecording.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors on cleanup
        }
      }
    };
  }, []); // Run once on mount

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    console.log("[Voice] User requested start");
    setInterimText("");
    shouldBeRecording.current = true;

    try {
      recognitionRef.current.start();
    } catch (err) {
      if (err.message?.includes("already started")) {
        console.warn("[Voice] Already running");
        setIsRecording(true);
      } else {
        console.error("[Voice] Start error:", err);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log("[Voice] User requested stop");
    shouldBeRecording.current = false;
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn("[Voice] Stop error:", err);
    }

    setIsRecording(false);
  }, []);

  return {
    isRecording,
    isSupported,
    interimText,
    startRecording,
    stopRecording,
  };
}
