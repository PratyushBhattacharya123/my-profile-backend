import { Response } from "express";
import ProjectModal from "../models/project.model";

import { CatchAsyncError } from "../middleware/catchAsyncError";

// create project
export const createProject = CatchAsyncError(
  async (data: any, res: Response) => {
    const project = await ProjectModal.create(data);
    res.status(201).json({
      success: true,
      project,
    });
  }
);

// get all projects
export const getAllProjectsLoginService = async (res: Response) => {
  const projects = await ProjectModal.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    projects,
  });
};
