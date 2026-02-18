import {
  getTodaysCloseFixtures,
  getTodaysOpenFixtures,
} from "@/lib/queries/fixtures";
import NbaOddsBoard from "./components/nbaOddsBoard";

export default async function NbaPage() {
  const openFixtures = await getTodaysOpenFixtures();
  const closeFixtures = await getTodaysCloseFixtures();

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-300 px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">NBA Props</h1>
      </div>
      <NbaOddsBoard fixtures={openFixtures} />
    </main>
  );
}
