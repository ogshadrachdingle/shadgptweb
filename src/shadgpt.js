import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./index.css";

export default function ShadGPT() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "You are ShadGPT, a witty chatbot that replies in a thick Yorkshire or Derbyshire dialect. Adjust the dialect based on the user’s selected region.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialect, setDialect] = useState("Yorkshire");
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const systemPrompt = {
      role: "system",
      content: `You are ShadGPT, a witty chatbot that replies in a thick ${dialect} dialect. Be natural and throw in slang when it fits.`,
    };

    const newMessages = [systemPrompt, ...messages.filter(m => m.role !== "system"), { role: "user", content: input }];
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: newMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.choices[0].message;
      setMessages([...messages, { role: "user", content: input }, reply]);
      new Audio("/blip.mp3").play();
    } catch (error) {
      setMessages([
        ...messages,
        {
          role: "assistant",
          content: "Ey up, summat went wrong there. Try agen later, love.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-100 dark:bg-black">
      <header className="p-4 text-center shadow bg-white dark:bg-zinc-900">
        <img src="banner.png" alt="ShadGPT Banner" className="mx-auto mb-2 max-h-20" />
        <select
          value={dialect}
          onChange={(e) => setDialect(e.target.value)}
          className="mt-2 p-1 rounded border dark:bg-zinc-800 dark:text-white"
        >
          <option>Yorkshire</option>
          <option>Derbyshire</option>
        </select>
      </header>

      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter((m) => m.role !== "system").map((m, idx) => (
          <div
            key={idx}
            className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={
                "max-w-xs px-4 py-2 rounded-xl shadow text-sm " +
                (m.role === "user"
                  ? "bg-black text-white"
                  : "bg-white text-black dark:bg-zinc-800 dark:text-white")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl text-sm text-gray-500 animate-pulse">
              Typing…
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 dark:bg-zinc-800 dark:text-white"
          placeholder="Ask ShadGPT owt…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
