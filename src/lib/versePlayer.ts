import { AudioBuffer, AudioBufferSourceNode, AudioContext } from "react-native-audio-api";
import { Cursor, Item, Position, buildItems, cursorForVerse, locate, PlanMode, verseTimes } from "./versePlan";

// Lecteur par vers : le chapitre est décodé en mémoire, puis chaque bloc de lecture est une source
// qui boucle sur [a, b[ à l'échantillon près et s'arrête à un instant programmé à l'avance.
// Les blocs s'enchaînent sur l'horloge audio : aucun silence n'est ajouté entre deux tours ni entre deux vers.

const START_LEAD = 0.06; // marge avant le premier échantillon, pour laisser le temps de programmer

export type Selection =
  | { kind: "verses"; lo: number; hi: number; mode: PlanMode; reps: number }
  | { kind: "chapter"; reps: number };

export class VersePlayer {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private loadedUri: string | number | null = null;

  private sources: AudioBufferSourceNode[] = [];
  private session = 0;
  private items: Item[] = [];
  private starts: number[] = [];
  private cursor0: Cursor = { item: 0, loop: 0, off: 0 };
  private t0 = 0;
  private rate = 1;
  private suspended = false;
  private over = false;

  duration = 0;
  private onFinish: (() => void) | null = null;

  setOnFinish(callback: (() => void) | null): void {
    this.onFinish = callback;
  }

  private context(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  // Décode le fichier du chapitre (adresse locale `file://…`) ; renvoie sa durée exacte en secondes.
  async load(uri: string | number): Promise<number> {
    if (this.buffer && this.loadedUri === uri) return this.duration;
    this.stop();
    this.buffer = null;
    const buffer = await this.context().decodeAudioData(uri);
    if (!buffer) throw new Error("Décodage audio impossible");
    this.buffer = buffer;
    this.loadedUri = uri;
    this.duration = buffer.duration;
    return this.duration;
  }

  // Lance une lecture. `starts` : début de chaque vers dans le fichier (vide pour un chapitre non découpé).
  start(selection: Selection, starts: number[], rate: number, cursor?: Cursor): void {
    if (!this.buffer) throw new Error("Aucun chapitre chargé");
    this.starts = starts;
    this.items =
      selection.kind === "chapter"
        ? [{ a: 0, b: this.duration, loops: selection.reps, first: 1, last: Math.max(1, starts.length) }]
        : buildItems(starts, this.duration, selection.lo, selection.hi, selection.mode, selection.reps);
    this.schedule(rate, cursor ?? { item: 0, loop: 0, off: 0 });
  }

  private clearSources(): void {
    this.session++;
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        // déjà arrêtée
      }
      try {
        s.disconnect();
      } catch {
        // déjà déconnectée
      }
    }
    this.sources = [];
  }

  private schedule(rate: number, cursor: Cursor): void {
    const ctx = this.context();
    const buffer = this.buffer as AudioBuffer;
    this.clearSources();
    this.rate = rate;
    this.cursor0 = cursor;
    this.over = false;
    const token = this.session;

    let when = ctx.currentTime + START_LEAD;
    this.t0 = when;
    for (let i = cursor.item; i < this.items.length; i++) {
      const it = this.items[i];
      const len = it.b - it.a;
      const first = i === cursor.item;
      const loops = first ? it.loops - cursor.loop : it.loops;
      const offset = first ? cursor.off : 0;
      const media = loops * len - offset;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.loopStart = it.a;
      source.loopEnd = it.b;
      source.playbackRate.value = rate;
      source.connect(ctx.destination);
      source.start(when, it.a + offset);
      source.stop(when + media / rate);
      if (i === this.items.length - 1) {
        source.onended = () => {
          if (token !== this.session) return;
          this.over = true;
          this.onFinish?.();
        };
      }
      this.sources.push(source);
      when += media / rate;
    }
    this.suspended = false;
    ctx.resume().catch(() => {});
  }

  // Position courante (vers, tour, avancement), déduite de l'horloge audio.
  position(): Position | null {
    if (!this.ctx || !this.items.length) return null;
    const elapsed = Math.max(0, this.ctx.currentTime - this.t0);
    return locate(this.items, this.starts, this.cursor0, elapsed * this.rate);
  }

  // Avancement dans le vers en cours, en secondes de média (pour l'affichage « 0:03 / 0:07 »).
  verseClock(): { elapsed: number; total: number } | null {
    const pos = this.position();
    if (!pos || !this.starts.length) return null;
    const it = this.items[pos.cursor.item];
    const abs = it.a + pos.cursor.off;
    const [vs, ve] = verseTimes(this.starts, this.duration, pos.verse);
    return { elapsed: Math.max(0, Math.min(ve - vs, abs - vs)), total: ve - vs };
  }

  get playing(): boolean {
    return this.sources.length > 0 && !this.suspended && !this.over;
  }

  get active(): boolean {
    return this.sources.length > 0 && !this.over;
  }

  async pause(): Promise<void> {
    if (!this.ctx || this.suspended) return;
    this.suspended = true;
    await this.ctx.suspend();
  }

  async resume(): Promise<void> {
    if (!this.ctx || !this.suspended) return;
    this.suspended = false;
    await this.ctx.resume();
  }

  // Saute au vers `verse` en gardant le compteur de tours / répétitions.
  jump(verse: number): void {
    const pos = this.position();
    if (!pos || !this.buffer) return;
    const wasSuspended = this.suspended;
    this.schedule(this.rate, cursorForVerse(this.items, this.starts, verse, pos.count));
    if (wasSuspended) this.pause().catch(() => {});
  }

  // Change la vitesse sans perdre la place : la lecture reprend à l'endroit exact où elle en était.
  setRate(rate: number): void {
    const pos = this.position();
    if (!pos || pos.done || !this.buffer || rate === this.rate) {
      this.rate = rate;
      return;
    }
    const wasSuspended = this.suspended;
    this.schedule(rate, pos.cursor);
    if (wasSuspended) this.pause().catch(() => {});
  }

  stop(): void {
    this.clearSources();
    this.items = [];
    this.over = false;
    this.suspended = false;
    this.ctx?.suspend().catch(() => {});
  }

  release(): void {
    this.stop();
    this.buffer = null;
    this.loadedUri = null;
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
