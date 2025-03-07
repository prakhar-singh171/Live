export default function Message({ msg, username }) {
    return (
      <div
        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
          msg.username === username
            ? "bg-blue-600 text-white self-end text-right"
            : "bg-gray-700 text-white self-start text-left"
        }`}
      >
        <strong className="block text-xs opacity-70">
          {msg.username === username ? "You" : msg.username}
        </strong>
        {msg.text}
        <span className="block text-xs text-gray-400 mt-1">{msg.timestamp}</span>
      </div>
    );
  }
  