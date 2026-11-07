import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Corpus } from "../data/corpora";
import type { Chapter } from "../data/chapters";
import { est, fmt } from "../data/chapters";
import { verseStarts } from "../data/verses";
import { verseText } from "../data/verseTexts";
import type { PlanMode } from "../lib/versePlan";
import type { Selection } from "../lib/versePlayer";
import { clamp, usePrefs } from "../hooks/usePrefs";
import { useRemoteCache } from "../hooks/useRemoteCache";
import { useVersePlayer } from "../hooks/useVersePlayer";
import { FONT, Theme } from "../theme";
import { Icon } from "../components/Icon";
import { Keypad } from "../components/verse/Keypad";
import { SetupPanel } from "../components/verse/SetupPanel";
import { VersePlayerPanel } from "../components/verse/VersePlayerPanel";
import { VerseRow } from "../components/verse/VerseRow";

type Props = {
  t: Theme;
  corpus: Corpus;
  chapter: Chapter;
  speed: number;
  onCycleSpeed: () => void;
  onBack: () => void;
};

type Kp = null | "start" | "end" | "reps" | "jump" | "chapReps";

export function VerseScreen({ t, corpus, chapter, speed, onCycleSpeed, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const starts = useMemo(() => verseStarts(corpus.id, chapter.n) ?? [], [corpus.id, chapter.n]);
  const texts = verseText(corpus.id, chapter.n);
  const split = starts.length > 0;
  const total = starts.length;

  const { repsOf, setRep } = usePrefs(corpus.id, corpus.chapters);
  const chapReps = repsOf(chapter.n);
  const cache = useRemoteCache(corpus.chapters);
  const player = useVersePlayer({ chapter, artist: corpus.artist, starts, speed, resolve: cache.resolve });
  const { live } = player;

  const [s, setS] = useState<number | null>(null);
  const [e, setE] = useState<number | null>(null);
  const [mode, setMode] = useState<PlanMode>("plage");
  const [repsPlage, setRepsPlage] = useState(100);
  const [repsChaque, setRepsChaque] = useState(10);
  const [kp, setKp] = useState<Kp>(null);
  const [playing, setPlaying] = useState<Selection | null>(null);

  const reps = mode === "plage" ? repsPlage : repsChaque;
  const setReps = (v: number) => (mode === "plage" ? setRepsPlage : setRepsChaque)(clamp(v, 1, 999));
  const lo = s == null || e == null ? null : Math.min(s, e);
  const hi = s == null || e == null ? null : Math.max(s, e);
  const nSel = lo == null || hi == null ? 0 : hi - lo + 1;

  // Durée de chaque vers : du début de ce vers au début du suivant (le dernier va jusqu'à la fin du chapitre).
  const durOf = (n: number) => (n < total ? starts[n] : chapter.dur) - starts[n - 1];
  const selSecs = useMemo(() => {
    let sum = 0;
    if (lo != null && hi != null) for (let n = lo; n <= hi; n++) sum += durOf(n);
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lo, hi, starts, chapter.dur]);
  const totalSecs = selSecs * reps;

  const listRef = useRef<FlatList<number>>(null);
  const scrollTo = (n: number, animated: boolean) => listRef.current?.scrollToIndex({ index: n - 1, animated, viewPosition: 0.5 });

  // La liste suit le vers en cours de lecture.
  useEffect(() => {
    if (live.active && split) scrollTo(live.verse, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.verse, live.active]);

  const tap = (n: number) => {
    if (live.active) {
      if (lo != null && hi != null && n >= lo && n <= hi) player.jump(n);
      return;
    }
    if (s == null || e == null) {
      setS(n);
      setE(n);
    } else if (s === e) {
      if (n === s) {
        setS(null);
        setE(null);
      } else {
        setS(Math.min(s, n));
        setE(Math.max(s, n));
      }
    } else {
      setS(n);
      setE(n);
    }
    if (live.finished) player.closeFinished();
  };

  const playVerses = () => {
    if (lo == null || hi == null) return;
    const sel: Selection = { kind: "verses", lo, hi, mode, reps };
    setPlaying(sel);
    player.play(sel);
  };
  const playChapter = () => {
    const sel: Selection = { kind: "chapter", reps: chapReps };
    setPlaying(sel);
    player.play(sel);
  };

  const confirmKp = (v: number) => {
    if (kp === "reps") setReps(v);
    else if (kp === "chapReps") setRep(chapter.n, v);
    else if (kp === "start") {
      const top = e == null || s == null ? v : Math.max(Math.max(s, e), v);
      setS(v);
      setE(top);
    } else if (kp === "end") {
      const bottom = s == null || e == null ? v : Math.min(Math.min(s, e), v);
      setS(bottom);
      setE(v);
    } else if (kp === "jump") setTimeout(() => scrollTo(v, true), 30);
    setKp(null);
  };

  const kpTitle = { start: "Vers de début", end: "Vers de fin", reps: "Nombre de répétitions", jump: "Aller au vers", chapReps: "Répétitions du chapitre" };
  const kpInitial =
    kp === "start" ? String(lo ?? "") : kp === "end" ? String(hi ?? "") : kp === "reps" ? String(reps) : kp === "chapReps" ? String(chapReps) : "";

  const mainReps = playing?.reps ?? reps;
  const playingRange = playing?.kind === "verses" ? playing : null;
  const modeLabel = playing?.kind === "chapter" ? "Chapitre entier" : playingRange?.mode === "plage" ? "La plage en boucle" : "Chaque vers N fois";
  const rangeTitle = playingRange ? (playingRange.lo === playingRange.hi ? `Vers ${playingRange.lo}` : `Vers ${playingRange.lo} à ${playingRange.hi}`) : "Chapitre entier";
  const playingN = playingRange ? playingRange.hi - playingRange.lo + 1 : 0;
  const curInfo = playingRange
    ? `Vers ${live.verse} · ${fmt(live.verseElapsed)} / ${fmt(live.verseTotal)}${playingN > 1 ? ` · ${live.verse - playingRange.lo + 1}/${playingN} de la plage` : ""}`
    : `${fmt(chapter.dur * live.loopPct)} / ${fmt(chapter.dur)}`;
  const countWord =
    playing?.kind === "chapter" ? "répétitions du chapitre" : playingRange?.mode === "plage" ? "tours de la plage" : `répétitions du vers ${live.verse}`;

  const finSub = playingRange
    ? `${playingN > 1 ? `Vers ${playingRange.lo} → ${playingRange.hi}` : `Vers ${playingRange.lo}`} · ${playingRange.mode === "plage" ? `${playingRange.reps} tours` : `chaque vers × ${playingRange.reps}`}`
    : `Chapitre entier · ${mainReps} répétitions`;

  const panelNoSplit = !split && !live.active;
  const showSetup = split && !live.active && !live.finished;
  const showPlayer = live.active;
  const showFin = !live.active && live.finished;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.backRow}>
            <Pressable accessibilityLabel="Retour aux chapitres" onPress={onBack} style={styles.back}>
              <Icon name="back" size={22} color={t.ink} />
            </Pressable>
            <Text numberOfLines={1} style={[styles.kicker, { color: t.muted }]}>{corpus.fr.toUpperCase()}</Text>
          </View>
          {split && (
            <Pressable onPress={() => setKp("jump")} style={[styles.jump, { borderColor: t.line, backgroundColor: t.surface }]}>
              <Icon name="jump" size={16} color={t.ink} />
              <Text style={[styles.jumpText, { color: t.ink }]}>Aller au vers</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.titles}>
          <Text style={[styles.ar, { color: t.ink }]}>{chapter.ar}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: t.muted }]}>{split ? `${total} vers · ${fmt(chapter.dur)}` : `Non découpé · ${fmt(chapter.dur)}`}</Text>
            <Text style={[styles.metaFr, { color: t.muted }]}>{chapter.fr}</Text>
          </View>
        </View>
        {split && (
          <Pressable
            disabled={!!player.preparing || live.active}
            onPress={playChapter}
            style={[styles.whole, { borderColor: t.accent, opacity: player.preparing || live.active ? 0.5 : 1 }]}
          >
            <View style={styles.wholeLeft}>
              <Icon name="play" size={16} color={t.accent} />
              <Text style={[styles.wholeText, { color: t.accent }]}>Écouter le chapitre entier</Text>
            </View>
            <Text style={[styles.wholeReps, { color: t.accent }]}>×{chapReps}</Text>
          </Pressable>
        )}
      </View>

      {split && !texts && (
        <View style={[styles.banner, { backgroundColor: t.surface, borderColor: t.line }]}>
          <Text style={[styles.bannerText, { color: t.muted }]}>Le texte des vers n’est pas encore disponible : seuls le numéro et la durée s’affichent. L’écoute fonctionne normalement.</Text>
        </View>
      )}

      {split ? (
        <FlatList
          ref={listRef}
          style={[styles.list, { borderTopColor: t.line }]}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 12 }}
          data={starts.map((_, i) => i + 1)}
          keyExtractor={(n) => String(n)}
          extraData={[lo, hi, live.verse, live.active]}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            listRef.current?.scrollToOffset({ offset: averageItemLength * index, animated: false });
            setTimeout(() => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 }), 120);
          }}
          renderItem={({ item: n }) => {
            const inRange = lo != null && hi != null && n >= lo && n <= hi;
            return (
              <VerseRow
                t={t}
                n={n}
                dur={fmt(durOf(n))}
                text={texts?.[n - 1]}
                inRange={inRange}
                isEdge={inRange && (n === lo || n === hi)}
                isFirst={n === lo}
                isLast={n === hi}
                isCur={live.active && n === live.verse}
                onPress={() => tap(n)}
              />
            );
          }}
        />
      ) : (
        <View style={[styles.empty, { borderTopColor: t.line }]}>
          <View style={[styles.emptyIcon, { backgroundColor: t.tint }]}>
            <Icon name="rows" size={26} color={t.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: t.ink }]}>Le découpage par vers n’est pas encore disponible pour ce chapitre.</Text>
          <Text style={[styles.emptyText, { color: t.muted }]}>Vous pouvez l’écouter en entier, avec son compteur de répétitions habituel.</Text>
        </View>
      )}

      {panelNoSplit && (
        <View style={[styles.panel, { backgroundColor: t.surface, borderTopColor: t.line, shadowColor: t.shadow, paddingBottom: 18 + insets.bottom }]}>
          <View style={styles.panelRow}>
            <Text style={[styles.panelLabel, { color: t.ink }]}>Répétitions du chapitre</Text>
            <View style={[styles.stepper, { borderColor: t.line, backgroundColor: t.bg }]}>
              <Pressable accessibilityLabel="Une répétition de moins" onPress={() => setRep(chapter.n, chapReps - 1)} style={styles.stepBtn}>
                <Icon name="minus" size={16} color={t.ink} />
              </Pressable>
              <Pressable accessibilityLabel={`Nombre de répétitions : ${chapReps}, modifier au clavier`} onPress={() => setKp("chapReps")} style={styles.stepValue}>
                <Text style={[styles.stepText, { color: t.ink }]}>×{chapReps}</Text>
              </Pressable>
              <Pressable accessibilityLabel="Une répétition de plus" onPress={() => setRep(chapter.n, chapReps + 1)} style={styles.stepBtn}>
                <Icon name="plus" size={16} color={t.ink} />
              </Pressable>
            </View>
          </View>
          <Pressable disabled={!!player.preparing} onPress={playChapter} style={[styles.bigPlay, { backgroundColor: player.preparing ? t.disabledBg : t.accent }]}>
            <Icon name={player.preparing ? "download" : "play"} size={18} color={player.preparing ? t.accent : t.accentInk} />
            <View>
              <Text style={[styles.bigTitle, { color: player.preparing ? t.ink : t.accentInk }]}>
                {player.preparing === "download" ? "Téléchargement de l’audio…" : player.preparing === "decode" ? "Préparation de l’audio…" : "Écouter le chapitre entier"}
              </Text>
              <Text style={[styles.bigSub, { color: player.preparing ? t.muted : t.accentInk }]}>{`×${chapReps} · ${est(chapter.dur * chapReps)}`}</Text>
            </View>
          </Pressable>
        </View>
      )}

      {showSetup && (
        <SetupPanel
          t={t}
          lo={lo}
          hi={hi}
          mode={mode}
          reps={reps}
          rangeInfo={lo == null ? "Touchez un vers pour commencer" : nSel === 1 ? `1 vers · ${fmt(selSecs)}` : `${nSel} vers · ${fmt(selSecs)} par tour`}
          playSub={mode === "plage" ? `${nSel > 1 ? `Vers ${lo} → ${hi}` : `Vers ${lo}`} · ${reps} tours · ${est(totalSecs)}` : `${nSel} vers × ${reps} · ${est(totalSecs)}`}
          preparing={player.preparing}
          onStart={() => setKp("start")}
          onEnd={() => setKp("end")}
          onReps={() => setKp("reps")}
          onMode={setMode}
          onRepsStep={(d) => setReps(reps + d)}
          onPlay={playVerses}
          bottomInset={insets.bottom}
        />
      )}

      {showPlayer && (
        <VersePlayerPanel
          t={t}
          modeLabel={modeLabel}
          rangeTitle={rangeTitle}
          curInfo={curInfo}
          count={live.count}
          reps={mainReps}
          countWord={countWord}
          loopPct={live.loopPct}
          playing={live.playing}
          speedLabel={String(speed).replace(".", ",") + "×"}
          canStep={playing?.kind === "verses" && nSelOf(playing) > 1}
          bottomInset={insets.bottom}
          onCycleSpeed={onCycleSpeed}
          onPrev={() => player.step(-1)}
          onToggle={player.toggle}
          onNext={() => player.step(1)}
          onStop={player.stop}
        />
      )}

      {showFin && (
        <View style={[styles.panel, { backgroundColor: t.surface, borderTopColor: t.line, shadowColor: t.shadow, paddingBottom: 18 + insets.bottom }]}>
          <View style={styles.finHead}>
            <View style={[styles.finBadge, { backgroundColor: t.tint }]}>
              <Icon name="check" size={20} color={t.accent} strokeWidth={2.4} />
            </View>
            <View>
              <Text style={[styles.finTitle, { color: t.ink }]}>Répétitions terminées</Text>
              <Text style={[styles.finSub, { color: t.muted }]}>{finSub}</Text>
            </View>
          </View>
          <View style={styles.finActions}>
            <Pressable onPress={player.replay} style={[styles.finReplay, { backgroundColor: t.accent }]}>
              <Text style={[styles.finReplayText, { color: t.accentInk }]}>Réécouter</Text>
            </Pressable>
            <Pressable onPress={player.closeFinished} style={[styles.finClose, { borderColor: t.line }]}>
              <Text style={[styles.finCloseText, { color: t.ink }]}>Modifier la plage</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Keypad
        t={t}
        visible={kp != null}
        title={kp ? kpTitle[kp] : ""}
        max={kp === "reps" || kp === "chapReps" ? 999 : Math.max(1, total)}
        initial={kpInitial}
        bottomInset={insets.bottom}
        onClose={() => setKp(null)}
        onConfirm={confirmKp}
      />
    </View>
  );
}

