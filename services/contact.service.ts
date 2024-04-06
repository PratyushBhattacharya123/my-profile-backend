import { CatchAsyncError } from "../middleware/catchAsyncError";
import ContactModal from "../models/contact.model";

import { Response } from "express";

// create project
export const createContact = CatchAsyncError(
  async (data: any, res: Response) => {
    const contact = await ContactModal.create(data);
    res.status(201).json({
      success: true,
      contact,
    });
  }
);

// get all contacts
export const getAllContactsService = async (res: Response) => {
  const contacts = await ContactModal.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    contacts,
  });
};
