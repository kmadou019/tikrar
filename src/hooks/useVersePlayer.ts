import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { AudioManager, PlaybackNotificationManager } from "react-native-audio-api";
import { VersePlayer, Selection } from "../lib/versePlayer";
import { stepVerse } from "../lib/versePlan";
import type { Chapter } from "../data/chapters";

type Options = {
  chapter: Chapter;
  artist: string;
  starts: number[];
  speed: number;
  resolve: (n: number) => Promise<string | number>;
};

export type Live = {
  active: boolean;
  playing: boolean;
  finished: boolean;
  verse: number;
  count: number;
  loopPct: number;
  verseElapsed: number;
  verseTotal: number;
};

const IDLE: Live = { active: false, playing: false, finished: false, verse: 1, count: 1, loopPct: 0, verseElapsed: 0, verseTotal: 0 };

const label = (sel: Selection | null, verse: number, count: number) => {
  if (!sel) return "";
  if (sel.kind === "chapter") return `Chapitre entier · ${count}/${sel.reps}`;
  const range = sel.lo === sel.hi ? `Vers ${sel.lo}` : `Vers ${sel.lo}–${sel.hi}`;
  return sel.mode === "plage" ? `${range} · tour ${count}/${sel.reps}` : `Vers ${verse} · ${count}/${sel.reps}`;
};

export function useVersePlayer({ chapter, artist, starts, speed, resolve }: Options) {
  const [player] = useState(() => new VersePlayer());
  const [live, setLive] = useState<Live>(IDLE);
  const [preparing, setPreparing] = useState<null | "download" | "decode">(null);

  const selection = useRef<Selection | null>(null);
  const token = useRef(0);
  const notified = useRef("");
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const hideNotification = useCallback(() => {
    notified.current = "";
    PlaybackNotificationManager.hide().catch(() => {});
  }, []);

  const showNotification = useCallback(
    (verse: number, count: number, playing: boolean) => {
      const text = label(selection.current, verse, count);
      const key = `${text}|${playing}`;
      if (key === notified.current) return;
      notified.current = key;
      PlaybackNotificationManager.show({ title: chapter.ar, artist, album: text, state: playing ? "playing" : "paused" }).catch(() => {});
    },
    [chapter.ar, artist],
  );

  const finish = useCallback(() => {
    setLive((l) => ({ ...l, active: false, playing: false, finished: true }));
    hideNotification();
  }, [hideNotification]);

  useEffect(() => {
    player.setOnFinish(finish);
    return () => player.setOnFinish(null);
  }, [player, finish]);

  // Suivi de la position : l'horloge audio est lue 10 fois par seconde, l'écran n'est rafraîchi que si quelque chose change.
  useEffect(() => {
    if (!live.active) return;
    const id = setInterval(() => {
      const p = player;
      const pos = p.position();
      if (!pos) return;
      if (pos.done) {
        finish();
        return;
      }
      const clock = p.verseClock();
      setLive((l) => {
        const next = {
          ...l,
          playing: p.playing,
          verse: pos.verse,
          count: pos.count,
          loopPct: Math.round(pos.pass * 1000) / 1000,
          verseElapsed: clock ? Math.round(clock.elapsed * 10) / 10 : 0,
          verseTotal: clock ? clock.total : 0,
        };
        return next.playing === l.playing && next.verse === l.verse && next.count === l.count && next.loopPct === l.loopPct && next.verseElapsed === l.verseElapsed ? l : next;
      });
      showNotification(pos.verse, pos.count, p.playing);
    }, 100);
    return () => clearInterval(id);
  }, [live.active, player, showNotification, finish]);

  useEffect(() => {
    player.setRate(speed);
  }, [player, speed]);

  const stop = useCallback(() => {
    token.current++;
    player.stop();
    setPreparing(null);
    setLive(IDLE);
    hideNotification();
  }, [player, hideNotification]);

  const pause = useCallback(async () => {
    await player.pause();
    setLive((l) => ({ ...l, playing: false }));
  }, [player]);

  const resume = useCallback(async () => {
    await player.resume();
    setLive((l) => ({ ...l, playing: true }));
  }, [player]);

  const toggle = useCallback(() => {
    if (player.playing) pause();
    else resume();
  }, [player, pause, resume]);

  const jump = useCallback((verse: number) => player.jump(verse), [player]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const sel = selection.current;
      const pos = player.position();
      if (!sel || sel.kind !== "verses" || !pos) return;
      player.jump(stepVerse(pos.verse, sel.lo, sel.hi, dir));
    },
    [player],
  );

  // Boutons de la notification : lecture, pause, vers suivant / précédent, arrêt.
  useEffect(() => {
    const subs = [
      PlaybackNotificationManager.addEventListener("playbackNotificationPlay", () => resume()),
      PlaybackNotificationManager.addEventListener("playbackNotificationPause", () => pause()),
      PlaybackNotificationManager.addEventListener("playbackNotificationNextTrack", () => step(1)),
      PlaybackNotificationManager.addEventListener("playbackNotificationPreviousTrack", () => step(-1)),
      PlaybackNotificationManager.addEventListener("playbackNotificationStop", () => stop()),
    ];
    return () => subs.forEach((s) => s?.remove());
  }, [resume, pause, step, stop]);

  const play = useCallback(
    async (sel: Selection) => {
      const my = ++token.current;
      selection.current = sel;
      try {
        player.stop();
        setLive(IDLE);
        setPreparing("download");
        const uri = await resolve(chapter.n);
        if (my !== token.current) return;
        setPreparing("decode");
        await player.load(uri);
        if (my !== token.current) return;
        await AudioManager.requestNotificationPermissions().catch(() => {});
        if (my !== token.current) return;
        player.start(sel, starts, speedRef.current);
        const first = sel.kind === "verses" ? sel.lo : 1;
        setLive({ ...IDLE, active: true, playing: true, verse: first });
        setPreparing(null);
        showNotification(first, 1, true);
        PlaybackNotificationManager.enableControl("nextTrack", sel.kind === "verses").catch(() => {});
        PlaybackNotificationManager.enableControl("previousTrack", sel.kind === "verses").catch(() => {});
      } catch {
        if (my !== token.current) return;
        setPreparing(null);
        setLive(IDLE);
        Alert.alert("Lecture impossible", "Le chapitre n'a pas pu être téléchargé ou décodé. Vérifiez votre connexion, puis réessayez.");
      }
    },
    [player, chapter.n, resolve, starts, showNotification],
  );

  const replay = useCallback(() => {
    if (selection.current) play(selection.current);
  }, [play]);

  const closeFinished = useCallback(() => setLive(IDLE), []);

  useEffect(() => {
    const p = player;
    const tokenRef = token;
    return () => {
      tokenRef.current++;
      p.release();
      PlaybackNotificationManager.hide().catch(() => {});
    };
  }, [player]);

  return { live, preparing, play, replay, toggle, stop, step, jump, closeFinished };
}
