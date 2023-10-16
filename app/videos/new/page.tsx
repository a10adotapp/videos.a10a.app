import { VideoForm } from "./_components/video-form";

export default async function Page() {
  return (
    <div className="my-4 p-4 shadow">
      <VideoForm callbackUrl="/videos/new" />
    </div>
  );
}
