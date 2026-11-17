"use client";

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { BIBLE, type Book } from "../bibledata";
import { PEOPLE, type Person } from "../biblepeople";
import { TAGS } from "../bibletags";



const RAW_CSS = `
.shell { --blossom: #e7a7b5; --bibleText: #d98a93; position: relative; min-height: 100vh; min-height: 100svh; overflow-x: clip; }

/* reset browser-default button / select styling (zero specificity, so every class rule below still wins) */
:where(.shell) :is(button, select) { font: inherit; color: inherit; background: none; border: 0; margin: 0; padding: 0; cursor: pointer; text-align: inherit; }

.glow { position: fixed; left: -20%; right: -20%; bottom: -35%; height: 70%; pointer-events: none;
  background: radial-gradient(55% 65% at 50% 100%, color-mix(in srgb, var(--bible) 45%, transparent), transparent 70%); }
.wrap { position: relative; max-width: 680px; margin: 0 auto; padding: 0 18px 80px; padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }

/* home */
.hero { display: flex; align-items: center; gap: 16px; padding: 34px 0 18px; }
.logo { flex: none; width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--gold); background: var(--surface); overflow: hidden; display: grid; place-items: center; }
.logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero h1 { margin: 0; font-family: var(--font-display), Georgia, serif; font-weight: 500; font-size: 2.3rem; line-height: 1; }
.tagline { margin: 2px 0 0; color: var(--muted); font-size: .85rem; }
.tabs { display: flex; gap: 8px; margin: 4px 0 6px; }
.tab { padding: 9px 18px; border-radius: 999px; border: 1px solid var(--line); font-size: .9rem; }
.tab[aria-selected="true"] { border-color: var(--gold); color: var(--gold); background: color-mix(in srgb, var(--gold) 12%, transparent); }
.letter { padding: 18px 4px 6px; color: var(--gold); font-family: var(--font-display), Georgia, serif; font-size: 1.1rem; border-bottom: 1px solid color-mix(in srgb, var(--gold) 35%, transparent); }
.list { list-style: none; margin: 0; padding: 0; }
.row { display: grid; grid-template-columns: 44px 1fr auto; align-items: center; gap: 14px; width: 100%; text-align: left; padding: 13px 4px; border-bottom: 1px solid var(--line); }
.row:hover .nm { color: var(--gold); }
.num { width: 38px; height: 38px; display: grid; place-items: center; font-size: .8rem; color: var(--gold); position: relative; font-family: var(--font-display), Georgia, serif; }
.num::before, .num::after { content: ""; position: absolute; inset: 5px; border: 1px solid var(--gold); border-radius: 3px; opacity: .7; }
.num::after { transform: rotate(45deg); }
.num i { position: relative; font-style: normal; }
.nm { font-weight: 500; }
.sub { color: var(--muted); font-size: .82rem; }
.go { color: var(--gold); }
.credit { color: var(--muted); font-size: .75rem; text-align: center; padding: 30px 0 0; }

/* chapters */
.chapHint { padding: 22px 4px 0; color: var(--muted); font-size: .85rem; text-align: center; }
.chapters { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 10px; padding: 22px 0 0; }
.chap { height: 56px; display: grid; place-items: center; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); font-family: var(--font-display), Georgia, serif; font-size: 1.15rem; transition: border-color .15s, color .15s; }
.chap:hover { border-color: var(--gold); color: var(--gold); }

/* bar */
.bar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 6px; padding: 10px 0; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.title { flex: 1; text-align: center; font-weight: 500; }
.title small { display: block; color: var(--muted); font-weight: 400; font-size: .75rem; }
.ib { min-width: 40px; height: 40px; border-radius: 999px; border: 1px solid var(--line); display: grid; place-items: center; }
span.ib { border-color: transparent; }

/* swipeable chapter strip under the top bar */
.strip { position: relative; display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px; scrollbar-width: none; -webkit-overflow-scrolling: touch;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent);
  mask-image: linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent); }
.strip::-webkit-scrollbar { display: none; }
.stripChip { flex: none; min-width: 40px; height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); font-family: var(--font-display), Georgia, serif; font-size: .95rem; transition: border-color .15s, color .15s, background .15s; }
.stripChip:hover { border-color: var(--gold); color: var(--gold); }
.stripChip[aria-current="true"] { border-color: var(--gold); color: var(--gold); background: color-mix(in srgb, var(--gold) 14%, transparent); }

/* read-aloud controls (speed + previous / play-stop / next) sit in the right of the bar */
.tools { display: flex; gap: 6px; }
.tools .ib { padding: 0 10px; font-size: 1.1rem; }
.tools .ib:disabled { opacity: .35; cursor: default; }
.speed { appearance: none; -webkit-appearance: none; display: inline-block; line-height: 38px; text-align: center; text-align-last: center; font-size: .85rem; cursor: pointer; padding: 0 12px; }
.speed option { background: var(--surface); color: var(--ink); }

/* book: paper is the palette's --ink, text is --bg, so the curl reads against the dark room */
.book { display: flex; justify-content: center; align-items: center; padding: 8px 0 0; min-height: calc(100vh - 130px); min-height: calc(100svh - 130px); }
.flip { margin: 0 auto; }

/* the paper: warm, with a soft shade where the page meets the spine */
.page {
  background:
    linear-gradient(to right, rgba(0,0,0,.14), rgba(0,0,0,.04) 14px, transparent 42px),
    linear-gradient(180deg, #f6f2ea, #ece6d8);
  color: var(--bg);
  overflow: hidden;
  will-change: transform;
}
.pageContent { height: 100%; padding: 36px 28px 22px; display: flex; flex-direction: column; overflow-y: auto; scrollbar-width: none; }
.pageContent::-webkit-scrollbar { display: none; }
.verse { min-height: 100%; display: flex; flex-direction: column; }
.vText { margin: auto 0 0; text-align: center; font-family: var(--font-display), Georgia, serif; font-size: clamp(1.25rem, 4.8vw, 1.7rem); line-height: 1.65; color: #2b2a24; }
.vRef { margin-top: auto; padding-top: 26px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: .78rem; color: #6b5a2c; }
.vn { display: inline-grid; place-items: center; min-width: 2em; height: 2em; padding: 0 .3em; border: 1px solid #8a6d2f; border-radius: 999px; color: #6b5a2c; font-family: var(--font-display), Georgia, serif; font-size: .95rem; }

/* word-by-word highlight while a verse is read aloud.
   The paper is light, so the highlight is a gold wash behind dark text. */
.w { padding: 0 .08em; border-radius: 5px; transition: background .12s, color .12s, box-shadow .12s; }
.wOn { background: color-mix(in srgb, var(--gold) 38%, transparent); color: #000; box-shadow: 0 0 0 2px color-mix(in srgb, var(--gold) 38%, transparent); }

/* names of people in a verse: a faint dotted underline that says "tap me" */
.name { background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; border-bottom: 1.5px dotted #8a6d2f; transition: color .15s, border-color .15s; }
.name:hover, .name:focus-visible { color: #6b5a2c; border-bottom-style: solid; }

/* person card: slides up from the bottom over the page */
.sheetWrap { position: fixed; inset: 0; z-index: 40; display: flex; align-items: flex-end; }
.scrim { position: absolute; inset: 0; background: rgba(0,0,0,.55); backdrop-filter: blur(2px); animation: bb-fade .2s ease-out; }
.sheet { position: relative; width: min(680px, 100%); max-height: 78vh; max-height: 78svh; margin: 0 auto; overflow-y: auto; overscroll-behavior: contain; padding: 10px 22px calc(22px + env(safe-area-inset-bottom, 0px)); background: var(--surface); border: 1px solid color-mix(in srgb, var(--gold) 55%, transparent); border-bottom: 0; border-radius: 24px 24px 0 0; box-shadow: 0 -12px 40px rgba(0,0,0,.5); animation: bb-rise .26s cubic-bezier(.2,.8,.2,1); }
.grab { width: 40px; height: 4px; margin: 0 auto 14px; border-radius: 999px; background: var(--line); }
.sheetName { margin: 0; font-family: var(--font-display), Georgia, serif; font-weight: 500; font-size: 1.8rem; line-height: 1.15; }
.sheetMeta { margin: 4px 0 0; color: var(--muted); font-size: .85rem; }
.bio { margin: 14px 0 0; line-height: 1.6; font-size: .98rem; color: color-mix(in srgb, var(--ink) 88%, transparent); }
.bioCredit { margin: 6px 0 0; color: var(--muted); font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.chip { padding: 7px 13px; border: 1px solid color-mix(in srgb, var(--gold) 45%, transparent); border-radius: 999px; font-size: .82rem; transition: border-color .15s, color .15s; }
.chip:hover { border-color: var(--gold); color: var(--gold); }
.chipPlain { padding: 7px 13px; border: 1px solid var(--line); border-radius: 999px; font-size: .82rem; color: var(--muted); }
.sheetActions { display: flex; gap: 10px; margin-top: 22px; }
.primary { flex: 1; height: 46px; border-radius: 999px; background: var(--bible); border: 1px solid var(--bible); color: #fff; font-weight: 600; }
.ghost { height: 46px; padding: 0 22px; border-radius: 999px; border: 1px solid var(--line); }
@keyframes bb-rise { from { transform: translateY(40px); opacity: 0; } }
@keyframes bb-fade { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .sheet, .scrim { animation: none; } }

/* cover: a rigid board that swings open (data-density="hard"), crimson all the way to the edge */
.coverPage {
  background:
    linear-gradient(to right, rgba(0,0,0,.35), transparent 30px),
    radial-gradient(80% 60% at 50% 100%, color-mix(in srgb, var(--bible) 60%, transparent), transparent 70%),
    color-mix(in srgb, var(--bible) 30%, var(--bg));
  color: var(--ink);
}
.cover { position: relative; justify-content: center; align-items: center; text-align: center; padding: 40px 30px; }
.cover::before { content: ""; position: absolute; inset: 14px; border: 3px double var(--gold); border-radius: 6px; pointer-events: none; }
.coverName { font-family: var(--font-display), Georgia, serif; font-size: 2.4rem; line-height: 1.15; color: var(--gold); }
.coverCh { font-family: var(--font-display), Georgia, serif; font-size: 1.5rem; margin-top: 14px; }
.coverSub { color: var(--muted); margin-top: 8px; font-size: .82rem; letter-spacing: .12em; text-transform: uppercase; }

/* family tree */
.tree { display: flex; flex-direction: column; align-items: center; padding: 26px 0 0; }
.label { margin: 0 0 10px; color: var(--muted); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; }
.couple { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px; }
.contents { display: contents; }
.join { width: 26px; height: 26px; flex: none; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--gold) 60%, transparent); color: var(--gold); display: grid; place-items: center; font-size: .8rem; background: var(--surface); }
.stem { width: 1px; height: 26px; background: color-mix(in srgb, var(--gold) 60%, transparent); }
.stub { width: 1px; height: 16px; background: color-mix(in srgb, var(--gold) 60%, transparent); margin: 0 auto; }
.scroller { width: 100%; overflow-x: auto; padding-bottom: 6px; }
.kids { display: flex; align-items: flex-start; width: max-content; margin: 0 auto; }
.kid { padding: 0 5px; background-repeat: no-repeat; background-image: linear-gradient(color-mix(in srgb, var(--gold) 60%, transparent), color-mix(in srgb, var(--gold) 60%, transparent)); }
.kidMid { background-size: 100% 1px; background-position: 0 0; }
.kidFirst { background-size: 50% 1px; background-position: 100% 0; }
.kidLast { background-size: 50% 1px; background-position: 0 0; }
.kidOnly { background-image: none; }
.card { display: block; min-width: 112px; max-width: 156px; padding: 10px 14px; text-align: center; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); transition: border-color .15s, transform .15s; }
.card:hover { border-color: var(--gold); transform: translateY(-2px); }
.cardM { border-color: color-mix(in srgb, var(--gold) 55%, transparent); }
.cardF { border-color: color-mix(in srgb, var(--blossom) 55%, transparent); }
.card.cardFocus { cursor: default; min-width: 150px; padding: 14px 20px; border: 2px solid var(--gold); background: linear-gradient(180deg, color-mix(in srgb, var(--bible) 30%, var(--surface)), var(--surface)); box-shadow: 0 8px 30px color-mix(in srgb, var(--bible) 40%, transparent); transform: none; }
.cardName { display: block; font-family: var(--font-display), Georgia, serif; font-size: 1.05rem; line-height: 1.25; }
.cardFocus .cardName { font-size: 1.45rem; }
.cardYears { display: block; margin-top: 2px; color: var(--muted); font-size: .72rem; }
.cardWith { display: block; margin-top: 2px; color: var(--bibleText); font-size: .7rem; }
.empty { color: var(--muted); padding: 28px 4px; text-align: center; }
`;

