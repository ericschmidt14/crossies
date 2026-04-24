"use client";

import { Group } from "@mantine/core";
import type { SortColumn, SortDir } from "../lib/types";
import SortIcon from "./SortIcon";

export default function SortableHeader({
  col,
  label,
  sortColumn,
  sortDir,
  onSort,
}: {
  col: SortColumn;
  label: string;
  sortColumn: SortColumn;
  sortDir: SortDir;
  onSort: (col: SortColumn) => void;
}) {
  return (
    <Group
      gap={4}
      wrap="nowrap"
      style={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => onSort(col)}
    >
      {label}
      <SortIcon col={col} sortColumn={sortColumn} sortDir={sortDir} />
    </Group>
  );
}
