import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

export const markAttendance = async (req, res) => {
  try {
    const { student, date, status } = req.body;

    // Verify student exists before logging attendance
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Cannot mark attendance. Student record not found.' });
    }

    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ email: req.user.email }).populate('assignedClasses');
      const assignedClassNames = teacherProfile?.assignedClasses?.map(c => c.className) || [];

      if (!assignedClassNames.includes(studentExists.className)) {
        return res.status(403).json({ message: 'Teachers can only mark attendance for assigned classes.' });
      }
    }

    // Normalize date to UTC midnight (YYYY-MM-DD format) to ensure clean indexing comparisons
    const localizedDate = new Date(date);
    localizedDate.setUTCHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ student, date: localizedDate, teacher: req.user._id });
    if (attendance) {
      attendance.status = status;
      await attendance.save();
      return res.status(200).json(attendance);
    }

    attendance = await Attendance.create({
      student,
      teacher: req.user._id,
      date: localizedDate,
      status,
    });

    return res.status(201).json(attendance);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Attendance for this student, date, and teacher already exists. Please refresh and try again.' });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getAllAttendanceRecords = async (req, res) => {
  try {
    let filter = {};
    if (req.user && req.user.role === 'teacher') {
      filter = { teacher: req.user._id };
    }
    const records = await Attendance.find(filter).populate('student').populate('teacher', 'fullName email');
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAttendanceByStudent = async (req, res) => {
  try {
    const targetStudent = await Student.findById(req.params.studentId);
    if (!targetStudent) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ email: req.user.email });
      if (!studentProfile || studentProfile._id.toString() !== req.params.studentId) {
        return res.status(403).json({ message: 'Students can only view their own attendance records.' });
      }
    }

    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ email: req.user.email }).populate('assignedClasses');
      const assignedClassNames = teacherProfile?.assignedClasses?.map(c => c.className) || [];

      if (!assignedClassNames.includes(targetStudent.className)) {
        return res.status(403).json({ message: 'Teachers can only view attendance for assigned classes.' });
      }
    }

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

export const getMyMetrics = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }
    
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const logs = await Attendance.find({ student: student._id }).populate('teacher', 'email fullName');

    const teacherEmails = [...new Set(logs.map(log => log.teacher?.email).filter(Boolean))];
    const teachers = await Teacher.find({ email: { $in: teacherEmails } }).populate('assignedClasses');
    
    const subjectMap = {};
    teachers.forEach(t => { 
      // Find the class assigned to this teacher that matches the student's className
      const matchedClass = t.assignedClasses.find(c => c.className === student.className);
      if (matchedClass) {
        subjectMap[t.email] = t.academicSpecialty || 'General Tracking';
      }
    });

    const courseMetrics = {};
    logs.forEach(log => {
      const email = log.teacher?.email;
      const subject = email && subjectMap[email] ? subjectMap[email] : 'General Tracking';
      
      if (!courseMetrics[subject]) {
        courseMetrics[subject] = { subject, present: 0, absent: 0, late: 0 };
      }
      
      if (log.status === 'Present') courseMetrics[subject].present++;
      else if (log.status === 'Absent') courseMetrics[subject].absent++;
      else if (log.status === 'Excused' || log.status === 'Late') courseMetrics[subject].late++;
    });

    const payload = {
      studentId: student._id,
      studentCode: student.studentId,
      fullName: student.fullName,
      className: student.className,
      email: student.email,
      overall: {
        total: logs.length,
        present: logs.filter(l => l.status === 'Present').length,
        absent: logs.filter(l => l.status === 'Absent').length,
        late: logs.filter(l => l.status === 'Excused' || l.status === 'Late').length,
      },
      courses: Object.values(courseMetrics),
      recentLogs: logs.slice(-5).reverse().map(l => ({
        _id: l._id,
        date: l.date,
        status: l.status,
        subject: (l.teacher?.email && subjectMap[l.teacher.email]) ? subjectMap[l.teacher.email] : 'General Tracking',
        teacherName: l.teacher?.fullName || 'System Admin'
      }))
    };

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
