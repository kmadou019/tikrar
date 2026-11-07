import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Corpus } from "../data/corpora";
import { isRemote } from "../lib/remoteCache";
import { Chapter, est, totalDuration } from "../data/chapters";
import { verseStarts } from "../data/verses";
import { Theme, ThemeName } from "../theme";
import { clamp, usePrefs } from "../hooks/usePrefs";
import { usePlayback } from "../hooks/usePlayback";
import { useRemoteCache } from "../hooks/useRemoteCache";
import { DownloadBar } from "../components/DownloadBar";
import { GroupChips } from "../components/GroupChips";
import { Header } from "../components/Header";
import { SelectionBar } from "../components/SelectionBar";
import { ChapterRow } from "../components/ChapterRow";
import { Player } from "../components/Player";
import { FinishedCard } from "../components/FinishedCard";

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

type Props = {
  t: Theme;
  theme: ThemeName;
  corpus: Corpus;
  speed: number;
  onCycleSpeed: () => void;
  onToggleTheme: () => void;
  onBack: () => void;
  onOpenChapter: (chapter: Chapter) => void;
};

export function CorpusScreen({ t, theme, corpus, speed, onCycleSpeed, onToggleTheme, onBack, onOpenChapter }: Props) {
  const insets = useSafeAreaInsets();
  const chapters = corpus.chapters;
  const { prefs, ready, update, repsOf, setRep, setAll, toggle, toggleAll, toggleGroup } = usePrefs(corpus.id, chapters);
  const remote = chapters.some(isRemote);
  const cache = useRemoteCache(chapters);
  const pb = usePlayback({
    chapters,
    artist: corpus.artist,
    repsOf,
    checked: prefs.checked,
    tours: prefs.tours,
    speed,
    resolve: cache.resolve,
    prefetch: cache.prefetch,
  });

  const onDownloadAll = () =>
    Alert.alert(
      "Tout télécharger ?",
      `${corpus.downloadSize ?? "Les fichiers"} seront enregistrés sur le téléphone pour l'écoute hors ligne. Utilisez de préférence le Wi-Fi.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Télécharger",
          onPress: () =>
            cache.downloadAll().then((failed) => {
              if (failed) Alert.alert("Téléchargement incomplet", "Certains fichiers n'ont pas pu être téléchargés. Vérifiez votre connexion, puis relancez.");
            }),
        },
      ],
    );

  const onRemoveAll = () =>
    Alert.alert("Supprimer les téléchargements ?", "Les fichiers seront retirés du téléphone. Vous pourrez les télécharger à nouveau.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => { pb.stop(); cache.removeAll(); } },
    ]);

  if (!ready) return <View style={{ flex: 1 }} />;

  const count = prefs.checked.length;
  const total = prefs.checked.reduce((s, n) => s + chapters[n - 1].dur * repsOf(n), 0) * prefs.tours;
  const selSub = count === 0 ? "Cochez au moins un chapitre" : `${plural(count, "chapitre", "chapitres")} · ${est(total)}`;
  const finSub = `${plural(count, "chapitre", "chapitres")} · ${plural(prefs.tours, "tour", "tours")} · ${est(total)}`;
  const all = totalDuration(chapters);

  const s = pb.session;
  const current = pb.active ? chapters[pb.active - 1] : null;

  return (
    <View style={{ flex: 1 }}>
      <Header
        t={t}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onBack={onBack}
        kicker={corpus.fr.toUpperCase()}
        titleAr={corpus.ar}
        subtitle={`${chapters.length} ${corpus.unit ?? "chapitres"} · ${Math.floor(all / 3600) ? Math.floor(all / 3600) + " h " : ""}${Math.floor((all % 3600) / 60)} min`}
      />
      <SelectionBar
        t={t}
        allChecked={count === chapters.length}
        allValue={prefs.allValue}
        tours={prefs.tours}
        disabled={count === 0}
        subtitle={selSub}
        onToggleAll={toggleAll}
        onAllDec={() => setAll(prefs.allValue - 1)}
        onAllInc={() => setAll(prefs.allValue + 1)}
        onAllSet={setAll}
        onToursSet={(n) => update({ tours: clamp(n, 1, 20) })}
        onToursDec={() => update({ tours: clamp(prefs.tours - 1, 1, 20) })}
        onToursInc={() => update({ tours: clamp(prefs.tours + 1, 1, 20) })}
        onPlay={pb.playSelection}
      />
      {remote && (
        <DownloadBar
          t={t}
          cachedCount={cache.cached.size}
          total={chapters.length}
          bulk={cache.bulk}
          onDownloadAll={onDownloadAll}
          onCancel={cache.cancelDownloadAll}
          onRemoveAll={onRemoveAll}
        />
      )}
      {corpus.groups && (
        <GroupChips
          t={t}
          groups={corpus.groups}
          checked={prefs.checked}
          note={corpus.groupsNote}
          onToggle={(g) => toggleGroup(g.chapters)}
        />
      )}
      <FlatList
        style={styles.list}
        data={chapters}
        keyExtractor={(c) => String(c.n)}
        extraData={[prefs, pb.active, pb.playing, s?.rep, cache.cached, cache.downloading]}
        renderItem={({ item }) => {
          const isActive = pb.active === item.n;
          return (
            <ChapterRow
              t={t}
              chapter={item}
              checked={prefs.checked.includes(item.n)}
              reps={repsOf(item.n)}
              isActive={isActive}
              isPlaying={isActive && pb.playing}
              currentRep={s?.rep ?? 1}
              cloud={!remote ? undefined : cache.cached.has(item.n) ? "ready" : cache.downloading.has(item.n) ? "downloading" : "missing"}
              onToggle={() => toggle(item.n)}
              onDec={() => setRep(item.n, repsOf(item.n) - 1)}
              onInc={() => setRep(item.n, repsOf(item.n) + 1)}
              onSet={(n) => setRep(item.n, n)}
              onPlay={() => pb.playOne(item.n)}
              onOpen={verseStarts(corpus.id, item.n) ? () => onOpenChapter(item) : undefined}
            />
          );
        }}
      />
      {s && current && (
        <Player
          t={t}
          chapter={current}
          rep={s.rep}
          repTotal={repsOf(current.n)}
          playing={pb.playing}
          loading={pb.loading}
          progress={pb.duration ? pb.currentTime / pb.duration : 0}
          elapsed={pb.currentTime}
          tourLabel={s.mode === "sel" ? `Tour ${s.lap}/${s.laps} · sélection` : "Chapitre seul"}
          speedLabel={String(speed).replace(".", ",") + "×"}
          bottomInset={insets.bottom}
          onCycleSpeed={onCycleSpeed}
          onPrev={pb.prev}
          onToggle={pb.toggle}
          onNext={pb.next}
          onStop={pb.stop}
        />
      )}
      {pb.finished && (
        <FinishedCard t={t} subtitle={finSub} bottomInset={insets.bottom} onReplay={pb.playSelection} onClose={pb.closeFinished} />
      )}
      {!s && !pb.finished && <View style={{ height: insets.bottom }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
});
