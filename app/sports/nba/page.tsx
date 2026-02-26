import {
  getTodaysCloseFixtures,
  getTodaysOpenFixtures,
} from "@/lib/queries/fixtures";
import NbaOddsSpace from "./components/oddsBoard";
export const dynamic = "force-dynamic";
export default async function NbaPage() {
  const openFixtures = await getTodaysOpenFixtures();

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-300 p-2 py-2">
      <NbaOddsSpace fixtures={openFixtures} />
    </main>
  );
}
