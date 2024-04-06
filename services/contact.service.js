"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllContactsService = exports.createContact = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const contact_model_1 = __importDefault(require("../models/contact.model"));
// create project
exports.createContact = (0, catchAsyncError_1.CatchAsyncError)(async (data, res) => {
    const contact = await contact_model_1.default.create(data);
    res.status(201).json({
        success: true,
        contact,
    });
});
// get all contacts
const getAllContactsService = async (res) => {
    const contacts = await contact_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        contacts,
    });
};
exports.getAllContactsService = getAllContactsService;
