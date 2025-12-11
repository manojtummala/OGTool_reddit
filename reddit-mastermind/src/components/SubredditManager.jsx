import { Hash, X } from "lucide-react";
import SectionCard from "./SectionCard";
import { useState } from "react";

export default function SubredditManager({ subreddits, setSubreddits }) {
  const [input, setInput] = useState("");

  const addSubreddit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSubreddits([...subreddits, input.trim()]);
    setInput("");
  };

  const removeSubreddit = (name) => {
    setSubreddits(subreddits.filter((s) => s !== name));
  };

  return (
    <SectionCard icon={Hash} title="Subreddits">
      <div className="flex flex-wrap gap-2 mb-4">
        {subreddits.map((sub) => (
          <div
            key={sub}
            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
          >
            <span>r/{sub}</span>
            <button onClick={() => removeSubreddit(sub)}>
              <X className="w-4 h-4 text-blue-800" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addSubreddit}>
        <input
          className="w-full border rounded-md px-3 py-2"
          placeholder="Add subreddit..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </SectionCard>
  );
}