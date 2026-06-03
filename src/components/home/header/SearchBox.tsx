import { Search } from "lucide-react";
import { Kbd } from "../../ui/kbd";

export default function SearchBox() {
  return (
    <button className="w-51 h-8.75 bg-muted-foreground/50 border-[0.5px] border-border px-4 flex items-center rounded-lg justify-between cursor-pointer hover:mb-1 transition-all duration-300">
      <div className=" flex items-center">
        <Search className="w-4.5 h-4.5" />
        <p className="text-lg font-normal dyna-puff text-muted p-2">
          جستجو آگهی
        </p>
      </div>
      <Kbd className="bg-secondary text-muted font-vazir-matn">K⌘</Kbd>
    </button>
  );
}
