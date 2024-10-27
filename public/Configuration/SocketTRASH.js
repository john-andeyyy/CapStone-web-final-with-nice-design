import { io } from 'socket.io-client';

const Baseurl = import.meta.env.VITE_BASEURL;
const Socket = io(Baseurl, { withCredentials: true });

export default Socket;
