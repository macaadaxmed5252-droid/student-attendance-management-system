import Class from '../models/Class.js';
import Student from '../models/Student.js';

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ className: 1 });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes.', error: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const { className, section } = req.body;
    const newClass = new Class({ className, section });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: 'Error creating class.', error: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { className, section } = req.body;
    const existingClass = await Class.findById(req.params.id);

    if (!existingClass) return res.status(404).json({ message: 'Class not found.' });

    const previousClassName = existingClass.className;
    existingClass.className = className;
    existingClass.section = section;
    await existingClass.save();

    if (previousClassName !== className) {
      await Student.updateMany({ className: previousClassName }, { $set: { className } });
    }

    res.status(200).json(existingClass);
  } catch (error) {
    res.status(400).json({ message: 'Error updating class.', error: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Class not found.' });
    res.status(200).json({ message: 'Class deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class.', error: error.message });
  }
};
