"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayout = exports.editLayout = exports.createLayout = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const layout_model_1 = __importDefault(require("../models/layout.model"));
// create layout
exports.createLayout = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { categories } = req.body;
        const catergoryItems = await Promise.all(categories.map(async (category) => {
            return {
                title: category.title,
            };
        }));
        await layout_model_1.default.create({
            categories: catergoryItems,
        });
        res.status(200).json({
            success: true,
            message: "Layout created successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// edit layout
exports.editLayout = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { categories } = req.body;
        const catergoryItems = await Promise.all(categories.map(async (category) => {
            return {
                title: category.title,
            };
        }));
        await layout_model_1.default.findByIdAndUpdate({
            categories: catergoryItems,
        });
        res.status(200).json({
            success: true,
            message: "Layout updated successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get layout
exports.getLayout = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const layout = await layout_model_1.default.find();
        res.status(201).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
