import { Router } from "express";
import { registerUser } from '../controllers/user.controllers.js'

const UserRouter = Router()
Router.route("/register").post(registerUser)


export {UserRouter}