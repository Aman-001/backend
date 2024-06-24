import dotenv from "dotenv"
import DB_CONNECT from "./db/db.js";

dotenv.config({
    path : './env'
})

DB_CONNECT()
.then((app) => {
    app.listen(process.env.PORT || 8000  , () => {
        console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}`);
    })
}) 
.catch((error) => {
   console.log("DB CONNECTION FAILED!" , error);
})