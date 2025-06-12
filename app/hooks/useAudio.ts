import { useRef, useEffect } from "react";

export function useAudio(audioPath: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(audioPath);
    }
  }, [audioPath]);

  // 再生関数
  const play = (volume: number = 1.0) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;
      audioRef.current.play();
    }
  };

  return play;
}