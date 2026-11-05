import { DetailScreen } from "@/components/screens";
export default async function Page({
  params,
}: {
  params: Promise<{ patrimonio: string }>;
}) {
  const { patrimonio } = await params;
  return <DetailScreen patrimony={patrimonio} />;
}
