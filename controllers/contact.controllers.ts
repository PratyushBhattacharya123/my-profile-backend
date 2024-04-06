import { CatchAsyncError } from "../middleware/catchAsyncError";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import {
  createContact,
  getAllContactsService,
} from "../services/contact.service";

// upload contact
export const uploadContact = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      createContact(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all contact -- only for admin
export const getAllContacts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllContactsService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
