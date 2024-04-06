"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const contact_controllers_1 = require("../controllers/contact.controllers");
const contactRouter = express_1.default.Router();
contactRouter.post("/create-contact", contact_controllers_1.uploadContact);
contactRouter.get("/get-contacts", user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), contact_controllers_1.getAllContacts);
exports.default = contactRouter;
