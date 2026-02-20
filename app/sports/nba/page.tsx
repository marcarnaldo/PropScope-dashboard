import {
  getTodaysCloseFixtures,
  getTodaysOpenFixtures,
} from "@/lib/queries/fixtures";
import NbaOddsBoard from "./components/oddsBoard";

export default async function NbaPage() {
  const openFixtures = await getTodaysOpenFixtures();
  console.log("open fixtures from db:", openFixtures);
  const closeFixtures = await getTodaysCloseFixtures();

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-300 px-6 py-8">
      <NbaOddsBoard fixtures={openFixtures} />
    </main>
  );
}
