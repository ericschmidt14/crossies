"use client";

import { supabase } from "@/app/lib/supabase";
import type { Word } from "@/app/lib/types";
import { Alert, Button, Stack, Table, Text, TextInput } from "@mantine/core";
import { useState } from "react";

export function SearchWords() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Word[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    const pattern = trimmed.includes("*")
      ? trimmed.replace(/\*/g, "_")
      : `%${trimmed}%`;

    const { data, error: err } = await supabase
      .from("words")
      .select("*")
      .ilike("word", pattern)
      .order("word");

    setLoading(false);
    setSearched(true);

    if (err) {
      setError(err.message);
    } else {
      setResults(data ?? []);
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
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <Button onClick={handleSearch} loading={loading} w="fit-content">
        Search
      </Button>

      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      {searched && !error && results.length === 0 && (
        <Text c="dimmed">No words found.</Text>
      )}

      {results.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Word</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Crossword #</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>{row.word}</Table.Td>
                <Table.Td>{row.description}</Table.Td>
                <Table.Td>{row.crossword_index ?? "—"}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
