"use client";

import AddWordForm from "@/app/components/AddWordForm";
import SearchWords from "@/app/components/SearchWords";
import type { Word } from "@/app/lib/types";
import {
  ActionIcon,
  Button,
  Container,
  Drawer,
  Group,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconMoon, IconPlus, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Logo from "./components/Logo";

export default function Home() {
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const [mounted, setMounted] = useState(false);
  const [editWord, setEditWord] = useState<Word | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const isMobile = useMediaQuery("(max-width: 768px)");

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", colorScheme === "dark");
  }, [colorScheme]);

  return (
    <Container w="100vw" py="xl">
      <Group justify="space-between" align="center" mb="lg">
        <Group align="center" gap="4px">
          <Logo />
          <Title>Crossies</Title>
        </Group>
        <Group gap="4px">
          {mounted ? (
            <ActionIcon
              size="lg"
              variant="transparent"
              onClick={() =>
                setColorScheme(
                  computedColorScheme === "light" ? "dark" : "light",
                )
              }
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun size={16} />
              ) : (
                <IconMoon size={16} />
              )}
            </ActionIcon>
          ) : null}
          {isMobile ? (
            <ActionIcon
              size="lg"
              onClick={() => {
                setEditWord(null);
                open();
              }}
            >
              <IconPlus size={16} />
            </ActionIcon>
          ) : (
            <Button
              onClick={() => {
                setEditWord(null);
                open();
              }}
              leftSection={<IconPlus size={16} />}
            >
              Add Word
            </Button>
          )}
        </Group>
      </Group>

      <SearchWords onEditRequest={handleEditRequest} refreshKey={refreshKey} />

      <Drawer
        position="right"
        opened={drawerOpened}
        onClose={handleDrawerClose}
        withCloseButton={false}
        styles={{ content: { background: "var(--background)" } }}
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
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
