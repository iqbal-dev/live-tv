import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon: string;
  order: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:  { type: String, required: true, unique: true, trim: true },
    icon:  { type: String, default: '📺' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CategoryModel =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
