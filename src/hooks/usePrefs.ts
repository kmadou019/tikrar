import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemeName } from "../theme";
import type { Chapter } from "../data/chapters";

export type Prefs = {
  checked: number[];
  reps: Record<number, number>;
  allValue: number;
  tours: number;
};

export type Settings = {
  speedIdx: number;
  theme: ThemeName | null;
};

const DEFAULTS: Prefs = { checked: [], reps: {}, allValue: 3, tours: 1 };
const SETTINGS_DEFAULTS: Settings = { speedIdx: 1, theme: null };
const SETTINGS_KEY = "ibn-ashir-settings-v1";

// Les réglages sont rangés par numéro de chapitre : la clé d'Ibn Ashir passe en v2 depuis le redécoupage de la purification et du Hajj.
const prefsKey = (corpusId: string) => (corpusId === "ibn-ashir" ? "ibn-ashir-prefs-v2" : `prefs-v1-${corpusId}`);

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function useStored<T extends object>(key: string, defaults: T) {
  const [value, setValue] = useState<T>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw) setValue({ ...defaults, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(
    (patch: Partial<T>) => {
      setValue((v) => {
        const next = { ...v, ...patch };
        AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [key],
  );

  return { value, ready, update };
}

export function useSettings() {
  const { value, ready, update } = useStored<Settings>(SETTINGS_KEY, SETTINGS_DEFAULTS);
  return { settings: value, ready, update };
}

export function usePrefs(corpusId: string, chapters: Chapter[]) {
  const { value: prefs, ready, update } = useStored<Prefs>(prefsKey(corpusId), DEFAULTS);

  const repsOf = useCallback((n: number) => prefs.reps[n] ?? prefs.allValue, [prefs.reps, prefs.allValue]);

  const setRep = (n: number, v: number) => update({ reps: { ...prefs.reps, [n]: clamp(v, 1, 99) } });

  const setAll = (v: number) => {
    v = clamp(v, 1, 99);
    update({ allValue: v, reps: Object.fromEntries(chapters.map((c) => [c.n, v])) });
  };

  const toggle = (n: number) =>
    update({
      checked: prefs.checked.includes(n)
        ? prefs.checked.filter((x) => x !== n)
        : [...prefs.checked, n].sort((a, b) => a - b),
    });

  // Coche tout le groupe, ou le décoche si tout est déjà coché.
  const toggleGroup = (members: number[]) => {
    const all = members.every((n) => prefs.checked.includes(n));
    const rest = prefs.checked.filter((n) => !members.includes(n));
    update({ checked: (all ? rest : [...rest, ...members]).sort((a, b) => a - b) });
  };

  const toggleAll = () =>
    update({ checked: prefs.checked.length === chapters.length ? [] : chapters.map((c) => c.n) });

  return { prefs, ready, update, repsOf, setRep, setAll, toggle, toggleAll, toggleGroup };
}
