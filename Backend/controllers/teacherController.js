import Teacher from '../models/Teacher.js';

export const createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    return res.status(201).json(teacher);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({});
    return res.status(200).json(teachers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
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