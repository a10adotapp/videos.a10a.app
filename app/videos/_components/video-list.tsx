import { Video } from "@/prisma/client/";
import Link from "next/link";

export function VideoList({ videos }: { videos: Video[] }) {
  return (
    <div className="vstack gap-3">
      {videos.map((video) => (
        <div key={video.id} className="card">
          <img
            src={video.imageUrl ?? undefined}
            className="card-img-top"
            alt="image"
          />

          <div className="card-body">
            <Link href={video.url ?? "#"} target="_blank">
              <h5 className="card-title">{video.title}</h5>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
