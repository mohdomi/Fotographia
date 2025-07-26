import Project from "../models/project.schema.js";

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().lean();
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};

export {
    getAllProjects
}
