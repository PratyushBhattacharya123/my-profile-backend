import express from "express";
import {
  addReplyToReview,
  addReview,
  deleteProject,
  editProject,
  getAllProjects,
  getAllProjectsLogin,
  uploadProject,
} from "../controllers/project.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controller";

const projectRouter = express.Router();

projectRouter.post(
  "/create-project",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  uploadProject
);

projectRouter.put(
  "/edit-project/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  editProject
);

projectRouter.get("/get-projects", getAllProjects);

projectRouter.put(
  "/add-review/:id",
  updateAccessToken,
  isAuthenticated,
  addReview
);

projectRouter.put(
  "/add-reply",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyToReview
);

projectRouter.get(
  "/get-all-projects",
  updateAccessToken,
  isAuthenticated,
  getAllProjectsLogin
);

projectRouter.delete(
  "/delete-project/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  deleteProject
);

export default projectRouter;
