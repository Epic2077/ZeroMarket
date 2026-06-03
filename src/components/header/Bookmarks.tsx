import { BookmarksTitle } from "@/context/Header";

export default function Bookmarks() {
  return (
    <div className="flex items-center gap-6 ">
      {BookmarksTitle.map((title, index) => (
        <p className="text-lg font-normal dyna-puff text-muted p-2" key={index}>
          {title}
        </p>
      ))}
    </div>
  );
}
