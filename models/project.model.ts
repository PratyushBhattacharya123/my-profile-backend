import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies?: IComment[];
}

interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

interface ILink extends Document {
  title: string;
  url: string;
}

interface IProject extends Document {
  name: string;
  description: string;
  projectUrl: string;
  projectThumbnail: object;
  links: ILink[];
  tags: string;
  categories: string;
  reviews: IReview[];
  ratings?: number;
}

const reviewSchema = new Schema<IReview>(
  {
    user: Object,
    rating: {
      type: Number,
      default: 0,
    },
    comment: String,
    commentReplies: [Object],
  },
  { timestamps: true }
);

const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    projectUrl: {
      type: String,
      required: true,
    },
    projectThumbnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    links: [linkSchema],
    tags: {
      type: String,
      required: true,
    },
    categories: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    ratings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const ProjectModal: Model<IProject> = mongoose.model("Project", projectSchema);

export default ProjectModal;
