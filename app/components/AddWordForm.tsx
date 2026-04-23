"use client";

import { supabase } from "@/app/lib/supabase";
import { Button, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export function AddWordForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      word: "",
      description: "",
      crossword_index: "" as number | "",
    },
    validate: {
      word: (v) => (v.trim() ? null : "Word is required"),
      description: (v) => (v.trim() ? null : "Description is required"),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    const { error } = await supabase.from("words").insert({
      word: values.word.trim().toUpperCase(),
      description: values.description.trim(),
      crossword_index:
        values.crossword_index === "" ? null : values.crossword_index,
    });
    setLoading(false);

    if (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: error.message,
      });
    } else {
      notifications.show({
        color: "green",
        title: "Saved",
        message: `"${values.word.toUpperCase()}" added successfully.`,
      });
      form.reset();
      onSuccess();
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Word"
          placeholder="CROSSWORD"
          {...form.getInputProps("word")}
        />
        <TextInput
          label="Description / Clue"
          placeholder="A grid-based word puzzle"
          {...form.getInputProps("description")}
        />
        <NumberInput
          label="Crossword index"
          description="Which crossword was this word used in? (optional)"
          placeholder="1"
          min={1}
          {...form.getInputProps("crossword_index")}
        />
        <Button type="submit" loading={loading} w="fit-content">
          Add word
        </Button>
      </Stack>
    </form>
  );
}
