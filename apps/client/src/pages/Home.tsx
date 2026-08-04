import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success('Created a new room');
  };

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      return;
    }

    navigate(`/editor/${roomId.trim()}`, {
      state: { username: username.trim() },
    });
  };

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-950 text-gray-100 p-4">
      <div className="flex-1 flex items-center justify-center w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl w-full flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center font-bold text-gray-950 text-xl">
              &lt;/&gt;
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-100">Sync Code</h2>
          </div>
          <h4 className="text-sm font-medium text-gray-400 mb-6 text-center">
            Generate new room or paste invitation ROOM ID
          </h4>
          <div className="w-full space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="ROOM ID"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="USERNAME"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />
            <button
              onClick={joinRoom}
              className="w-full py-3 bg-green-500 hover:bg-green-400 text-gray-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/20 text-sm"
            >
              Join
            </button>
            <p className="text-xs text-gray-400 text-center pt-2">
              If you don't have an invite then create &nbsp;
              <a
                onClick={createNewRoom}
                href="#"
                className="text-green-400 hover:text-green-300 underline font-semibold transition-colors"
              >
                new room
              </a>
            </p>
          </div>
        </div>
      </div>
      <footer className="py-4 text-xs text-gray-500">
        Build by &nbsp;
        <a
          href="https://github.com/Mohitur669"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          Mohd Mohitur Rahaman
        </a>
      </footer>
    </div>
  );
};

export default Home;
