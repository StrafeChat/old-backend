import { WebSocket } from "ws";
import User from "../database/models/User";

export default class Client extends WebSocket {

    constructor(public url: string, public user: User | null, timer: NodeJS.Timeout | null) {
        super(url);
    }
}