const nSelOf = (sel: Extract<Selection, { kind: "verses" }>) => sel.hi - sel.lo + 1;

const styles = StyleSheet.create({
  header: { paddingTop: 8, paddingBottom: 12, paddingLeft: 8, paddingRight: 16, rowGap: 4 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 8 },
  backRow: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  kicker: { flexShrink: 1, fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 1.2 },
  jump: { height: 44, paddingLeft: 10, paddingRight: 14, borderRadius: 22, borderWidth: 1, flexDirection: "row", alignItems: "center", columnGap: 6 },
  jumpText: { fontFamily: FONT.sansMedium, fontSize: 13 },
  titles: { paddingLeft: 8 },
  ar: { fontFamily: FONT.arabic, fontSize: 28, lineHeight: 41, writingDirection: "rtl", textAlign: "right" },
  metaRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", columnGap: 8 },
  meta: { fontFamily: FONT.sans, fontSize: 13, fontVariant: ["tabular-nums"] },
  metaFr: { flexShrink: 1, fontFamily: FONT.sans, fontSize: 13, textAlign: "right" },
  whole: { marginLeft: 8, marginTop: 8, minHeight: 48, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  wholeLeft: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  wholeText: { fontFamily: FONT.sansSemi, fontSize: 15 },
  wholeReps: { fontFamily: FONT.sansSemi, fontSize: 13, fontVariant: ["tabular-nums"] },
  banner: { marginHorizontal: 16, marginBottom: 6, padding: 12, borderRadius: 12, borderWidth: 1 },
  bannerText: { fontFamily: FONT.sans, fontSize: 13, lineHeight: 19 },
  list: { flex: 1, borderTopWidth: StyleSheet.hairlineWidth },
  empty: { flex: 1, justifyContent: "center", rowGap: 14, paddingHorizontal: 32, paddingVertical: 24, borderTopWidth: StyleSheet.hairlineWidth },
  emptyIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: FONT.sansSemi, fontSize: 19, lineHeight: 26 },
  emptyText: { fontFamily: FONT.sans, fontSize: 14, lineHeight: 22 },
  panel: { paddingTop: 14, paddingHorizontal: 16, rowGap: 12, borderTopWidth: StyleSheet.hairlineWidth, elevation: 12, shadowOpacity: 1, shadowRadius: 14, shadowOffset: { width: 0, height: -10 } },
  panelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 12 },
  panelLabel: { fontFamily: FONT.sans, fontSize: 14 },
  stepper: { flexDirection: "row", alignItems: "center", height: 44, borderWidth: 1, borderRadius: 22 },
  stepBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  stepValue: { minWidth: 40, height: 44, alignItems: "center", justifyContent: "center" },
  stepText: { fontFamily: FONT.sansSemi, fontSize: 15, fontVariant: ["tabular-nums"] },
  bigPlay: { minHeight: 56, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", columnGap: 10 },
  bigTitle: { fontFamily: FONT.sansSemi, fontSize: 16 },
  bigSub: { fontFamily: FONT.sans, fontSize: 12 },
  finHead: { flexDirection: "row", alignItems: "center", columnGap: 12 },
  finBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  finTitle: { fontFamily: FONT.sansSemi, fontSize: 16 },
  finSub: { fontFamily: FONT.sans, fontSize: 13, fontVariant: ["tabular-nums"] },
  finActions: { flexDirection: "row", columnGap: 8 },
  finReplay: { flex: 1, minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  finReplayText: { fontFamily: FONT.sansSemi, fontSize: 15 },
  finClose: { minHeight: 52, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  finCloseText: { fontFamily: FONT.sansMedium, fontSize: 15 },
});
