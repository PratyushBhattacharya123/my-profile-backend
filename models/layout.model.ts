import { Schema, model, Document, Model } from "mongoose";

interface Category extends Document {
  title: string;
}

interface Layout extends Document {
  categories: Category[];
}

const categorySchema = new Schema<Category>({
  title: {
    type: String,
  },
});

const layoutSchema = new Schema<Layout>({
  categories: [categorySchema],
});

const LayoutModal = model<Layout>("Layout", layoutSchema);

export default LayoutModal;
