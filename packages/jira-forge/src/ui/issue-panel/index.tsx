import ForgeReconciler, {
  Box,
  Heading,
  Inline,
  Lozenge,
  SectionMessage,
  Stack,
  Text,
  useProductContext,
} from "@forge/react";
import { invoke } from "@forge/bridge";
import { useEffect, useState } from "react";

interface PanelBootstrap {
  accountId: string;
  issueKey: string;
  firstTasks: Array<{ id: string; breadcrumbs: string }>;
}

function App() {
  const context = useProductContext();
  const [data, setData] = useState<PanelBootstrap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<PanelBootstrap>("panel.bootstrap")
      .then(setData)
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <SectionMessage appearance="error" title="timr">
        <Text>{error}</Text>
      </SectionMessage>
    );
  }

  if (!data) {
    return <Text>Loading timr…</Text>;
  }

  const issueKey = context?.extension?.issue?.key ?? data.issueKey;

  return (
    <Stack space="space.200">
      <Heading as="h3">timr</Heading>
      <Text>
        Hello, <Lozenge>{data.accountId}</Lozenge> on{" "}
        <Lozenge appearance="inprogress">{issueKey}</Lozenge>.
      </Text>
      <Box>
        <Text>First tasks from timr (sanity check):</Text>
        <Stack space="space.050">
          {data.firstTasks.map((t) => (
            <Inline key={t.id} space="space.100">
              <Lozenge>{t.id.slice(0, 8)}</Lozenge>
              <Text>{t.breadcrumbs}</Text>
            </Inline>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

ForgeReconciler.render(<App />);
