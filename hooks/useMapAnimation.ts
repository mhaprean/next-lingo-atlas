import { useState, useRef, useCallback, useEffect } from "react";
import type { Word } from "@/app/db/schema";

interface TranslationGroup {
  family: string;
  color: string;
  entries: { country: string; translation: string }[];
}

interface UseMapAnimationOptions {
  words: {
    name: string;
    groups: TranslationGroup[];
  }[];
  entryDelay?: number;   // ms between entries within a group (default 250)
  groupDelay?: number;   // ms pause between groups (default 5000)
  wordDelay?: number;    // ms pause between words (default 3000)
}

function getGroups(word: { name: string; groups: TranslationGroup[] }): TranslationGroup[] {
  return word.groups;
}

export function useMapAnimation({
  words,
  entryDelay = 250,
  groupDelay = 5000,
  wordDelay = 3000,
}: UseMapAnimationOptions) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [visibleCountries, setVisibleCountries] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [countryColors, setCountryColors] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordName, setCurrentWordName] = useState(words[0]?.name ?? "");
  const [currentGroupLabel, setCurrentGroupLabel] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);
  const entryDelayRef = useRef(entryDelay);
  const groupDelayRef = useRef(groupDelay);
  const wordDelayRef = useRef(wordDelay);

  useEffect(() => { entryDelayRef.current = entryDelay; }, [entryDelay]);
  useEffect(() => { groupDelayRef.current = groupDelay; }, [groupDelay]);
  useEffect(() => { wordDelayRef.current = wordDelay; }, [wordDelay]);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const showAllForWord = useCallback((word: Word) => {
    const groups = getGroups(word);
    const t: Record<string, string> = {};
    const c: Record<string, string> = {};
    const v: string[] = [];
    for (const group of groups) {
      for (const entry of group.entries) {
        t[entry.country] = entry.translation;
        c[entry.country] = group.color;
        v.push(entry.country);
      }
    }
    setTranslations(t);
    setCountryColors(c);
    setVisibleCountries(v);
    setCurrentGroupLabel("");
  }, []);

  const animateWord = useCallback((wordIdx: number) => {
    if (!isPlayingRef.current || !words.length) return;

    const word = words[wordIdx % words.length];
    const groups = getGroups(word);

    setCurrentWordName(word.name);
    setCurrentWordIndex(wordIdx % words.length);
    setVisibleCountries([]);
    setTranslations({});
    setCountryColors({});

    let groupI = 0;

    const revealGroup = () => {
      if (!isPlayingRef.current) return;
      if (groupI >= groups.length) {
        // Done with this word — move to next
        const nextIdx = wordIdx + 1;
        if (nextIdx >= words.length) {
          // Animation complete
          isPlayingRef.current = false;
          setIsPlaying(false);
          return;
        }
        timeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current) animateWord(nextIdx);
        }, wordDelayRef.current);
        return;
      }

      const group = groups[groupI];
      setCurrentGroupLabel(group.family);
      let entryI = 0;

      const revealEntry = () => {
        if (!isPlayingRef.current) return;
        if (entryI >= group.entries.length) {
          // Done with this group — pause then next group
          groupI++;
          timeoutRef.current = setTimeout(revealGroup, groupDelayRef.current);
          return;
        }

        const entry = group.entries[entryI];
        setVisibleCountries((prev) => [...prev, entry.country]);
        setTranslations((prev) => ({ ...prev, [entry.country]: entry.translation }));
        setCountryColors((prev) => ({ ...prev, [entry.country]: group.color }));
        entryI++;
        timeoutRef.current = setTimeout(revealEntry, entryDelayRef.current);
      };

      timeoutRef.current = setTimeout(revealEntry, 200);
    };

    timeoutRef.current = setTimeout(revealGroup, 300);
  }, [words]);

  const play = useCallback(() => {
    if (!words.length) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    animateWord(0);
  }, [animateWord, words]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    clearTimer();
    if (words.length) {
      const first = words[0];
      setCurrentWordName(first.name);
      setCurrentWordIndex(0);
      showAllForWord(first);
    }
  }, [words, showAllForWord]);

  useEffect(() => () => clearTimer(), []);

  // Initialize with first word
  useEffect(() => {
    if (words.length && !isPlayingRef.current) {
      const first = words[0];
      setCurrentWordName(first.name);
      setCurrentWordIndex(0);
      showAllForWord(first);
    }
  }, [words, showAllForWord]);

  return {
    translations,
    countryColors,
    visibleCountries,
    isPlaying,
    currentWordName,
    currentWordIndex,
    currentGroupLabel,
    totalWords: words.length,
    play,
    stop,
  };
}