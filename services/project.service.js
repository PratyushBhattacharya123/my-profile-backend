"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjectsLoginService = exports.createProject = void 0;
const project_model_1 = __importDefault(require("../models/project.model"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
// create project
exports.createProject = (0, catchAsyncError_1.CatchAsyncError)(async (data, res) => {
    const project = await project_model_1.default.create(data);
    res.status(201).json({
        success: true,
        project,
    });
});
// get all projects
const getAllProjectsLoginService = async (res) => {
    const projects = await project_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        projects,
    });
};
exports.getAllProjectsLoginService = getAllProjectsLoginService;
