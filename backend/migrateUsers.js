const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./src/models/User");
const Faculty = require("./src/models/Faculty");
const Student = require("./src/models/Student");

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // =========================
    // MIGRATE FACULTY USERS
    // =========================

    const facultyUsers = await User.find({
      role: "FACULTY",
    });

    console.log(`Faculty users found: ${facultyUsers.length}`);

    let facultyUpdated = 0;

    for (const user of facultyUsers) {
      const faculty = await Faculty.findOne({
        userId: user._id,
      });

      if (!faculty) {
        console.log(`No Faculty profile found for ${user.email}`);
        continue;
      }

      faculty.name = user.name;
      faculty.email = user.email;
      faculty.password = user.password;
      faculty.isActive = user.isActive;

      await faculty.save();

      facultyUpdated++;

      console.log(`Faculty migrated: ${user.email}`);
    }

    // =========================
    // MIGRATE STUDENT USERS
    // =========================

    const studentUsers = await User.find({
      role: "STUDENT",
    });

    console.log(`Student users found: ${studentUsers.length}`);

    let studentUpdated = 0;

    for (const user of studentUsers) {
      const student = await Student.findOne({
        userId: user._id,
      });

      if (!student) {
        console.log(`No Student profile found for ${user.email}`);
        continue;
      }

      student.name = user.name;
      student.email = user.email;
      student.password = user.password;
      student.isActive = user.isActive;

      await student.save();

      studentUpdated++;

      console.log(`Student migrated: ${user.email}`);
    }

    console.log("\n==============================");
    console.log("Migration completed");
    console.log("==============================");
    console.log(`Faculty migrated: ${facultyUpdated}`);
    console.log(`Students migrated: ${studentUpdated}`);
    console.log("==============================");

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateUsers();
