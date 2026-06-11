import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

export const markAttendance = async (req, res) => {
  try {
    const { student, date, status } = req.body;

    // Verify student exists before logging attendance
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Cannot mark attendance. Student record not found.' });
    }

    // Normalize date to UTC midnight (YYYY-MM-DD format) to ensure clean indexing comparisons
    const localizedDate = new Date(date);
    localizedDate.setUTCHours(0, 0, 0, 0);

    const existingRecord = await Attendance.findOne({ student, date: localizedDate });
    if (existingRecord) {
      return res.status(400).json({ 
        message: 'Attendance processing block: A registry tracking log matches this student on this date context already.' 
      });
    }

    const attendance = await Attendance.create({
      student,
      teacher: req.user._id,
      date: localizedDate,
      status,
    });

    return res.status(201).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllAttendanceRecords = async (req, res) => {
  try {
    const records = await Attendance.find({}).populate('student').populate('teacher', 'fullName email');
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAttendanceByStudent = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId }).populate('student').populate('teacher', 'fullName email');
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { status, date } = req.body;
    const updatePayload = {};
    
    if (status) updatePayload.status = status;
    if (date) {
      const localizedDate = new Date(date);
      localizedDate.setUTCHours(0, 0, 0, 0);
      updatePayload.date = localizedDate;
    }

    const record = await Attendance.findByIdAndUpdate(req.params.id, updatePayload, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: 'Target logging transaction attendance event lookup failed' });
    
    return res.status(200).json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Target entry monitoring attendance transaction record drop failed' });
    return res.status(200).json({ message: 'Attendance tracking ledger segment clear operation successful' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};