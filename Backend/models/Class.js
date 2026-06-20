import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      enum: ['Morning', 'Afternoon', 'Evening'],
    },
  },
  { timestamps: true }
);

const Class = mongoose.model('Class', classSchema);
export default Class;
