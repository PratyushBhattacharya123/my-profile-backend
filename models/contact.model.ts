import mongoose, { Document, Model, Schema } from "mongoose";

interface IContact extends Document {
  name: string;
  email: string;
  message: string;
}

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name field cannot be empty"],
    },
    email: {
      type: String,
      required: [true, "Email field cannot be empty"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Please enter a valid Email address",
      },
    },
    message: {
      type: String,
      required: [true, "Message field cannot be empty"],
    },
  },
  { timestamps: true }
);

const ContactModal: Model<IContact> = mongoose.model("Message", contactSchema);

export default ContactModal;
