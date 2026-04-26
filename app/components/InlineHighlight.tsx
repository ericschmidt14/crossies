"use client";

import { Mark } from "@mantine/core";

export default function InlineHighlight({
  word,
  term,
}: {
  word: string;
  term: string;
}) {
  if (!term) return <>{word}</>;
  const idx = word.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return <>{word}</>;
  return (
    <>
      {word.slice(0, idx)}
      <Mark color="pink" py={0}>
        {word.slice(idx, idx + term.length)}
      </Mark>
      {word.slice(idx + term.length)}
    </>
  );
}
