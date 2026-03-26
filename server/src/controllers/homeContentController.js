import HomeContent from "../models/HomeContent.js";

/**
 * GET home page content (Public)
 */
export const getHomeContent = async (req, res) => {
  try {
    let content = await HomeContent.findOne();

    // Create default if not exists
    if (!content) {
      content = await HomeContent.create({
        aboutAtria:
          "Atria Institute of Technology is committed to excellence in technical education, innovation, and research.",
        departmentScopes: [],
      });
    }

    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load home content" });
  }
};

/**
 * UPDATE home page content (Admin only)
 */
export const updateHomeContent = async (req, res) => {
  try {
    const updated = await HomeContent.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update home content" });
  }
};
