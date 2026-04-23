"use client";

import { supabase } from "@/app/lib/supabase";
import type { Word } from "@/app/lib/types";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Popover,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type Props = {
  onEditRequest: (word: Word) => void;
  refreshKey: number;
};

export function SearchWords({ onEditRequest, refreshKey }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [results, setResults] = useState<Word[]>([]);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openedDeleteId, setOpenedDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const hasQuery = debouncedQuery.trim().length > 0;
  const queryKey = `${debouncedQuery.trim()}-${refreshKey}`;
  const loading = hasQuery && fetchedKey !== queryKey;

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return;

    const currentKey = `${trimmed}-${refreshKey}`;
    const pattern = trimmed.includes("*")
      ? trimmed.replace(/\*/g, "_")
      : `%${trimmed}%`;

    let cancelled = false;

    supabase
      .from("words")
      .select("*")
      .ilike("word", pattern)
      .order("word")
      .then(({ data, error: err }) => {
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
  }, [debouncedQuery, refreshKey]);

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
        label="Search words"
        description="Use * as a single-character wildcard, e.g. *o*e matches HOME, LOVE, etc."
        placeholder="*O*E"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        rightSection={
          loading ? (
            <Text size="xs" c="dimmed">
              …
            </Text>
          ) : null
        }
      />

      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      {hasQuery && !loading && !error && results.length === 0 && (
        <Text c="dimmed">No words found.</Text>
      )}

      {hasQuery && results.length > 0 && (
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Word</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Crossword #</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>{row.word}</Table.Td>
                <Table.Td>{row.description}</Table.Td>
                <Table.Td>{row.crossword_index ?? "—"}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end" wrap="nowrap">
                    <ActionIcon
                      color="dark"
                      variant="subtle"
                      aria-label="Edit"
                      onClick={() => onEditRequest(row)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
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
                          onClick={() => setOpenedDeleteId(row.id)}
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
                              onClick={() => handleDelete(row.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              size="xs"
                              color="dark"
                              variant="subtle"
                              onClick={() => setOpenedDeleteId(null)}
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
      )}
    </Stack>
  );
}
