import { BookmarksTitle } from "@/context/header";

export default function Bookmarks() {
  return (
    <div className="flex items-center gap-6 ">
      {BookmarksTitle.map((title, index) => (
        <p
          className="text-[16px] font-normal dyna-puff text-muted p-2 hover:border-b-2 hover:text-foreground border-primary cursor-pointer"
          key={index}
        >
          {title}
        </p>
      ))}
    </div>
  );
}
