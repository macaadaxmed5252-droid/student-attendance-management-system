import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const createTeacher = async (req, res) => {
  try {
    const { teacherId, fullName, academicSpecialty, assignedClasses, email, phone, password } = req.body;

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
      role: 'teacher',
    });

    const teacher = await Teacher.create({ teacherId, fullName, academicSpecialty, assignedClasses, email, phone });
    return res.status(201).json(teacher);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({}).populate('assignedClasses');
    return res.status(200).json(teachers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.user.email }).populate('assignedClasses');
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
    return res.status(200).json(teacher);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('assignedClasses');
    if (!teacher) return res.status(404).json({ message: 'Teacher target trace returns empty state' });
    return res.status(200).json(teacher);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!teacher) return res.status(404).json({ message: 'Teacher documentation index key update map missing' });
    return res.status(200).json(teacher);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher target deletion profile entity tracking error' });
    return res.status(200).json({ message: 'Teacher profile database record successfully purged' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
