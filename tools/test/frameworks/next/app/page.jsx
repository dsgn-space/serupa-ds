// A Server Component: Container, Stack, Heading and Text render on the server, and Button, a client component
// ("use client" in the package), is imported straight into it, as the README says works.
import { Button, Container, Heading, Stack, Text } from 'serupa-ds';

export default function Page() {
  return (
    <Container>
      <Stack gap={4}>
        <Heading level={1}>Serupa in Next.js</Heading>
        <Text>Rendered on the server.</Text>
        <Button>Save</Button>
      </Stack>
    </Container>
  );
}
