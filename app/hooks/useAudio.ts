import { useRef, useEffect } from "react";

export function useAudio(audioPath: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(audioPath);
      // iOS対策: ユーザー操作で一度だけ再生・停止
      const unlock = () => {
        audioRef.current?.play().catch(() => {});
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("mousedown", unlock);
      };
      window.addEventListener("touchstart", unlock, { once: true });
      window.addEventListener("mousedown", unlock, { once: true });
    }
  }, [audioPath]);

  // 再生関数
  const play = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return play;
}