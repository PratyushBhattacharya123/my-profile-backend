"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const projectRouter = express_1.default.Router();
projectRouter.post("/create-project", user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), project_controller_1.uploadProject);
projectRouter.put("/edit-project/:id", user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), project_controller_1.editProject);
projectRouter.get("/get-projects", project_controller_1.getAllProjects);
projectRouter.put("/add-review/:id", user_controller_1.updateAccessToken, auth_1.isAuthenticated, project_controller_1.addReview);
projectRouter.put("/add-reply", user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), project_controller_1.addReplyToReview);
projectRouter.get("/get-all-projects", user_controller_1.updateAccessToken, auth_1.isAuthenticated, project_controller_1.getAllProjectsLogin);
projectRouter.delete("/delete-project/:id", user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), project_controller_1.deleteProject);
exports.default = projectRouter;
