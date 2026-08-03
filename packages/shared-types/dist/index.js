"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketActions = void 0;
var SocketActions;
(function (SocketActions) {
    SocketActions["JOIN"] = "join";
    SocketActions["JOINED"] = "joined";
    SocketActions["DISCONNECTED"] = "disconnected";
    SocketActions["LEAVE"] = "leave";
    SocketActions["CODE_CHANGE"] = "code-change";
    SocketActions["SYNC_CODE"] = "sync-code";
    SocketActions["CHAT_SEND"] = "chat-message:send";
    SocketActions["CHAT_BROADCAST"] = "chat-message:broadcast";
    SocketActions["CHAT_HISTORY"] = "chat-history";
})(SocketActions || (exports.SocketActions = SocketActions = {}));
//# sourceMappingURL=index.js.map