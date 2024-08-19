import chatSocket from "./chat.socket";
import friendSocket from "./friend.socket";
import authSocket from "./auth.socket";

const openSocket = () => {
    chatSocket();
    friendSocket();
    authSocket();
}

export default openSocket;