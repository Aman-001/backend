import dotenv from "dotenv"
import DB_CONNECT from "./db/db.js";

dotenv.config({
    path : './env'
})

DB_CONNECT()