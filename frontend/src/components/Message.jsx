import { useState } from "react";

const Message = ({ msg, username, updateMessage, deleteMessage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(msg.text);
  const [showSeen, setShowSeen] = useState(false);

  const handleUpdate = () => {
    updateMessage(msg._id, newText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMessage(msg._id);
  };

  return (
    <div
      className={`p-3 rounded-lg max-w-60 text-sm ${
        msg.username === username ? "bg-green-500 text-white self-end text-right" : "bg-black text-white self-start text-left"
      }`}
    >
      <strong className="block text-xs">{msg.username === username ? "You" : msg.username}</strong>
      {isEditing ? (
        <div>
          <input type="text" className="p-1 rounded text-black w-full" value={newText} onChange={(e) => setNewText(e.target.value)} />
          <button onClick={handleUpdate} className="text-green-200 text-xs mt-1 mr-2">Update</button>
          <button onClick={() => setIsEditing(false)} className="text-gray-300 text-xs mt-1">Cancel</button>
        </div>
      ) : (
        <p>{msg.text}</p>
      )}
      <span className="block text-xs text-gray-300 text-right">{msg.timestamp}</span>
      {msg.username === username && !isEditing && (
        <div className="flex justify-end space-x-2 mt-1">
          <button onClick={() => setIsEditing(true)} className="text-yellow-300 text-xs">Edit</button>
          <button onClick={handleDelete} className="text-red-300 text-xs">Delete</button>
        </div>
      )}
      <div className="mt-1">
        <button onClick={() => setShowSeen(!showSeen)} className="text-blue-300 text-xs">
          {showSeen ? "Hide Seen Info" : "Show Seen Info"}
        </button>
      </div>
      {showSeen && <div className="mt-1 text-xs text-gray-400">Seen by: {msg.seenBy && msg.seenBy.length > 0 ? msg.seenBy.join(", ") : "None"}</div>}
    </div>
  );
};

export default Message;
