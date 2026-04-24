"use client";

import { AddWordForm } from "@/app/components/AddWordForm";
import { SearchWords } from "@/app/components/SearchWords";
import type { Word } from "@/app/lib/types";
import { Button, Container, Drawer, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

export default function Home() {
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const [editWord, setEditWord] = useState<Word | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleEditRequest(word: Word) {
    setEditWord(word);
    open();
  }

  function handleDrawerClose() {
    setEditWord(null);
    close();
  }

  function handleFormSuccess() {
    setRefreshKey((k) => k + 1);
    handleDrawerClose();
  }

  return (
    <Container w="100vw" py="xl">
      <Group justify="space-between" mb="lg">
        <Title>Crossies</Title>
        <Button
          variant="light"
          onClick={() => {
            setEditWord(null);
            open();
          }}
          leftSection={<IconPlus size={16} />}
        >
          Add Word
        </Button>
      </Group>

      <SearchWords onEditRequest={handleEditRequest} refreshKey={refreshKey} />

      <Drawer
        position="right"
        opened={drawerOpened}
        onClose={handleDrawerClose}
        withCloseButton={false}
      >
        <AddWordForm
          key={editWord?.id ?? "new"}
          word={editWord ?? undefined}
          onSuccess={handleFormSuccess}
          close={handleDrawerClose}
        />
      </Drawer>
    </Container>
  );
}
