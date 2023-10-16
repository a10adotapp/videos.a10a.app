import { listVideo } from "@/actions/list-video";
import { Pagination } from "@/components/pagination";
import { redirect } from "next/navigation";
import { VideoList } from "./_components/video-list";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    page: string;
  };
}) {
  const page = Number.parseInt(searchParams.page);

  if (Number.isNaN(page) || page < 0) {
    redirect(
      `?${new URLSearchParams({
        ...searchParams,
        page: "1",
      }).toString()}`,
    );
  }

  const listVideoResult = await listVideo({ page });

  return (
    <div className="vstack gap-4">
      <VideoList videos={listVideoResult.videos} />

      <Pagination
        currentPage={listVideoResult.currentPage}
        totalPage={listVideoResult.totalPage}
      />
    </div>
  );
}
