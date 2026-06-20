import Student from '../models/Student.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import bcrypt from 'bcryptjs';

export const createStudent = async (req, res) => {
  try {
    const { studentId, fullName, className, email, phone, password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required to establish user identity' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
    });

    const student = await Student.create({ studentId, fullName, className, email, phone });
    return res.status(201).json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    let filter = {};
    if (req.user && req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ email: req.user.email }).populate('assignedClasses');
      if (teacherProfile && teacherProfile.assignedClasses.length > 0) {
        const classNames = teacherProfile.assignedClasses.map(c => c.className);
        filter = { className: { $in: classNames } };
      } else {
        // Teacher has no assigned classes, return empty array
        return res.status(200).json([]);
      }
    }
    const students = await Student.find(filter);
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student record index match not discovered' });

    if (req.user?.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ email: req.user.email }).populate('assignedClasses');
      const assignedClassNames = teacherProfile?.assignedClasses?.map(c => c.className) || [];

      if (!assignedClassNames.includes(student.className)) {
        return res.status(403).json({ message: 'Teachers can only view students assigned to their classes.' });
      }
    }

    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Student verification mapping tracking context failed' });
    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student records destruction processing point missed' });
    return res.status(200).json({ message: 'Student database entry successfully dropped' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
