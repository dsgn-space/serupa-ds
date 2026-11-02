import { Button, Container, Heading, Stack, Text } from 'serupa-ds';

export const meta = () => [{ title: 'Serupa in React Router' }];

export default function Home() {
  return (
    <Container>
      <Stack gap={4}>
        <Heading level={1}>Serupa in React Router</Heading>
        <Text>Rendered on the server.</Text>
        <Button>Save</Button>
      </Stack>
    </Container>
  );
}
