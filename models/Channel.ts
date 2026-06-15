import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  logo: string;
  category: string;
  url: string;
  country: string;
  language: string;
  order: number;
  isActive: boolean;
}

const ChannelSchema = new Schema<IChannel>(
  {
    name:     { type: String, required: true, trim: true },
    logo:     { type: String, default: '' },
    category: { type: String, required: true, default: 'Uncategorized' },
    url:      { type: String, required: true, trim: true },
    country:  { type: String, default: '' },
    language: { type: String, default: '' },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ChannelModel =
  mongoose.models.Channel || mongoose.model<IChannel>('Channel', ChannelSchema);
