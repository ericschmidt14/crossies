"use client";

import { supabase } from "@/app/lib/supabase";
import type { Word } from "@/app/lib/types";
import {
  Box,
  Button,
  Group,
  Stack,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

export default function AddWordForm({
  word,
  onSuccess,
  close,
}: {
  word?: Word;
  onSuccess: () => void;
  close: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!word;

  const form = useForm({
    initialValues: {
      word: word?.word ?? "",
      description: word?.description ?? "",
      crossword_indices: word?.crossword_indices ?? ([] as number[]),
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
      crossword_indices: values.crossword_indices,
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
      <Stack gap="lg" py="md">
        <Box mx="auto">
          <Image src="/logo.svg" alt="Crossies Logo" width={36} height={36} />
        </Box>
        <TextInput
          size="lg"
          label="Word"
          placeholder="CROSSWORD"
          withAsterisk
          {...form.getInputProps("word")}
        />
        <Textarea
          size="lg"
          label="Description / Clue"
          placeholder="A grid-based word puzzle"
          rows={3}
          withAsterisk
          {...form.getInputProps("description")}
        />
        <TagsInput
          size="lg"
          label="Which crosswords was it used in?"
          description="Type a number and press Enter"
          value={form.values.crossword_indices.map(String)}
          onChange={(vals) =>
            form.setFieldValue(
              "crossword_indices",
              vals
                .map((v) => parseInt(v, 10))
                .filter((n) => !isNaN(n) && n >= 1),
            )
          }
        />
        <Group justify="space-between">
          <Button size="lg" color="gray" variant="transparent" onClick={close}>
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
