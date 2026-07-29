import Avatar from "react-avatar";

const Client = ({ username }) => {
  return (
    <div className="client" title={username}>
      <Avatar name={username || "?"} size={44} round="10px" />
      <span className="username">{username}</span>
    </div>
  );
};

export default Client;
