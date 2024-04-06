import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import cloudinary from "cloudinary";
import {
  createProject,
  getAllProjectsLoginService,
} from "../services/project.service";
import ProjectModal from "../models/project.model";
import { redis } from "../utils/redis";

// upload project
export const uploadProject = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.projectThumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "projects",
        });

        data.projectThumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createProject(data, res, next);

      // updating redis database too
      const allProjects = await ProjectModal.find().select("-links");
      await redis.set("allProjects", JSON.stringify(allProjects));
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// edit project
export const editProject = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data?.projectThumbnail;
      const projectId = req.params.id;

      const projectData = (await ProjectModal.findById(projectId)) as any;

      if (thumbnail && !thumbnail.startsWith("https")) {
        await cloudinary.v2.uploader.destroy(
          projectData?.projectThumbnail?.public_id
        );
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "projects",
        });

        data.projectThumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      if (thumbnail.startsWith("https")) {
        data.projectThumbnail = {
          public_id: projectData?.projectThumbnail.public_id,
          url: projectData?.projectThumbnail.url,
        };
      }

      const project = await ProjectModal.findByIdAndUpdate(
        projectId,
        {
          $set: data,
        },
        { new: true }
      );

      // updating redis database too
      const projectDetails = await ProjectModal.findById(projectId).select(
        "-links"
      );
      await redis.set(projectId, JSON.stringify(projectDetails));

      res.status(201).json({
        success: true,
        project,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all projects - without login
export const getAllProjects = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExist = await redis.get("allProjects");
      if (isCacheExist) {
        const projects = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          projects,
        });
      } else {
        const projects = await ProjectModal.find().select("-links");
        await redis.set("allProjects", JSON.stringify(projects));
        res.status(200).json({
          success: true,
          projects,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all projects - with login
export const getAllProjectsLogin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllProjectsLoginService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Add Review in project
interface IReviewData {
  review: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.id;

      const project = await ProjectModal.findById(projectId);
      const { review, rating } = req.body as IReviewData;
      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };

      project?.reviews.push(reviewData);

      let total = 0;

      project?.reviews.forEach((review: any) => {
        total += review.rating;
      });

      if (project) {
        project.ratings = total / project.reviews.length;
      }

      await project?.save();

      // Retrieve allProjects data from Redis
      const allProjectsString = await redis.get("allProjects");
      if (!allProjectsString) {
        throw new Error("allProjects data not found in Redis");
      }

      const allProjects = JSON.parse(allProjectsString);

      // Find and update the specific project within allProjects
      const updatedAllProjects = allProjects.map((p: any) => {
        if (p._id.toString() === projectId) {
          // Update the project with the new data
          p.reviews.push(reviewData);
          p.ratings = total / p.reviews.length;
        }
        return p;
      });

      // Set the updated allProjects data back to Redis
      await redis.set(
        "allProjects",
        JSON.stringify(updatedAllProjects),
        "EX",
        604800
      );

      res.status(200).json({
        success: true,
        project,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Add reply in review
interface IAddReviewData {
  comment: string;
  projectId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, projectId, reviewId } = req.body as IAddReviewData;

      const project = await ProjectModal.findById(projectId);

      if (!project) {
        return next(new ErrorHandler("Project not found!", 404));
      }

      const review = project?.reviews?.find(
        (review) => review._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Review not found!", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);

      await project.save();

      // Retrieve allProjects data from Redis
      const allProjectsString = await redis.get("allProjects");
      if (!allProjectsString) {
        throw new Error("allProjects data not found in Redis");
      }

      const allProjects = JSON.parse(allProjectsString);

      // Find and update the specific project within allProjects
      const updatedAllProjects = allProjects.map((project: any) => {
        if (project._id === projectId) {
          project.reviews.map((review: any) => {
            if (review._id === reviewId) {
              if (!review.commentReplies) {
                review.commentReplies = [];
              }
              review.commentReplies?.push(replyData);
            }
          });
        }
        return project;
      });

      // Set the updated allProjects data back to Redis
      await redis.set(
        "allProjects",
        JSON.stringify(updatedAllProjects),
        "EX",
        604800
      );

      await redis.set(projectId, JSON.stringify(project), "EX", 604800);

      res.status(200).json({
        success: true,
        project,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// delete project -- only for admin
export const deleteProject = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const project = await ProjectModal.findById(id);
      if (!project) {
        return next(new ErrorHandler("Project not found", 404));
      }
      await project.deleteOne({ id });
      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
