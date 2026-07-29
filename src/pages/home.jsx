import { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      toast.error("Room ID and username are required");
      return;
    }

    navigate(`/editor/${roomId.trim()}`, {
      state: { username: username.trim() },
    });
  };

  const handleInputEnter = (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="homeBrand">
        <img src="/logo.png" alt="Code Sync" />
        <h1>Code Sync</h1>
        <p>Realtime collaborative code editing</p>
      </div>

      <div className="card homeCard">
        <div className="card-header">
          <h2 className="card-title">Join a room</h2>
          <p className="card-description">
            Paste an invite Room ID or generate a new one to start coding
            together.
          </p>
        </div>
        <div className="card-content homeActions">
          <div className="field">
            <label className="label" htmlFor="roomId">
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              className="input"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="input"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleInputEnter}
            />
          </div>
          <button type="button" className="btn btn-default btn-block" onClick={joinRoom}>
            Join room
          </button>
          <p className="createInfo">
            Don&apos;t have an invite?{" "}
            <button type="button" className="createNewBtn" onClick={createNewRoom}>
              Create new room
            </button>
          </p>
        </div>
      </div>

      <footer className="homeFooter">
        Built by{" "}
        <a
          href="https://github.com/Mohitur669"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mohd Mohitur Rahaman
        </a>
      </footer>
    </div>
  );
};

export default Home;
