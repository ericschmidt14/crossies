"use client";

import { supabase } from "@/app/lib/supabase";
import type { SortColumn, SortDir, Word } from "@/app/lib/types";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Highlight,
  Loader,
  Popover,
  SegmentedControl,
  Slider,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import SortableHeader from "./SortableHeader";
import WildcardHighlight from "./WildcardHighlight";

export default function SearchWords({
  onEditRequest,
  refreshKey,
}: {
  onEditRequest: (word: Word) => void;
  refreshKey: number;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [showAll, setShowAll] = useState(false);
  const [results, setResults] = useState<Word[]>([]);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unused">("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>("word");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [lengthFilter, setLengthFilter] = useState(0);
  const [openedDeleteId, setOpenedDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const hasQuery = debouncedQuery.trim().length > 0 || showAll;
  const queryKey = `${debouncedQuery.trim()}|${showAll}|${filter}|${refreshKey}`;
  const loading = hasQuery && fetchedKey !== queryKey;

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed && !showAll) return;

    const currentKey = `${trimmed}|${showAll}|${filter}|${refreshKey}`;
    const isIndex = !!trimmed && /^\d+$/.test(trimmed);

    let cancelled = false;

    const base = supabase.from("words").select("*");
    const matched = !trimmed
      ? base
      : isIndex
        ? base.contains("crossword_indices", [parseInt(trimmed, 10)])
        : base.ilike(
            "word",
            trimmed.includes("*") || trimmed.includes("%")
              ? trimmed.replace(/\*/g, "_")
              : `%${trimmed}%`,
          );
    const filtered =
      filter === "unused"
        ? matched.filter("crossword_indices", "eq", "{}")
        : matched;

    filtered.then(({ data, error: err }) => {
      if (cancelled) return;
      setFetchedKey(currentKey);
      if (err) {
        setError(err.message);
      } else {
        setError(null);
        setResults(data ?? []);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, showAll, filter, refreshKey]);

  function toggleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir("asc");
    }
  }

  const trimmed = debouncedQuery.trim();
  const isIndexSearch = /^\d+$/.test(trimmed);
  const hasWildcard = trimmed.includes("*");
  const highlightTerm =
    trimmed && !isIndexSearch && !hasWildcard ? trimmed : "";

  const sorted = [...results].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortColumn) {
      case "word":
        return dir * a.word.localeCompare(b.word);
      case "description":
        return dir * a.description.localeCompare(b.description);
      case "length":
        return dir * (a.word.length - b.word.length);
      case "crossword_indices": {
        const ai = a.crossword_indices[0] ?? Infinity;
        const bi = b.crossword_indices[0] ?? Infinity;
        return dir * (ai - bi);
      }
      default:
        return 0;
    }
  });

  const displayed =
    lengthFilter > 0
      ? sorted.filter((r) => r.word.length === lengthFilter)
      : sorted;

  function handleQueryChange(value: string) {
    setQuery(value);
    if (showAll) setShowAll(false);
  }

  function handleClear() {
    setQuery("");
    setShowAll(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    const { error: err } = await supabase.from("words").delete().eq("id", id);
    setDeleting(false);
    if (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: err.message,
      });
    } else {
      setResults((prev) => prev.filter((r) => r.id !== id));
      setOpenedDeleteId(null);
    }
  }

  return (
    <Stack>
      <TextInput
        size="lg"
        placeholder="Enter w**d or number ..."
        value={query}
        onChange={(e) => handleQueryChange(e.currentTarget.value)}
        rightSection={
          loading ? (
            <Loader size={16} color="gray" />
          ) : query.length > 0 || showAll ? (
            <ActionIcon
              color="gray"
              variant="transparent"
              onClick={handleClear}
              aria-label="Clear"
            >
              <IconX size={16} />
            </ActionIcon>
          ) : null
        }
        autoComplete="off"
      />
      <Slider
        min={0}
        max={15}
        step={1}
        value={lengthFilter}
        onChange={setLengthFilter}
        label={(v) => (v === 0 ? "Any length" : `${v} letters`)}
        marks={[
          { value: 0, label: "" },
          { value: 5, label: "5" },
          { value: 10, label: "10" },
          { value: 15, label: "15" },
        ]}
        mb="lg"
      />

      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      {!hasQuery && !loading && !error && (
        <Button
          variant="transparent"
          color="dark"
          leftSection={<IconSearch size={16} />}
          onClick={() => setShowAll(true)}
        >
          Show all words
        </Button>
      )}

      {hasQuery && !loading && !error && results.length === 0 && (
        <Text c="dimmed" ta="center">
          No words found.
        </Text>
      )}

      {hasQuery && results.length > 0 && (
        <>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {displayed.length} result{displayed.length > 1 ? "s" : ""}
            </Text>
            <SegmentedControl
              value={filter}
              onChange={(v) => setFilter(v as "all" | "unused")}
              data={[
                { label: "All", value: "all" },
                { label: "Unused", value: "unused" },
              ]}
            />
          </Group>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {(
                  [
                    { col: "word", label: "Word" },
                    {
                      col: "description",
                      label: "Description",
                      visibleFrom: "sm",
                    },
                    {
                      col: "crossword_indices",
                      label: "Used",
                    },
                    { col: "length", label: "Length", visibleFrom: "sm" },
                  ] as {
                    col: SortColumn;
                    label: string;
                    visibleFrom?: string;
                  }[]
                ).map(({ col, label, visibleFrom }) => (
                  <Table.Th key={col} visibleFrom={visibleFrom}>
                    <SortableHeader
                      col={col}
                      label={label}
                      sortColumn={sortColumn}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                  </Table.Th>
                ))}
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {displayed.map((row) => (
                <Table.Tr
                  key={row.id}
                  onClick={() => onEditRequest(row)}
                  className="cursor-pointer"
                >
                  <Table.Td>
                    {hasWildcard ? (
                      <WildcardHighlight word={row.word} pattern={trimmed} />
                    ) : (
                      <Highlight highlight={highlightTerm} color="pink">
                        {row.word}
                      </Highlight>
                    )}
                  </Table.Td>
                  <Table.Td visibleFrom="sm">{row.description}</Table.Td>
                  <Table.Td>
                    {row.crossword_indices.length > 0
                      ? row.crossword_indices.join(", ")
                      : null}
                  </Table.Td>
                  <Table.Td visibleFrom="sm">{row.word.length}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                      <Popover
                        opened={openedDeleteId === row.id}
                        onClose={() => setOpenedDeleteId(null)}
                        withArrow
                        position="left"
                      >
                        <Popover.Target>
                          <ActionIcon
                            variant="subtle"
                            aria-label="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenedDeleteId(row.id);
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Stack gap="xs">
                            <Text size="sm">
                              Delete &ldquo;{row.word}&rdquo;?
                            </Text>
                            <Group gap="xs">
                              <Button
                                size="xs"
                                loading={deleting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(row.id);
                                }}
                                leftSection={<IconTrash size={12} />}
                              >
                                Delete
                              </Button>
                              <Button
                                size="xs"
                                color="dark"
                                variant="subtle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenedDeleteId(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </Group>
                          </Stack>
                        </Popover.Dropdown>
                      </Popover>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}
    </Stack>
  );
}
