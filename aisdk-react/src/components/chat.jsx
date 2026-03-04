import { useEffect, useRef, useState } from "react";

export const ChatTool = () => {
  const [messages, setMessages] = useState([]); // { user, bot }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { user: input, bot: "" }]);
    const userMessage = input;
    setInput("");

    // Determine agent
    const isstream = userMessage.toLowerCase().includes("stream");

    const endpoint = isstream ? "/ai/stream" : "/ai/chat";
    const body = { prompt: userMessage };

    try {
      const res = await fetch(`http://localhost:3003${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (isstream) {
        console.log("res",res)
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const cleaned = text.replace("data:", "").trim();

          if (!cleaned || cleaned === "[DONE]") continue;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].bot += cleaned + " ";
            return updated;
          });
        }
      } else {
        const data = await res.json();
        // Display bot response
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].bot = data.bot;
          return newMsgs;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].bot = "Error fetching response";
        return newMsgs;
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <div className="text-right">
              <span className="inline-block bg-blue-500 text-white p-2 rounded-lg max-w-xs">
                {m.user}
              </span>
            </div>
            <div className="text-left mt-1">
              <span className="inline-block bg-gray-200 p-2 rounded-lg max-w-xs">
                {m.bot}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={
            loading ? "Waiting for response..." : "Type a message..."
          }
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};
