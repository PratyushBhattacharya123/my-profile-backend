"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.addReplyToReview = exports.addReview = exports.getAllProjectsLogin = exports.getAllProjects = exports.editProject = exports.uploadProject = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const cloudinary_1 = __importDefault(require("cloudinary"));
const project_service_1 = require("../services/project.service");
const project_model_1 = __importDefault(require("../models/project.model"));
const redis_1 = require("../utils/redis");
// upload project
exports.uploadProject = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.projectThumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "projects",
            });
            data.projectThumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        (0, project_service_1.createProject)(data, res, next);
        // updating redis database too
        const allProjects = await project_model_1.default.find().select("-links");
        await redis_1.redis.set("allProjects", JSON.stringify(allProjects));
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// edit project
exports.editProject = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data?.projectThumbnail;
        const projectId = req.params.id;
        const projectData = (await project_model_1.default.findById(projectId));
        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary_1.default.v2.uploader.destroy(projectData?.projectThumbnail?.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
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
        const project = await project_model_1.default.findByIdAndUpdate(projectId, {
            $set: data,
        }, { new: true });
        // updating redis database too
        const projectDetails = await project_model_1.default.findById(projectId).select("-links");
        await redis_1.redis.set(projectId, JSON.stringify(projectDetails));
        res.status(201).json({
            success: true,
            project,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Get all projects - without login
exports.getAllProjects = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const isCacheExist = await redis_1.redis.get("allProjects");
        if (isCacheExist) {
            const projects = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                projects,
            });
        }
        else {
            const projects = await project_model_1.default.find().select("-links");
            await redis_1.redis.set("allProjects", JSON.stringify(projects));
            res.status(200).json({
                success: true,
                projects,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all projects - with login
exports.getAllProjectsLogin = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, project_service_1.getAllProjectsLoginService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.addReview = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await project_model_1.default.findById(projectId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            comment: review,
            rating,
        };
        project?.reviews.push(reviewData);
        let total = 0;
        project?.reviews.forEach((review) => {
            total += review.rating;
        });
        if (project) {
            project.ratings = total / project.reviews.length;
        }
        await project?.save();
        // Retrieve allProjects data from Redis
        const allProjectsString = await redis_1.redis.get("allProjects");
        if (!allProjectsString) {
            throw new Error("allProjects data not found in Redis");
        }
        const allProjects = JSON.parse(allProjectsString);
        // Find and update the specific project within allProjects
        const updatedAllProjects = allProjects.map((p) => {
            if (p._id.toString() === projectId) {
                // Update the project with the new data
                p.reviews.push(reviewData);
                p.ratings = total / p.reviews.length;
            }
            return p;
        });
        // Set the updated allProjects data back to Redis
        await redis_1.redis.set("allProjects", JSON.stringify(updatedAllProjects), "EX", 604800);
        res.status(200).json({
            success: true,
            project,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { comment, projectId, reviewId } = req.body;
        const project = await project_model_1.default.findById(projectId);
        if (!project) {
            return next(new ErrorHandler_1.default("Project not found!", 404));
        }
        const review = project?.reviews?.find((review) => review._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler_1.default("Review not found!", 404));
        }
        const replyData = {
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
        const allProjectsString = await redis_1.redis.get("allProjects");
        if (!allProjectsString) {
            throw new Error("allProjects data not found in Redis");
        }
        const allProjects = JSON.parse(allProjectsString);
        // Find and update the specific project within allProjects
        const updatedAllProjects = allProjects.map((project) => {
            if (project._id === projectId) {
                project.reviews.map((review) => {
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
        await redis_1.redis.set("allProjects", JSON.stringify(updatedAllProjects), "EX", 604800);
        await redis_1.redis.set(projectId, JSON.stringify(project), "EX", 604800);
        res.status(200).json({
            success: true,
            project,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// delete project -- only for admin
exports.deleteProject = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await project_model_1.default.findById(id);
        if (!project) {
            return next(new ErrorHandler_1.default("Project not found", 404));
        }
        await project.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