/* prefix every class selector (".foo" -> ".bb-foo"); numbers like ".15s" are untouched */
const STYLES = RAW_CSS.replace(/\.([a-zA-Z_][\w-]*)/g, ".bb-$1");

/* css.foo -> "bb-foo", so the JSX below reads exactly like it did with the module */
const css = new Proxy({} as Record<string, string>, {
  get: (_, key) => `bb-${String(key)}`,
});

const HTMLFlipBook = dynamic(
  () =>
    import("react-pageflip").then((mod) => {
      const outer = (mod as unknown as { default?: unknown }).default;
      const inner = (outer as { default?: unknown } | undefined)?.default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Book = (inner ?? outer ?? mod) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Wrapped = ({ flipRef, ...props }: any) => <Book ref={flipRef} {...props} />;
      return Wrapped;
    }),
  { ssr: false }
);

const LOGO_SRC = "/bible-logo.png";
const MIN_MENTIONS = 5;

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");


const era = (y: number) => `${Math.abs(y)} ${y < 0 ? "BC" : "AD"}`;
function years(p: Person): string {
  const { born: b, died: d } = p;
  if (b === undefined && d === undefined) return "";
  if (b !== undefined && d !== undefined) {
    if (b < 0 === d < 0) return `${Math.abs(b)}–${era(d)}`;
    return `${era(b)} – ${era(d)}`;
  }
  return b !== undefined ? `b. ${era(b)}` : `d. ${era(d as number)}`;
}

