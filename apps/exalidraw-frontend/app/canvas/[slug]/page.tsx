import { Canvas3Room } from "../Canvas3Room";
import { HTTP_URL } from "@repo/backend-common/config";

export default async function Canvas3Page({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }) {
    const resolvedParams = await params;
    const response = await fetch(`${HTTP_URL}/room/${resolvedParams.slug}`);
    const roomId = await response.json();
    return <Canvas3Room roomId={roomId} />;
  }
  