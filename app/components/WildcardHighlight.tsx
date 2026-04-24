"use client";

import { Mark } from "@mantine/core";

export default function WildcardHighlight({
  word,
  pattern,
}: {
  word: string;
  pattern: string;
}) {
  const parts = pattern.toUpperCase().split("*");
  const regexStr = parts
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("(.)");
  const match = new RegExp(`^${regexStr}$`, "i").exec(word);
  if (!match) return <>{word}</>;

  const segments: { text: string; highlight: boolean }[] = [];
  let pos = 0;
  parts.forEach((part, i) => {
    if (part.length > 0) {
      segments.push({
        text: word.slice(pos, pos + part.length),
        highlight: true,
      });
      pos += part.length;
    }
    if (i < parts.length - 1) {
      segments.push({ text: word.slice(pos, pos + 1), highlight: false });
      pos += 1;
    }
  });

  return (
    <>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <Mark key={i} color="pink">
            {seg.text}
          </Mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}
