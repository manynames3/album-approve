import { resetDemoData } from "../src/server/store";

async function main() {
  const data = await resetDemoData();

  console.log(
    `Seeded ProofAlbum demo: ${data.projects.length} project, ${data.spreads.length} spreads, ${data.comments.length} comments.`,
  );
}

void main();
