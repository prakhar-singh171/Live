import { useChat } from "../hooks/useChat";
import Message from "../components/Message";

export default function ChatApp() {
  const { message, setMessage, messages, messagesEndRef, joined, joinRoom, leaveRoom, sendMessage, updateMessage, deleteMessage } = useChat();

  return (
    <div className="p-6 max-w-md mx-auto">
      {!joined ? (
        <>
          <button className="bg-blue-500 text-white px-4 py-2 mt-2" onClick={joinRoom}>Join Room</button>
        </>
      ) : (
        <>
          <button className="bg-red-500 text-white px-4 py-2 mt-2" onClick={leaveRoom}>Leave Room</button>
          <div className="mt-4 border p-4 max-h-80 overflow-auto flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <Message key={index} msg={msg} username={msg.username} updateMessage={updateMessage} deleteMessage={deleteMessage} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}
    </div>
  );
}
