"use client";

import { supabase } from "@/app/lib/supabase";
import type { Word } from "@/app/lib/types";
import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  word?: Word;
  onSuccess: () => void;
  close: () => void;
};

export function AddWordForm({ word, onSuccess, close }: Props) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!word;

  const form = useForm({
    initialValues: {
      word: word?.word ?? "",
      description: word?.description ?? "",
      crossword_index: (word?.crossword_index ?? "") as number | "",
    },
    validate: {
      word: (v) => (v.trim() ? null : "Word is required"),
      description: (v) => (v.trim() ? null : "Description is required"),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    const payload = {
      word: values.word.trim().toUpperCase(),
      description: values.description.trim(),
      crossword_index:
        values.crossword_index === "" ? null : values.crossword_index,
    };

    const { error } = isEditing
      ? await supabase.from("words").update(payload).eq("id", word.id)
      : await supabase.from("words").insert(payload);

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
        title: isEditing ? "Updated" : "Saved",
        message: `"${payload.word}" ${isEditing ? "updated" : "added"} successfully.`,
      });
      if (!isEditing) form.reset();
      onSuccess();
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          size="lg"
          label="Word"
          placeholder="CROSSWORD"
          withAsterisk
          {...form.getInputProps("word")}
        />
        <TextInput
          size="lg"
          label="Description / Clue"
          placeholder="A grid-based word puzzle"
          withAsterisk
          {...form.getInputProps("description")}
        />
        <NumberInput
          size="lg"
          label="Crossword index"
          placeholder="1"
          min={1}
          {...form.getInputProps("crossword_index")}
        />
        <Group justify="space-between">
          <Button size="lg" color="dark" variant="transparent" onClick={close}>
            Cancel
          </Button>
          <Button
            size="lg"
            type="submit"
            loading={loading}
            leftSection={
              isEditing ? <IconCheck size={16} /> : <IconPlus size={16} />
            }
          >
            {isEditing ? "Save changes" : "Add word"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
