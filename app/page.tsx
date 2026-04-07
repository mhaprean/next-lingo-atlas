'use client';

import EuropeMap from "@/components/EuropeMap";
import AnimationControls from "@/components/AnimationControls";
import { useState, useEffect, useRef } from "react";
import { useMapAnimation } from "@/hooks/useMapAnimation";
import { getAllWordsForMap, getAllGroups } from "./actions";
import { Word, Group, DEFAULT_DELAYS } from "@/types/animation";

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [delays, setDelays] = useState(DEFAULT_DELAYS);

  useEffect(() => {
    Promise.all([getAllWordsForMap(), getAllGroups()]).then(([wordsData, groupsData]) => {
      setWords(wordsData);
      setGroups(groupsData);
      setSelectedWords(wordsData);
      setLoading(false);
    });
  }, []);

  const {
    translations,
    countryColors,
    visibleCountries,
    isPlaying,
    currentWordName,
    currentWordIndex,
    currentGroupLabel,
    totalWords,
    play,
    stop,
  } = useMapAnimation({ 
    words: selectedWords,
    entryDelay: delays.entryDelay,
    wordDelay: delays.wordDelay,
    groupDelay: delays.groupDelay,
  });

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const shouldPlayAfterUpdateRef = useRef(false);

  const handlePlay = (wordsToAnimate: Word[], newDelays: typeof delays) => {
    setSelectedWords(wordsToAnimate);
    setDelays(newDelays);
    shouldPlayAfterUpdateRef.current = true;
  };

  const handleStop = () => {
    stop();
  };

  // Trigger play after state updates are applied
  useEffect(() => {
    if (shouldPlayAfterUpdateRef.current && selectedWords.length > 0) {
      play();
      shouldPlayAfterUpdateRef.current = false;
    }
  }, [selectedWords, delays, play]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-transparent">
      {/* Animation Controls Navbar */}
      <AnimationControls
        words={words}
        groups={groups}
        isPlaying={isPlaying}
        currentWordName={currentWordName}
        currentWordIndex={currentWordIndex}
        totalWords={totalWords}
        currentGroupLabel={currentGroupLabel}
        onPlay={handlePlay}
        onStop={handleStop}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="flex-1 overflow-hidden relative min-h-[400px] w-full mt-4">
          <EuropeMap
            translations={translations}
            countryColors={countryColors}
            fontSize={16}
            textColor="hsl(var(--foreground))"
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            visibleCountries={visibleCountries}
          />
        </div>
      </div>
    </div>
  );
}
