import { getPublicData } from "@/lib/public-data";
import { PublicSite } from "@/components/public/public-site";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getPublicData();
  return <PublicSite data={data} />;
}
