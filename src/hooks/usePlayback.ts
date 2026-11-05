import { useCallback, useEffect, useRef, useState } from "react";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Alert } from "react-native";
import type { Chapter } from "../data/chapters";

type Session = {
  mode: "one" | "sel";
  order: number[];
  pos: number;
  rep: number;
  lap: number;
  laps: number;
};

type Options = {
  chapters: Chapter[];
  artist: string;
  repsOf: (n: number) => number;
  checked: number[];
  tours: number;
  speed: number;
  // Renvoie la source à jouer (télécharge le chapitre si besoin) ; `prefetch` prépare le suivant.
  resolve: (n: number) => Promise<string | number>;
  prefetch: (n: number) => void;
};

export function usePlayback({ chapters, artist, repsOf, checked, tours, speed, resolve, prefetch }: Options) {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [session, setSession] = useState<Session | null>(null);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const sessionRef = useRef<Session | null>(null);
  const repsRef = useRef(repsOf);
  const speedRef = useRef(speed);
  const resolveRef = useRef(resolve);
  const prefetchRef = useRef(prefetch);
  const loadToken = useRef(0);

  useEffect(() => {
    repsRef.current = repsOf;
    speedRef.current = speed;
    resolveRef.current = resolve;
    prefetchRef.current = prefetch;
  }, [repsOf, speed, resolve, prefetch]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    player.setPlaybackRate(speed);
  }, [player, speed]);

  useEffect(() => () => player.clearLockScreenControls(), [player]);

  const commit = useCallback((next: Session | null) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  const lockScreen = useCallback(
    (s: Session, first: boolean) => {
      const n = s.order[s.pos];
      const meta = {
        title: chapters[n - 1].ar,
        artist,
        albumTitle: `${chapters[n - 1].fr} · rép. ${s.rep}/${repsRef.current(n)}`,
      };
      if (first) player.setActiveForLockScreen(true, meta);
      else player.updateLockScreenMetadata(meta);
    },
    [player, chapters, artist],
  );

  const loadChapter = useCallback(
    async (n: number, upcoming?: number) => {
      const token = ++loadToken.current;
      setLoading(true);
      player.pause();
      try {
        const source = await resolveRef.current(n);
        if (token !== loadToken.current) return;
        player.replace(source);
        player.setPlaybackRate(speedRef.current);
        player.play();
        if (upcoming) prefetchRef.current(upcoming);
      } catch {
        if (token !== loadToken.current) return;
        Alert.alert("Téléchargement impossible", "Vérifiez votre connexion Internet, puis réessayez.");
        player.clearLockScreenControls();
        commit(null);
      } finally {
        if (token === loadToken.current) setLoading(false);
      }
    },
    [player, commit],
  );

  // Chapitre qui suivra celui-ci, pour le télécharger à l'avance.
  const upcomingOf = useCallback(
    (s: Session): number | undefined => {
      if (s.mode === "one") return s.order[s.pos] < chapters.length ? s.order[s.pos] + 1 : undefined;
      return s.order[s.pos + 1] ?? (s.lap < s.laps ? s.order[0] : undefined);
    },
    [chapters.length],
  );

  const begin = useCallback(
    (next: Session) => {
      setFinished(false);
      const first = sessionRef.current === null;
      commit(next);
      loadChapter(next.order[next.pos], upcomingOf(next));
      lockScreen(next, first);
    },
    [commit, loadChapter, lockScreen, upcomingOf],
  );

  const end = useCallback(
    (done: boolean) => {
      loadToken.current++;
      setLoading(false);
      player.pause();
      player.clearLockScreenControls();
      commit(null);
      setFinished(done);
    },
    [player, commit],
  );

  const playOne = useCallback(
    (n: number) => {
      const cur = sessionRef.current;
      if (cur && cur.order[cur.pos] === n) {
        if (status.playing) player.pause();
        else player.play();
        return;
      }
      begin({ mode: "one", order: [n], pos: 0, rep: 1, lap: 1, laps: 1 });
    },
    [begin, player, status.playing],
  );

  const playSelection = useCallback(() => {
    if (!checked.length) return;
    begin({ mode: "sel", order: checked, pos: 0, rep: 1, lap: 1, laps: tours });
  }, [begin, checked, tours]);

  const toggle = useCallback(() => {
    if (!sessionRef.current || loading) return;
    if (status.playing) player.pause();
    else player.play();
  }, [player, status.playing, loading]);

  const go = useCallback(
    (step: 1 | -1) => {
      const cur = sessionRef.current;
      if (!cur) return;
      if (cur.mode === "sel") {
        const j = cur.pos + step;
        if (j >= 0 && j < cur.order.length) begin({ ...cur, pos: j, rep: 1 });
        else if (step > 0) end(true);
      } else {
        const n = cur.order[cur.pos] + step;
        if (n >= 1 && n <= chapters.length) begin({ ...cur, order: [n], pos: 0, rep: 1 });
      }
    },
    [begin, end, chapters],
  );

  // Fin d'un passage : on répète, on passe au chapitre suivant, on refait un tour ou on termine.
  useEffect(() => {
    if (!status.didJustFinish) return;
    const cur = sessionRef.current;
    if (!cur) return;
    const n = cur.order[cur.pos];
    if (cur.rep < repsRef.current(n)) {
      const next = { ...cur, rep: cur.rep + 1 };
      commit(next);
      lockScreen(next, false);
      player.seekTo(0).then(() => player.play());
    } else if (cur.pos + 1 < cur.order.length) {
      begin({ ...cur, pos: cur.pos + 1, rep: 1 });
    } else if (cur.mode === "sel" && cur.lap < cur.laps) {
      begin({ ...cur, pos: 0, rep: 1, lap: cur.lap + 1 });
    } else {
      end(cur.mode === "sel");
    }
  }, [status.didJustFinish]); // eslint-disable-line react-hooks/exhaustive-deps

  // Garde le compteur de répétitions du verrouillage à jour si l'utilisateur le modifie en cours de route.
  useEffect(() => {
    if (sessionRef.current) lockScreen(sessionRef.current, false);
  }, [repsOf]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    session,
    active: session ? session.order[session.pos] : null,
    finished,
    closeFinished: () => setFinished(false),
    playing: status.playing,
    loading,
    currentTime: status.currentTime,
    duration: status.duration,
    playOne,
    playSelection,
    toggle,
    next: () => go(1),
    prev: () => go(-1),
    stop: () => end(false),
  };
}
