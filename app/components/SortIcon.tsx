"use client";

import { IconChevronUp, IconSelector } from "@tabler/icons-react";
import type { SortColumn, SortDir } from "../lib/types";

export default function SortIcon({
  col,
  sortColumn,
  sortDir,
}: {
  col: SortColumn;
  sortColumn: SortColumn;
  sortDir: SortDir;
}) {
  if (sortColumn !== col)
    return <IconSelector size={14} style={{ opacity: 0.35 }} />;
  return (
    <IconChevronUp
      size={14}
      className={`${sortDir === "asc" ? "rotate-0" : "rotate-180"} transition-all duration-300`}
    />
  );
}