function hintFor(p: Person, byId: Map<string, Person>): string {
  const father = p.father ? byId.get(p.father) : undefined;
  const mother = p.mother ? byId.get(p.mother) : undefined;
  const partner = p.partners?.[0] ? byId.get(p.partners[0]) : undefined;
  const child = p.children?.[0] ? byId.get(p.children[0]) : undefined;
  const kid = p.gender === "F" ? "daughter" : p.gender === "M" ? "son" : "child";
  if (father) return `${kid} of ${father.name}`;
  if (mother) return `${kid} of ${mother.name}`;
  if (partner) return `${p.gender === "F" ? "wife" : p.gender === "M" ? "husband" : "partner"} of ${partner.name}`;
  if (child) return `parent of ${child.name}`;
  return "";
}

type Route =
  | { k: "home" }
  | { k: "book"; b: number }
  | { k: "read"; b: number; c: number; v?: number }
  | { k: "tree"; id: string };

function parseHash(byId: Map<string, Person>): Route {
  const h = window.location.hash;
  let m = h.match(/^#b(\d+)-(\d+)(?:-(\d+))?$/);
  if (m) {
    const book = BIBLE[Number(m[1]) - 1];
    const c = Number(m[2]);
    if (book && c >= 1 && c <= book.chapters.length) {
      const v = m[3] ? Math.min(Math.max(Number(m[3]), 1), book.chapters[c - 1].length) : undefined;
      return { k: "read", b: book.id, c, v };
    }
  }
  m = h.match(/^#b(\d+)$/);
  if (m && BIBLE[Number(m[1]) - 1]) return { k: "book", b: Number(m[1]) };
  m = h.match(/^#p([\w-]+)$/);
  if (m && byId.has(decodeURIComponent(m[1]))) return { k: "tree", id: decodeURIComponent(m[1]) };
  return { k: "home" };
}

const hashOf = (r: Route) =>
  r.k === "book" ? `#b${r.b}` : r.k === "read" ? `#b${r.b}-${r.c}${r.v ? `-${r.v}` : ""}` : r.k === "tree" ? `#p${r.id}` : "";

export default function Bible() {
  return <BibleApp people={PEOPLE} books={BIBLE} />;
}

function BibleApp({ people, books }: { people: Person[]; books: Book[] }) {
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const [route, setRoute] = useState<Route>({ k: "home" });
  const [tab, setTab] = useState<"books" | "people">("books");
  /* where a family tree opened from a verse should return to */
  const [returnTo, setReturnTo] = useState<Route | null>(null);

  useEffect(() => {
    const read = () => {
      const r = parseHash(byId);
      setRoute(r);
      if (r.k !== "tree") setReturnTo(null);
    };
    read();
    window.addEventListener("hashchange", read);
    window.addEventListener("popstate", read);
    return () => {
      window.removeEventListener("hashchange", read);
      window.removeEventListener("popstate", read);
    };
  }, [byId]);

  const go = (r: Route) => {
    window.history.pushState(null, "", r.k === "home" ? window.location.pathname : hashOf(r));
    setRoute(r);
    if (r.k !== "tree") setReturnTo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const book = route.k === "book" || route.k === "read" ? books[route.b - 1] : undefined;
  const person = route.k === "tree" ? byId.get(route.id) : undefined;

  return (
    <div className={css.shell}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className={css.glow} aria-hidden="true" />
      <div className={css.wrap}>
        {route.k === "read" && book ? (
          <Reader
            key={`${book.id}-${route.c}`}
            book={book}
            chapter={route.c}
            startVerse={route.v ?? 0}
            byId={byId}
            onBack={() => go({ k: "book", b: book.id })}
            onChapter={(c) => go({ k: "read", b: book.id, c })}
            onTree={(id, v) => {
              setReturnTo({ k: "read", b: book.id, c: route.c, v });
              go({ k: "tree", id });
            }}
          />
        ) : route.k === "book" && book ? (
          <Chapters book={book} onPick={(c) => go({ k: "read", b: book.id, c })} onBack={() => go({ k: "home" })} />
        ) : person ? (
          <Tree
            key={person.id}
            person={person}
            byId={byId}
            onOpen={(id) => go({ k: "tree", id })}
            onBack={() => (returnTo ? go(returnTo) : go({ k: "home" }))}
            backLabel={returnTo ? "Back to the verse" : "All people"}
          />
        ) : (
          <Home
            tab={tab}
            setTab={setTab}
            books={books}
            people={people}
            byId={byId}
            onBook={(b) => go({ k: "book", b })}
            onPerson={(id) => go({ k: "tree", id })}
          />
        )}
      </div>
    </div>
  );
}


function Home({
  tab, setTab, books, people, byId, onBook, onPerson,
}: {
  tab: "books" | "people";
  setTab: (t: "books" | "people") => void;
  books: Book[];
  people: Person[];
  byId: Map<string, Person>;
  onBook: (b: number) => void;
  onPerson: (id: string) => void;
}) {
  return (
    <>
      <header className={css.hero}>
        <div className={css.logo}>
          <img src={LOGO_SRC} alt="Bible app logo" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
        </div>
        <div>
          <h1>Bible</h1>
          <p className={css.tagline}>{tab === "books" ? "Choose a book to read" : "Choose a name to see their family tree"}</p>
        </div>
      </header>

      <div className={css.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === "books"} className={css.tab} onClick={() => setTab("books")}>Books</button>
        <button type="button" role="tab" aria-selected={tab === "people"} className={css.tab} onClick={() => setTab("people")}>Family trees</button>
      </div>

      {tab === "books" ? <BookList books={books} onBook={onBook} /> : <PeopleList people={people} byId={byId} onOpen={onPerson} />}
    </>
  );
}

function ListRow({ badge, title, sub, onClick }: { badge: string; title: string; sub?: string; onClick: () => void }) {
  return (
    <button type="button" className={css.row} onClick={onClick}>
      <span className={css.num}><i>{badge}</i></span>
      <span>
        <span className={css.nm}>{title}</span>
        {sub && (
          <>
            <br />
            <span className={css.sub}>{sub}</span>
          </>
        )}
      </span>
      <span className={css.go} aria-hidden="true">→</span>
    </button>
  );
}

function BookList({ books, onBook }: { books: Book[]; onBook: (b: number) => void }) {
  return (
    <>
      {([["Old Testament", "old"], ["New Testament", "new"]] as const).map(([title, t]) => (
        <section key={t}>
          <div className={css.letter}>{title}</div>
          <ul className={css.list}>
            {books.filter((b) => b.testament === t).map((b) => (
              <li key={b.id}>
                <ListRow
                  badge={String(b.id)}
                  title={b.name}
                  sub={`${b.chapters.length} ${b.chapters.length === 1 ? "chapter" : "chapters"}`}
                  onClick={() => onBook(b.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className={css.credit}>King James Version (public domain).</p>
    </>
  );
}

function PeopleList({ people, byId, onOpen }: { people: Person[]; byId: Map<string, Person>; onOpen: (id: string) => void }) {
  const listed = useMemo(() => people.filter((p) => p.mentions >= MIN_MENTIONS).sort((a, b) => a.name.localeCompare(b.name)), [people]);
  const dupes = useMemo(() => {
    const n = new Map<string, number>();
    listed.forEach((p) => n.set(p.name, (n.get(p.name) ?? 0) + 1));
    return n;
  }, [listed]);

  return (
    <>
      <ul className={css.list}>
        {listed.map((p, i) => {
          const first = i === 0 || listed[i - 1].name[0].toUpperCase() !== p.name[0].toUpperCase();
          const hint = (dupes.get(p.name) ?? 0) > 1 ? hintFor(p, byId) : "";
          return (
            <li key={p.id}>
              {first && <div className={css.letter} aria-hidden="true">{p.name[0].toUpperCase()}</div>}
              <ListRow badge={p.name[0].toUpperCase()} title={p.name} sub={[hint, years(p)].filter(Boolean).join(" · ")} onClick={() => onOpen(p.id)} />
            </li>
          );
        })}
      </ul>
      <p className={css.credit}>Family data: Theographic Bible Metadata (CC BY-SA 4.0). Dates are approximate. Short bios: Easton’s Bible Dictionary.</p>
    </>
  );
}


function Chapters({ book, onPick, onBack }: { book: Book; onPick: (c: number) => void; onBack: () => void }) {
  const n = book.chapters.length;
  return (
    <>
      <div className={css.bar}>
        <button type="button" className={css.ib} onClick={onBack} aria-label="All books">←</button>
        <div className={css.title}>
          {book.name}
          <small>{n} {n === 1 ? "chapter" : "chapters"}</small>
        </div>
        <span className={css.ib} aria-hidden="true" />
      </div>
      <p className={css.chapHint}>Choose a chapter</p>
      <div className={css.chapters}>
        {book.chapters.map((_, i) => (
          <button key={i} type="button" className={css.chap} onClick={() => onPick(i + 1)}>{i + 1}</button>
        ))}
      </div>
    </>
  );
}



const ReaderCtx = createContext<{
  current: number;
  speakingVerse: number;
  activeWord: number;
  openPerson: (id: string) => void;
}>({ current: 0, speakingVerse: -1, activeWord: -1, openPerson: () => {} });
const WINDOW = 3; // only pages this close to the current one mount their text
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]; // reading speeds offered in the dropdown


const BAD_VOICES = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|eddy|flo\b|grandma|grandpa|reed|rocko|sandy|shelley|espeak|robot/i;
const WARM_GB = /serena|daniel|kate|arthur|oliver|stephanie|martha|sonia|ryan|libby|maisie|thomas/i;
const WARM_US = /samantha|ava|allison|susan|zoe|evan|nathan|jenny|aria|guy/i;

function scoreVoice(v: SpeechSynthesisVoice): number {
  const label = `${v.name} ${v.voiceURI}`;
  const lang = v.lang.toLowerCase().replace("_", "-");
  if (!lang.startsWith("en") || BAD_VOICES.test(label)) return -1000;

  let s = 0;
  if (lang === "en-gb") s += 40;
  else if (lang === "en-us") s += 20;
  else if (lang === "en-au" || lang === "en-ie") s += 15;

  if (/premium|enhanced|natural|neural|studio/i.test(label)) s += 60;
  if (/compact/i.test(label)) s -= 25;
  if (lang === "en-gb" ? WARM_GB.test(label) : WARM_US.test(label)) s += 35;
  if (/google/i.test(label)) s += 10;
  if (v.localService) s += 20;
  return s;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const ranked = window.speechSynthesis
    .getVoices()
    .map((v) => ({ v, s: scoreVoice(v) }))
    .filter((x) => x.s > -1000)
    .sort((a, b) => b.s - a.s);
  return ranked[0]?.v;
}

function NameButton({ id, children }: { id: string; children: ReactNode }) {
  const { openPerson } = useContext(ReaderCtx);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const keep = (e: Event) => e.stopPropagation();
    const events = ["mousedown", "touchstart"] as const;
    events.forEach((n) => el.addEventListener(n, keep, { passive: true }));
    return () => events.forEach((n) => el.removeEventListener(n, keep));
  }, []);
  return (
    <button ref={ref} type="button" className={css.name} onClick={() => openPerson(id)}>
      {children}
    </button>
  );
}


function VerseText({ text, index, tags }: { text: string; index: number; tags: [number, number, string][] }) {
  const { speakingVerse, activeWord } = useContext(ReaderCtx);
  const reading = speakingVerse === index;
  let w = -1;
  let offset = 0;
  return (
    <p className={css.vText}>
      {text.split(/(\s+)/).map((tok, k) => {
        const start = offset;
        offset += tok.length;
        if (!tok || /^\s+$/.test(tok)) return tok;
        w++;
        const end = start + tok.length;
        const hit = tags.find(([s, e]) => s < end && e > start);
        let body: ReactNode = tok;
        if (hit) {
          const a = Math.max(hit[0], start) - start;
          const b = Math.min(hit[1], end) - start;
          body = (
            <>
              {tok.slice(0, a)}
              <NameButton id={hit[2]}>{tok.slice(a, b)}</NameButton>
              {tok.slice(b)}
            </>
          );
        }
        return reading ? (
          <span key={k} className={cx(css.w, w === activeWord && css.wOn)}>{body}</span>
        ) : (
          <span key={k}>{body}</span>
        );
      })}
    </p>
  );
}

const FlipPage = forwardRef<
  HTMLDivElement,
  { index: number; children: ReactNode; density?: "hard" | "soft"; pageClass?: string; className?: string }
>(({ index, children, density = "soft", pageClass, className }, ref) => {
  const { current } = useContext(ReaderCtx);
  const near = Math.abs(index - current) <= WINDOW;
  return (
    <div ref={ref} data-density={density} className={cx(css.page, pageClass)}>
      <div className={cx(css.pageContent, className)}>{near ? children : null}</div>
    </div>
  );
});
FlipPage.displayName = "FlipPage";

function PersonSheet({
  person, byId, onClose, onSwitch, onTree,
}: {
  person: Person;
  byId: Map<string, Person>;
  onClose: () => void;
  onSwitch: (id: string) => void;
  onTree: () => void;
}) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const rel: { label: string; p: Person }[] = [];
  const father = person.father ? byId.get(person.father) : undefined;
  const mother = person.mother ? byId.get(person.mother) : undefined;
  if (father) rel.push({ label: "Father", p: father });
  if (mother) rel.push({ label: "Mother", p: mother });
  const spouse = person.gender === "F" ? "Husband" : person.gender === "M" ? "Wife" : "Spouse";
  (person.partners ?? []).slice(0, 3).forEach((id) => {
    const p = byId.get(id);
    if (p) rel.push({ label: spouse, p });
  });
  const kids = person.children?.length ?? 0;
  const meta = [hintFor(person, byId), years(person)].filter(Boolean).join(" · ");
  const first = person.first ? `${BIBLE[person.first[0] - 1].name} ${person.first[1]}:${person.first[2]}` : "";

  return (
    <div className={css.sheetWrap} role="dialog" aria-modal="true" aria-label={person.name}>
      <button type="button" className={css.scrim} onClick={onClose} aria-label="Close" />
      <div className={css.sheet}>
        <div className={css.grab} aria-hidden="true" />
        <h3 className={css.sheetName}>{person.name}</h3>
        {meta && <p className={css.sheetMeta}>{meta}</p>}
        {person.bio ? (
          <>
            <p className={css.bio}>{person.bio}</p>
            <p className={css.bioCredit}>Easton’s Bible Dictionary</p>
          </>
        ) : (
          <p className={css.bio}>No dictionary entry for this person. Open the family tree to see who they were related to.</p>
        )}
        {first && <p className={css.sheetMeta}>First named in {first}</p>}

        {(rel.length > 0 || kids > 0) && (
          <div className={css.chips}>
            {rel.map(({ label, p }) => (
              <button key={`${label}-${p.id}`} type="button" className={css.chip} onClick={() => onSwitch(p.id)}>
                {label} · {p.name}
              </button>
            ))}
            {kids > 0 && <span className={css.chipPlain}>{kids} {kids === 1 ? "child" : "children"}</span>}
          </div>
        )}

        <div className={css.sheetActions}>
          <button type="button" className={css.primary} onClick={onTree}>Family tree</button>
          <button type="button" className={css.ghost} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ChapterStrip({ total, active, onPick }: { total: number; active: number; onPick: (c: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current;
    const el = box?.querySelector<HTMLElement>('[aria-current="true"]');
    if (box && el) box.scrollLeft = el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2;
  }, [active]);

  return (
    <div className={css.strip} ref={ref} role="tablist" aria-label="Chapters">
      {Array.from({ length: total }, (_, i) => i + 1).map((c) => (
        <button
          key={c}
          type="button"
          className={css.stripChip}
          aria-current={c === active ? "true" : undefined}
          onClick={() => c !== active && onPick(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function Reader({
  book, chapter, startVerse, byId, onBack, onChapter, onTree,
}: {
  book: Book;
  chapter: number;
  startVerse: number;
  byId: Map<string, Person>;
  onBack: () => void;
  onChapter: (c: number) => void;
  onTree: (id: string, verse: number) => void;
}) {
  const [current, setCurrent] = useState(startVerse);
  const verses = book.chapters[chapter - 1];

  const [speaking, setSpeaking] = useState(false);
  const [speakingVerse, setSpeakingVerse] = useState(-1);
  const [activeWord, setActiveWord] = useState(-1);
  const [rate, setRate] = useState(1);

  const [sheetId, setSheetId] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipRef = useRef<any>(null);
  const session = useRef(0);
  const timers = useRef<number[]>([]);
  const expected = useRef(-1);
  const rateRef = useRef(1);
  const speakingRef = useRef(false);
  const pageRef = useRef(startVerse);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const stop = () => {
    session.current++;
    clearTimers();
    window.speechSynthesis?.cancel();
    speakingRef.current = false;
    setSpeaking(false);
    setSpeakingVerse(-1);
    setActiveWord(-1);
  };

  const speakVerse = (i: number) => {
    const synth = window.speechSynthesis;
    const token = ++session.current;
    clearTimers();
    synth.cancel();
    if (i >= verses.length) return stop();

    const text = verses[i];
    const starts = [...text.matchAll(/\S+/g)].map((m) => m.index ?? 0);
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else u.lang = "en-GB";
    u.rate = rateRef.current;

    let gotBoundary = false;
    let t0 = Date.now();

    u.onstart = () => {
      t0 = Date.now();
      timers.current.push(
        window.setTimeout(() => {
          if (gotBoundary || token !== session.current) return;
          const total = (text.length * 70) / rateRef.current;
          starts.forEach((s, k) => {
            const delay = Math.max(0, (s / text.length) * total - (Date.now() - t0));
            timers.current.push(
              window.setTimeout(() => {
                if (!gotBoundary && token === session.current) setActiveWord(k);
              }, delay)
            );
          });
        }, 1000)
      );
    };

    u.onboundary = (e) => {
      if (token !== session.current) return;
      gotBoundary = true;
      let w = 0;
      while (w + 1 < starts.length && starts[w + 1] <= e.charIndex) w++;
      setActiveWord(w);
    };

    u.onend = () => {
      if (token !== session.current) return;
      const next = i + 1;
      if (next >= verses.length) return stop();
      expected.current = next + 1;
      flipRef.current?.pageFlip()?.flipNext();
      timers.current.push(
        window.setTimeout(() => {
          if (token === session.current) speakVerse(next);
        }, 450)
      );
    };

    u.onerror = () => {
      if (token === session.current) stop();
    };

    setSpeakingVerse(i);
    setActiveWord(0);
    synth.speak(u);
  };

  const listen = () => {
    if (speakingRef.current) return stop();
    speakingRef.current = true;
    setSpeaking(true);
    if (current < 1) {
      expected.current = 1;
      flipRef.current?.pageFlip()?.flipNext();
      speakVerse(0);
    } else {
      expected.current = current;
      speakVerse(current - 1);
    }
  };


  const skip = (dir: 1 | -1) => {
    const from = pageRef.current;
    if (from < 1 && dir < 0) return;
    const target = from + dir;
    if (target < 1 || target > verses.length) return;

    const wasSpeaking = speakingRef.current;
    if (wasSpeaking) expected.current = target;
    pageRef.current = target;

    const flip = flipRef.current?.pageFlip();
    if (dir > 0) flip?.flipNext();
    else flip?.flipPrev();

    if (wasSpeaking) speakVerse(target - 1);
  };

  const changeRate = (next: number) => {
    rateRef.current = next;
    setRate(next);
    if (speakingRef.current && expected.current >= 1) speakVerse(expected.current - 1);
  };

  const openPerson = (id: string) => {
    if (speakingRef.current) stop();
    setSheetId(id);
  };

  useEffect(() => {
    window.speechSynthesis?.getVoices();
    return () => {
      session.current++;
      timers.current.forEach(clearTimeout);
      window.speechSynthesis?.cancel();
    };
  }, []);


  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (sheetId) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "SELECT" || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return; // let the speed dropdown use its own arrows
      if (e.key === "ArrowRight") skip(1);
      else if (e.key === "ArrowLeft") skip(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const sheetPerson = sheetId ? byId.get(sheetId) : undefined;

  return (
    <>
      <div className={css.bar}>
        <button type="button" className={css.ib} onClick={onBack} aria-label={`${book.name} chapters`}>←</button>
        <div className={css.title}>
          {book.name} {chapter}
          <small>{verses.length} verses</small>
        </div>
        {canSpeak ? (
          <div className={css.tools}>
            <select
              className={cx(css.ib, css.speed)}
              value={rate}
              onChange={(e) => changeRate(Number(e.target.value))}
              aria-label="Reading speed"
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>{s}×</option>
              ))}
            </select>
            <button type="button" className={css.ib} onClick={() => skip(-1)} disabled={current <= 1} aria-label="Previous verse">‹</button>
            <button type="button" className={css.ib} onClick={listen} aria-label={speaking ? "Stop reading" : "Listen"}>
              {speaking ? "■" : "▶"}
            </button>
            <button type="button" className={css.ib} onClick={() => skip(1)} disabled={current >= verses.length} aria-label="Next verse">›</button>
          </div>
        ) : (
          <span className={css.ib} aria-hidden="true" />
        )}
      </div>

      <ChapterStrip total={book.chapters.length} active={chapter} onPick={onChapter} />

      <div className={css.book}>
        <ReaderCtx.Provider value={{ current, speakingVerse, activeWord, openPerson }}>
          <HTMLFlipBook
            flipRef={flipRef}
            key={`${book.id}-${chapter}`}
            width={370}
            height={560}
            size="stretch"
            minWidth={280}
            maxWidth={520}
            minHeight={420}
            maxHeight={780}
            maxShadowOpacity={0.4}
            drawShadow={true}
            showCover={true}
            usePortrait={true}
            mobileScrollSupport={true}
            className={css.flip}
            style={{}}
            startPage={startVerse}
            flippingTime={900}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            renderOnlyPageLengthChange={true}
            onFlip={(e: { data: number }) => {
              setCurrent(e.data);
              pageRef.current = e.data;
              window.history.replaceState(null, "", e.data >= 1 ? `#b${book.id}-${chapter}-${e.data}` : `#b${book.id}-${chapter}`);
              if (speakingRef.current && e.data !== expected.current) {
                if (e.data >= 1) {
                  expected.current = e.data;
                  speakVerse(e.data - 1);
                } else stop();
              }
            }}
          >
            <FlipPage index={0} density="hard" pageClass={css.coverPage} className={css.cover}>
              <div className={css.coverName}>{book.name}</div>
              <div className={css.coverCh}>Chapter {chapter}</div>
              <div className={css.coverSub}>King James Version</div>
            </FlipPage>

            {verses.map((text, i) => (
              <FlipPage key={i} index={i + 1}>
                <div className={css.verse}>
                  <VerseText text={text} index={i} tags={TAGS[`${book.id}.${chapter}.${i + 1}`] ?? []} />
                  <div className={css.vRef}>
                    <span className={css.vn}>{i + 1}</span>
                    {book.name} {chapter}:{i + 1}
                  </div>
                </div>
              </FlipPage>
            ))}
          </HTMLFlipBook>
        </ReaderCtx.Provider>
      </div>

      {sheetPerson && (
        <PersonSheet
          person={sheetPerson}
          byId={byId}
          onClose={() => setSheetId(null)}
          onSwitch={(id) => setSheetId(id)}
          onTree={() => onTree(sheetPerson.id, Math.max(pageRef.current, 1))}
        />
      )}
    </>
  );
}



function PersonCard({ person, focus = false, note, onOpen }: { person: Person; focus?: boolean; note?: string; onOpen?: (id: string) => void }) {
  const cls = cx(css.card, person.gender === "M" && css.cardM, person.gender === "F" && css.cardF, focus && css.cardFocus);
  const body = (
    <>
      <span className={css.cardName}>{person.name}</span>
      {years(person) && <span className={css.cardYears}>{years(person)}</span>}
      {note && <span className={css.cardWith}>{note}</span>}
    </>
  );
  if (focus) return <div className={cls} aria-current="true">{body}</div>;
  return <button type="button" className={cls} onClick={() => onOpen?.(person.id)}>{body}</button>;
}

function Tree({
  person, byId, onOpen, onBack, backLabel,
}: {
  person: Person;
  byId: Map<string, Person>;
  onOpen: (id: string) => void;
  onBack: () => void;
  backLabel: string;
}) {
  const get = (id?: string) => (id ? byId.get(id) : undefined);
  const parents = [get(person.father), get(person.mother)].filter((p): p is Person => !!p);
  const partners = (person.partners ?? []).map(get).filter((p): p is Person => !!p);
  const children = (person.children ?? [])
    .map(get)
    .filter((p): p is Person => !!p)
    .sort((a, b) => (a.born ?? Infinity) - (b.born ?? Infinity));

  const withWhom = (child: Person) => {
    if (partners.length < 2) return undefined;
    const other = get(child.father === person.id ? child.mother : child.father);
    return other ? `with ${other.name}` : undefined;
  };

  const kidClass = (i: number, n: number) => cx(css.kid, n === 1 ? css.kidOnly : i === 0 ? css.kidFirst : i === n - 1 ? css.kidLast : css.kidMid);

  return (
    <>
      <div className={css.bar}>
        <button type="button" className={css.ib} onClick={onBack} aria-label={backLabel}>←</button>
        <div className={css.title}>
          {person.name}
          <small>{years(person) || "Family tree"}</small>
        </div>
        <span className={css.ib} aria-hidden="true" />
      </div>

      <div className={css.tree}>
        {parents.length > 0 && (
          <>
            <p className={css.label}>Parents</p>
            <div className={css.couple}>
              {parents.map((p, i) => (
                <div key={p.id} className={css.contents}>
                  {i > 0 && <span className={css.join} aria-hidden="true">+</span>}
                  <PersonCard person={p} onOpen={onOpen} />
                </div>
              ))}
            </div>
            <div className={css.stem} />
          </>
        )}

        <div className={css.couple}>
          <PersonCard person={person} focus />
          {partners.map((p) => (
            <div key={p.id} className={css.contents}>
              <span className={css.join} aria-hidden="true">+</span>
              <PersonCard person={p} onOpen={onOpen} />
            </div>
          ))}
        </div>

        {children.length > 0 && (
          <>
            <div className={css.stem} />
            <p className={css.label}>{children.length === 1 ? "Child" : `Children · ${children.length}`}</p>
            <div className={css.scroller}>
              <div className={css.kids}>
                {children.map((c, i) => (
                  <div key={c.id} className={kidClass(i, children.length)}>
                    <div className={css.stub} />
                    <PersonCard person={c} note={withWhom(c)} onOpen={onOpen} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {parents.length === 0 && partners.length === 0 && children.length === 0 && <p className={css.empty}>No family is recorded for this person.</p>}
      </div>
    </>
  );
}