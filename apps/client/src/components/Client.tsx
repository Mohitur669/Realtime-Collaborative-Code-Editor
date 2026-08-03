import React from 'react';
import Avatar from 'react-avatar';

interface ClientProps {
  username: string;
}

const Client: React.FC<ClientProps> = ({ username }) => {
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg border border-gray-700">
      <Avatar name={username} size="36" round="8px" />
      <span className="text-sm font-medium text-gray-200 truncate">{username}</span>
    </div>
  );
};

export default Client;
