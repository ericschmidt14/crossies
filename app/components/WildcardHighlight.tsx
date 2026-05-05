"use client";

import { Mark } from "@mantine/core";

export default function WildcardHighlight({
  word,
  pattern,
  compact = false,
}: {
  word: string;
  pattern: string;
  compact?: boolean;
}) {
  // Split into alternating [literal, wildcard, literal, ...] tokens
  const tokens = pattern.toUpperCase().split(/([*%])/);

  // Literals are escaped; * → (.)  single char, % → (.*) multi char
  const regexStr = tokens
    .map((token, i) =>
      i % 2 === 0
        ? token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        : token === "*"
          ? "(.)"
          : "(.*)",
    )
    .join("");

  const match = new RegExp(`^${regexStr}$`, "i").exec(word);
  if (!match) return <>{word}</>;

  const segments: { text: string; highlight: boolean }[] = [];
  let captureIdx = 1;
  let pos = 0;

  tokens.forEach((token, i) => {
    if (i % 2 === 0) {
      if (token.length > 0) {
        segments.push({ text: word.slice(pos, pos + token.length), highlight: true });
        pos += token.length;
      }
    } else {
      const captured = match[captureIdx++] ?? "";
      if (captured.length > 0) {
        segments.push({ text: captured, highlight: false });
        pos += captured.length;
      }
    }
  });

  return (
    <>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <Mark key={i} color="pink" py={compact ? 0 : undefined}>
            {seg.text}
          </Mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}
