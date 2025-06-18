import { Canvas3Room } from "../Canvas3Room";
import { HTTP_URL } from "@repo/backend-common/config";
import axios from "axios";

export default async function Canvas3Page({
    params
}: {
    params: {
        slug: string
    }
}) {
    const slug = (await params).slug;
    const response = await axios.get(`${HTTP_URL}/room/${slug}`);
    // response.data should be the roomId
    return <Canvas3Room roomId={response.data} />;
} 