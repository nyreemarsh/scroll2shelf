import { MissionFlow } from "@/components/mission/MissionFlow";
import { parseSeed } from "@/lib/simulation/random";

export default async function OverviewPage(props: PageProps<"/">) {
  const { seed } = await props.searchParams;

  return <MissionFlow seed={parseSeed(seed)} />;
}
