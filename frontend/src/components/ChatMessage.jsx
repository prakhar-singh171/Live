const ChatMessage = ({ message }) => {
  return (
    <div className={`flex ${message.username === "Me" ? "justify-end" : "justify-start"}`}>
      <div className={`p-3 rounded-lg max-w-xs text-sm ${message.username === "Me" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
        <strong>{message.username}</strong>
        <p>{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
