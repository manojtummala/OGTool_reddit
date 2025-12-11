import { Layout } from "lucide-react";
import SectionCard from "./SectionCard";

export default function SliderInput({ postsPerWeek, setPostsPerWeek }) {
  return (
    <SectionCard icon={Layout} title="Posts Per Week">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="1"
          max="13"
          value={postsPerWeek}
          onChange={(e) => setPostsPerWeek(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-lg font-semibold">{postsPerWeek}</span>
      </div>
    </SectionCard>
  );
}