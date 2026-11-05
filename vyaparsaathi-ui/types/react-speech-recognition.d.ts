declare module "react-speech-recognition" {
  export type SpeechRecognitionOptions = {
    continuous?: boolean;
    language?: string;
  };

  export type SpeechRecognitionResult = {
    transcript: string;
    listening: boolean;
    isMicrophoneAvailable: boolean;
    browserSupportsSpeechRecognition: boolean;
    browserSupportsContinuousListening: boolean;
    resetTranscript: () => void;
  };

  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => Promise<void>;
    stopListening: () => Promise<void>;
  };

  export function useSpeechRecognition(): SpeechRecognitionResult;
  export default SpeechRecognition;
}
