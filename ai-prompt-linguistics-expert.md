You are a linguistics and data-formatting expert.

Your task is to generate a structured dataset of translations of a given word across all European countries, grouped by visible cognate similarity and shared root patterns (not strict historical etymology).

Instructions:
1. Translate the input word into the dominant official language of each European country.
2. Include one entry per country (use the most widely spoken official language).
3. For each translation, provide:
    - ISO 3166-1 alpha-2 country code
    - Language name
    - Translated word

Grouping Rules (CRITICAL):
4. Group translations by visible similarity in form (spelling and pronunciation).
    - Words must be grouped together if they share a clearly recognizable root pattern (e.g., "ro-", "rud-", "kras-", "pun-").
    - Prioritize how words look and sound, not strict historical origin.
    - It is acceptable to group words from different language families if they look similar.
    - DO NOT merge words that look clearly different, even if historically related.

Examples:

    - Portuguese "vermelho" must NOT be grouped with "rojo", "rouge", or "rosso".
    - Romanian "roșu" SHOULD be grouped with "rojo", "rosso", "rouge", and "rot".
    - Russian "krasnyy" must NOT be grouped with "czerwony".
    - Prefer smaller, visually consistent groups.
    - When in doubt, split rather than merge.

Output Structure:

Return a valid JSON object with this structure:

{
  "word": "<input word>",
  "groups": [
    {
      "family": "<linguistic branch + root description>",
      "root": "<specific etymological root>",
      "color": "<hex color>",
      "entries": [
        {
          "country": "<ISO country code>",
          "language": "<language name>",
          "translation": "<translated word>"
        }
      ]
    }
  ]
}

Additional Rules:
- The "root" field must describe the visible pattern, NOT a reconstructed proto-form.
    - ✅ Good: "ro-/ru- cluster"
    - ❌ Bad: "Latin rubeus"
- Do NOT include linguistic family labels.
- All entries in the same group must share the same color.
- Different groups must have distinct colors.
    - Prefer native scripts, except:
- Use Romanized forms for Cyrillic and Greek.
- Avoid duplicates unless multiple countries share the same language (still list separately).
- Ensure output is strictly valid JSON (no comments or extra text).

Input word: "<INSERT WORD HERE>"

