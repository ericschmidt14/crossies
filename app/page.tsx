"use client";

import { AddWordForm } from "@/app/components/AddWordForm";
import { SearchWords } from "@/app/components/SearchWords";
import { Button, Container, Drawer, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function Home() {
  const [drawerOpened, { open, close }] = useDisclosure(false);

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="lg">
        <Title>Crossies</Title>
        <Button variant="light" onClick={open}>
          Add Word
        </Button>
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={close}
        title="Add Word"
        position="right"
      >
        <AddWordForm onSuccess={close} />
      </Drawer>

      <SearchWords />
    </Container>
  );
}
