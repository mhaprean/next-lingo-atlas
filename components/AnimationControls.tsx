"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Square, ChevronDown, ChevronUp } from "lucide-react";
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Word, Group, Delays, DEFAULT_DELAYS } from "@/types/animation";

interface AnimationControlsProps {
  words: Word[];
  groups: Group[];
  isPlaying: boolean;
  currentWordName: string;
  currentGroupLabel: string;
  onPlay: (selectedWords: Word[], delays: Delays) => void;
  onStop: () => void;
}

export default function AnimationControls({
  words,
  groups,
  isPlaying,
  currentWordName,
  currentGroupLabel,
  onPlay,
  onStop,
}: AnimationControlsProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [delays, setDelays] = useState<Delays>(DEFAULT_DELAYS);
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter words by selected group
  const filteredWords = useMemo(() => {
    if (selectedGroupId === "all") return words;

    return words.filter((word) =>
      word.groups.some((group) => group.groupId === selectedGroupId),
    );
  }, [words, selectedGroupId]);

  // Handle group change
  const handleGroupChange = (newGroupId: string) => {
    setSelectedGroupId(newGroupId);
    // Compute new selected words directly to avoid stale closure
    const newFilteredWords =
      newGroupId === "all"
        ? words
        : words.filter((word) => {
            const groupData = groups.find((g) => g.id === newGroupId);
            return (
              groupData &&
              word.groups.some((group) => group.groupId === newGroupId)
            );
          });
    const newSelectedWords = newFilteredWords.map((word) => word.name);

    console.log("!!!!!!!!!!! newSelectedWords ", newSelectedWords);
    console.log("!!!!!!! words ", words);
    setSelectedWords(newSelectedWords);
  };

  const handlePlay = () => {
    const selectedWordsList = words.filter((word) =>
      selectedWords.includes(word.name),
    );
    onPlay(selectedWordsList, delays);
  };

  const handleDelayChange = (key: keyof Delays, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setDelays((prev) => ({ ...prev, [key]: numValue }));
    }
  };

  const selectedCount = selectedWords.length;
  const totalCount = filteredWords.length;

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm">
      {/* Header with toggle */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Animation Controls
          </h2>
          {isPlaying && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-sm text-muted-foreground">Playing:</span>
              <span className="font-medium text-primary">
                {currentWordName}
              </span>
              {currentGroupLabel && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium text-accent-foreground">
                    {currentGroupLabel}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {totalCount} words selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expandable controls */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Top row: Group, Delays, and Play/Stop */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Group selector */}
            <div className="flex flex-col gap-1.5 min-w-50">
              <Label htmlFor="group" className="text-sm font-medium">
                Group
              </Label>
              <Select
                value={selectedGroupId}
                onValueChange={handleGroupChange}
                disabled={isPlaying}
              >
                <SelectTrigger
                  id="group"
                  className="w-full bg-background border-border text-foreground"
                >
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Words selector */}
            <div className="flex flex-col gap-1.5 min-w-50">
              <Label htmlFor="words" className="text-sm font-medium">
                Words
              </Label>
              <Combobox
                multiple
                value={selectedWords}
                onValueChange={setSelectedWords}
              >
                <ComboboxChips>
                  <ComboboxChipsInput
                    placeholder="Select words..."
                    disabled={isPlaying}
                  />
                  <ComboboxTrigger />
                </ComboboxChips>
                <ComboboxContent className="bg-popover border-border text-popover-foreground">
                  <ComboboxList>
                    {filteredWords.map((word) => (
                      <ComboboxItem key={word.name} value={word.name}>
                        {word.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {/* Delay inputs */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entryDelay" className="text-sm font-medium">
                Entry Delay (ms)
              </Label>
              <Input
                id="entryDelay"
                type="number"
                min="0"
                step="50"
                value={delays.entryDelay}
                onChange={(e) =>
                  handleDelayChange("entryDelay", e.target.value)
                }
                disabled={isPlaying}
                className="w-28 bg-background border-border text-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wordDelay" className="text-sm font-medium">
                Word Delay (ms)
              </Label>
              <Input
                id="wordDelay"
                type="number"
                min="0"
                step="100"
                value={delays.wordDelay}
                onChange={(e) => handleDelayChange("wordDelay", e.target.value)}
                disabled={isPlaying}
                className="w-28"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="groupDelay" className="text-sm font-medium">
                Group Delay (ms)
              </Label>
              <Input
                id="groupDelay"
                type="number"
                min="0"
                step="100"
                value={delays.groupDelay}
                onChange={(e) =>
                  handleDelayChange("groupDelay", e.target.value)
                }
                disabled={isPlaying}
                className="w-28"
              />
            </div>

            {/* Play/Stop button */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium invisible">Action</Label>
              <Button
                onClick={isPlaying ? onStop : handlePlay}
                disabled={!isPlaying && selectedCount === 0}
                variant={isPlaying ? "destructive" : "default"}
                className="min-w-35"
              >
                {isPlaying ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play Animation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
