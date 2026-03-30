'use client';

import EuropeMap from "@/components/EuropeMap";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useMapAnimation } from "@/hooks/useMapAnimation";
import { getAllWordsForMap } from "./actions";

export default function Home() {
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllWordsForMap().then((data) => {
      setWords(data);
      setLoading(false);
    });
  }, []);

  const {
    translations,
    countryColors,
    visibleCountries,
    isPlaying,
    currentWordName,
    currentGroupLabel,
    play,
    stop,
  } = useMapAnimation({ words });

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-8 text-center bg-transparent">
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Master new languages with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Lingo Atlas
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your personal companion for building vocabulary, tracking progress,
          and achieving fluency faster than ever. Focus on what matters: the
          words.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link
            href="/admin"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/account/settings"
            className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-full shadow transition-all border border-gray-200 dark:border-gray-700"
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>

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

        {/* Animation controls */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="text-sm font-medium mb-2">
            {currentWordName && (
              <div>Word: <span className="font-bold">{currentWordName}</span></div>
            )}
            {currentGroupLabel && (
              <div>Group: <span className="font-bold">{currentGroupLabel}</span></div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={isPlaying ? stop : play}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              {isPlaying ? 'Stop' : 'Play Animation'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
