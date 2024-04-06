import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controller";
import {
  getAllContacts,
  uploadContact,
} from "../controllers/contact.controllers";
const contactRouter = express.Router();

contactRouter.post("/create-contact", uploadContact);

contactRouter.get(
  "/get-contacts",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  getAllContacts
);

export default contactRouter;
