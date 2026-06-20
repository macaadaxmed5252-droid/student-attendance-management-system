import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: false, // Make optional initially to avoid breaking existing logs if needed, or strictly true if required.
    },
    subject: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Excused', 'Late'],
      required: true,
    },
  },
  { timestamps: true }
);

// One daily attendance state per student per teacher. This allows multiple subjects/teachers per day.
attendanceSchema.index({ student: 1, date: 1, teacher: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export const ensureAttendanceIndexes = async () => {
  const indexes = await Attendance.collection.indexes();
  const staleDailyIndex = indexes.find((index) => {
    const keys = Object.keys(index.key || {});
    return index.unique && keys.length === 2 && index.key.student === 1 && index.key.date === 1;
  });

  if (staleDailyIndex) {
    await Attendance.collection.dropIndex(staleDailyIndex.name);
    console.log(`Dropped stale attendance index: ${staleDailyIndex.name}`);
  }

  await Attendance.syncIndexes();
};

export default Attendance;
