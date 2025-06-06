import { useRef, useEffect } from "react";

export function useAudio(audioPath: string, poolSize = 3) {
  const poolRef = useRef<HTMLAudioElement[]>([]);
  const idxRef = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      poolRef.current = Array.from({ length: poolSize }, () => new Audio(audioPath));
      // iOS対策: ユーザー操作で一度だけ全Audioを再生・停止
      const unlock = () => {
        poolRef.current.forEach(audio => {
          audio.play().catch(() => {});
          audio.pause();
          audio.currentTime = 0;
        });
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("mousedown", unlock);
      };
      window.addEventListener("touchstart", unlock, { once: true });
      window.addEventListener("mousedown", unlock, { once: true });
    }
  }, [audioPath, poolSize]);

  const play = () => {
    if (poolRef.current.length > 0) {
      idxRef.current = (idxRef.current + 1) % poolRef.current.length;
      const audio = poolRef.current[idxRef.current];
      audio.pause();
      audio.currentTime = 0;
      audio.play();
    }
  };

  return play;
}