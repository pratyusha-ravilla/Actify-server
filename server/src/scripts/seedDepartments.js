import mongoose from "mongoose";
import Department from "../models/Department.js";

await mongoose.connect("mongodb://localhost:27017/actirepo");

await Department.deleteMany();

await Department.insertMany([
  {
    name: "Computer Science & Engineering",
    shortCode: "CSE",
    description: "Core computing and software engineering",
    activityScopes: [
      "Workshops",
      "Hackathons",
      "Coding Contests",
      "Expert Talks",
      "Student Projects"
    ]
  },
  {
    name: "Artificial Intelligence & Machine Learning",
    shortCode: "AIML",
    description: "AI, ML and Data Science focus",
    activityScopes: [
      "AI Bootcamps",
      "ML Workshops",
      "Industry Webinars",
      "Research Activities"
    ]
  },
  {
    name: "Electronics & Communication Engineering",
    shortCode: "ECE",
    description: "Electronics, IoT and Communication",
    activityScopes: [
      "IoT Projects",
      "Hardware Workshops",
      "Industry Visits",
      "Expert Sessions"
    ]
  }
]);

console.log("Departments seeded");
process.exit();
