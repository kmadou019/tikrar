import { useMemo, useState } from "react";
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Corpus } from "../data/corpora";
import type { Chapter } from "../data/chapters";
import { cachedBytes, cancelDownloads, downloadMany, isRemote, removeChapters, useDownloadState } from "../lib/remoteCache";
import { FONT, Theme } from "../theme";
import { Icon } from "../components/Icon";

type Props = { t: Theme; corpora: Corpus[]; onBack: () => void };

type Tab = "have" | "missing";
type Section = { corpus: Corpus; data: Chapter[] };

const MB = 1024 * 1024;
const CONFIRM_ABOVE = 50 * MB;

const fmtBytes = (b: number) => (b >= MB ? `${(b / MB).toFixed(b >= 10 * MB ? 0 : 1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(b / 1024))} Ko`);
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;
const key = (corpus: Corpus, chapter: Chapter) => `${corpus.id}:${chapter.n}`;

export function DownloadsScreen({ t, corpora, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const state = useDownloadState();
  const [tab, setTab] = useState<Tab>("have");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const estimate = (corpus: Corpus, c: Chapter) => c.dur * (corpus.bytesPerSecond ?? 8000);

  const { have, missing } = useMemo(() => {
    const h: Section[] = [];
    const m: Section[] = [];
    for (const corpus of corpora) {
      const remote = corpus.chapters.filter(isRemote);
      const a = remote.filter((c) => state.cached.has(c.cacheName as string));
      const b = remote.filter((c) => !state.cached.has(c.cacheName as string));
      if (a.length) h.push({ corpus, data: a });
      if (b.length) m.push({ corpus, data: b });
    }
    return { have: h, missing: m };
  }, [corpora, state.cached]);

  const sizeOf = (corpus: Corpus, list: Chapter[], real: boolean) =>
    list.reduce((s, c) => s + (real ? cachedBytes(c) : estimate(corpus, c)), 0);

  const haveCount = have.reduce((s, x) => s + x.data.length, 0);
  const haveBytes = have.reduce((s, x) => s + sizeOf(x.corpus, x.data, true), 0);
  const missingCount = missing.reduce((s, x) => s + x.data.length, 0);
  const missingBytes = missing.reduce((s, x) => s + sizeOf(x.corpus, x.data, false), 0);
  const busy = state.bulk !== null;

  const selectedChapters = missing.flatMap((s) => s.data.filter((c) => selected.has(key(s.corpus, c))).map((c) => ({ corpus: s.corpus, c })));
  const selectedBytes = selectedChapters.reduce((s, x) => s + estimate(x.corpus, x.c), 0);

  const start = (chapters: Chapter[], bytes: number, label: string) => {
    const run = () =>
      downloadMany(chapters).then((failed) => {
        if (failed) Alert.alert("Téléchargement incomplet", "Certains fichiers n'ont pas pu être téléchargés. Vérifiez votre connexion, puis relancez.");
      });
    if (bytes < CONFIRM_ABOVE) return run();
    Alert.alert(`${label} ?`, `≈ ${fmtBytes(bytes)} seront enregistrés sur le téléphone pour l'écoute hors ligne. Utilisez de préférence le Wi-Fi.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Télécharger", onPress: run },
    ]);
  };

  const remove = (chapters: Chapter[], message: string) =>
    Alert.alert("Supprimer ?", message, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => removeChapters(chapters) },
    ]);

  const toggle = (k: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const toggleSection = (s: Section) => {
    const keys = s.data.map((c) => key(s.corpus, c));
    setSelected((cur) => {
      const next = new Set(cur);
      const all = keys.every((k) => next.has(k));
      keys.forEach((k) => (all ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const sections = tab === "have" ? have : missing;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Pressable accessibilityLabel="Retour" onPress={onBack} style={styles.back}>
          <Icon name="back" size={22} color={t.ink} />
        </Pressable>
        <Text style={[styles.title, { color: t.ink }]}>Téléchargements</Text>
      </View>

      <View style={[styles.summary, { backgroundColor: t.surface, borderColor: t.line }]}>
        <Text style={[styles.sumLine, { color: t.ink }]}>
          {plural(haveCount, "chapitre", "chapitres")} sur le téléphone · {fmtBytes(haveBytes)}
        </Text>
        <Text style={[styles.sumSub, { color: t.muted }]}>
          {missingCount ? `Reste à télécharger : ${plural(missingCount, "chapitre", "chapitres")} · ≈ ${fmtBytes(missingBytes)}` : "Tout est téléchargé : l'écoute fonctionne hors ligne."}
        </Text>
        {busy && state.bulk ? (
          <View style={styles.progress}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressText, { color: t.ink }]}>
                Téléchargement {state.bulk.done}/{state.bulk.total}…
              </Text>
              <Pressable onPress={cancelDownloads} style={[styles.ghost, { borderColor: t.line }]}>
                <Text style={[styles.ghostText, { color: t.ink }]}>Annuler</Text>
              </Pressable>
            </View>
            <View style={[styles.track, { backgroundColor: t.line }]}>
              <View style={{ height: 4, width: `${Math.round((state.bulk.done / state.bulk.total) * 100)}%`, backgroundColor: t.accent }} />
            </View>
          </View>
        ) : (
          missingCount > 0 && (
            <Pressable
              onPress={() => start(missing.flatMap((s) => s.data), missingBytes, "Tout télécharger")}
              style={[styles.primary, { backgroundColor: t.accent }]}
            >
              <Icon name="download" size={18} color={t.accentInk} />
              <Text style={[styles.primaryText, { color: t.accentInk }]}>Tout télécharger · ≈ {fmtBytes(missingBytes)}</Text>
            </Pressable>
          )
        )}
      </View>

      <View style={[styles.tabs, { backgroundColor: t.surface, borderColor: t.line }]}>
        {(["have", "missing"] as Tab[]).map((k) => {
          const on = tab === k;
          const n = k === "have" ? haveCount : missingCount;
          return (
            <Pressable key={k} accessibilityState={{ selected: on }} onPress={() => setTab(k)} style={[styles.tab, { backgroundColor: on ? t.accent : "transparent" }]}>
              <Text style={[styles.tabText, { color: on ? t.accentInk : t.ink }]}>
                {k === "have" ? "Téléchargés" : "À télécharger"} ({n})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionList
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 24 + (tab === "missing" && selectedChapters.length ? 88 : 0) }}
        sections={sections}
        keyExtractor={(c, i) => `${c.n}-${i}`}
        extraData={[selected, state.downloading, tab]}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: t.muted }]}>
            {tab === "have" ? "Rien n'est encore téléchargé. Les chapitres se téléchargent à la demande, ou depuis l'onglet « À télécharger »." : "Tout est déjà téléchargé."}
          </Text>
        }
        renderSectionHeader={({ section }) => {
          const s = section as Section;
          const bytes = sizeOf(s.corpus, s.data, tab === "have");
          const allSelected = s.data.every((c) => selected.has(key(s.corpus, c)));
          return (
            <View style={[styles.sectionHead, { borderBottomColor: t.line }]}>
              <View style={styles.sectionTitles}>
                <Text style={[styles.sectionAr, { color: t.ink }]}>{s.corpus.ar}</Text>
                <Text style={[styles.sectionFr, { color: t.muted }]}>
                  {s.corpus.fr} · {plural(s.data.length, "chapitre", "chapitres")} · {tab === "have" ? "" : "≈ "}
                  {fmtBytes(bytes)}
                </Text>
              </View>
              {tab === "have" ? (
                <Pressable onPress={() => remove(s.data, `Les ${s.data.length} chapitres téléchargés de « ${s.corpus.fr} » seront retirés du téléphone.`)} style={[styles.ghost, { borderColor: t.line }]}>
                  <Text style={[styles.ghostText, { color: t.danger }]}>Supprimer</Text>
                </Pressable>
              ) : (
                <View style={styles.sectionActions}>
                  <Pressable onPress={() => toggleSection(s)} style={styles.link}>
                    <Text style={[styles.linkText, { color: t.accent }]}>{allSelected ? "Décocher" : "Tout cocher"}</Text>
                  </Pressable>
                  <Pressable disabled={busy} onPress={() => start(s.data, bytes, `Télécharger « ${s.corpus.fr} »`)} style={[styles.ghost, { borderColor: t.accent, opacity: busy ? 0.4 : 1 }]}>
                    <Text style={[styles.ghostText, { color: t.accent }]}>Télécharger</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
        renderItem={({ item, section }) => {
          const corpus = (section as Section).corpus;
          const k = key(corpus, item);
          const isSel = selected.has(k);
          const loading = isRemote(item) && state.downloading.has(item.cacheName);
          return (
            <Pressable
              disabled={tab === "have"}
              accessibilityRole={tab === "have" ? undefined : "checkbox"}
              accessibilityState={tab === "have" ? undefined : { checked: isSel }}
              onPress={() => toggle(k)}
              style={[styles.row, { borderBottomColor: t.line }]}
            >
              {tab === "missing" && (
                <View style={[styles.box, { borderColor: isSel ? t.accent : t.muted, backgroundColor: isSel ? t.accent : "transparent" }]}>
                  {isSel && <Icon name="check" size={14} color={t.accentInk} strokeWidth={3} />}
                </View>
              )}
              <Text style={[styles.num, { color: t.muted }]}>{String(item.n).padStart(2, "0")}</Text>
              <View style={styles.rowTitles}>
                <Text numberOfLines={1} style={[styles.rowAr, { color: t.ink }]}>{item.ar}</Text>
                <Text numberOfLines={1} style={[styles.rowFr, { color: t.muted }]}>{item.fr}</Text>
              </View>
              <Text style={[styles.size, { color: t.muted }]}>
                {loading ? "…" : tab === "have" ? fmtBytes(cachedBytes(item)) : `≈ ${fmtBytes(estimate(corpus, item))}`}
              </Text>
              {tab === "have" && (
                <Pressable accessibilityLabel={`Supprimer le chapitre ${item.n}`} onPress={() => remove([item], `Le chapitre « ${item.fr} » sera retiré du téléphone.`)} style={styles.trash}>
                  <Icon name="trash" size={18} color={t.muted} />
                </Pressable>
              )}
            </Pressable>
          );
        }}
      />

      {tab === "missing" && selectedChapters.length > 0 && (
        <View style={[styles.bar, { backgroundColor: t.surface, borderTopColor: t.line, paddingBottom: 12 + insets.bottom }]}>
          <Pressable
            disabled={busy}
            onPress={() => {
              start(selectedChapters.map((x) => x.c), selectedBytes, "Télécharger la sélection");
              setSelected(new Set());
            }}
            style={[styles.primary, { backgroundColor: busy ? t.disabledBg : t.accent }]}
          >
            <Icon name="download" size={18} color={busy ? t.disabledInk : t.accentInk} />
            <Text style={[styles.primaryText, { color: busy ? t.disabledInk : t.accentInk }]}>
              Télécharger la sélection ({selectedChapters.length}) · ≈ {fmtBytes(selectedBytes)}
            </Text>
          </Pressable>
        </View>
      )}
      {!(tab === "missing" && selectedChapters.length > 0) && <View style={{ height: insets.bottom }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  top: { flexDirection: "row", alignItems: "center", paddingLeft: 6, paddingRight: 16, columnGap: 4 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: FONT.sansSemi, fontSize: 22 },
  summary: { marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 16, borderWidth: 1, rowGap: 6 },
  sumLine: { fontFamily: FONT.sansSemi, fontSize: 15 },
  sumSub: { fontFamily: FONT.sans, fontSize: 13, lineHeight: 18 },
  primary: { minHeight: 52, borderRadius: 14, marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", columnGap: 10, paddingHorizontal: 14 },
  primaryText: { fontFamily: FONT.sansSemi, fontSize: 15 },
  progress: { rowGap: 8, marginTop: 8 },
  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 10 },
  progressText: { flex: 1, fontFamily: FONT.sansMedium, fontSize: 14, fontVariant: ["tabular-nums"] },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  tabs: { flexDirection: "row", marginHorizontal: 16, marginTop: 12, padding: 4, borderRadius: 14, borderWidth: 1, columnGap: 4 },
  tab: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  tabText: { fontFamily: FONT.sansSemi, fontSize: 13.5 },
  list: { flex: 1, marginTop: 4 },
  empty: { fontFamily: FONT.sans, fontSize: 14, lineHeight: 21, paddingHorizontal: 24, paddingTop: 28, textAlign: "center" },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  sectionTitles: { flex: 1, minWidth: 0 },
  sectionAr: { fontFamily: FONT.arabic, fontSize: 22, lineHeight: 34, writingDirection: "rtl", textAlign: "left" },
  sectionFr: { fontFamily: FONT.sans, fontSize: 12 },
  sectionActions: { flexDirection: "row", alignItems: "center", columnGap: 4 },
  link: { minHeight: 44, paddingHorizontal: 8, justifyContent: "center" },
  linkText: { fontFamily: FONT.sansSemi, fontSize: 13 },
  ghost: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  ghostText: { fontFamily: FONT.sansSemi, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", columnGap: 10, minHeight: 56, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  num: { width: 22, fontFamily: FONT.sansSemi, fontSize: 12, fontVariant: ["tabular-nums"] },
  rowTitles: { flex: 1, minWidth: 0 },
  rowAr: { fontFamily: FONT.arabic, fontSize: 19, lineHeight: 30, writingDirection: "rtl", textAlign: "left" },
  rowFr: { fontFamily: FONT.sans, fontSize: 12 },
  size: { fontFamily: FONT.sans, fontSize: 12, fontVariant: ["tabular-nums"] },
  trash: { width: 40, height: 44, alignItems: "center", justifyContent: "center" },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 12, paddingHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
