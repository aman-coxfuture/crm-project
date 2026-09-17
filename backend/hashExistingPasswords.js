const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");

const hashExistingPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const users = await User.find({});

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      // Already bcrypt hashed → skip
      if (typeof user.password === "string" && user.password.startsWith("$2")) {
        skipped++;
        continue;
      }

      // Plain-text password → hash it
      user.password = await bcrypt.hash(user.password, 10);

      await user.save();

      updated++;
      console.log(`Password hashed for: ${user.email}`);
    }

    console.log("\nMigration completed.");
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
  } catch (error) {
    console.error("Password migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

hashExistingPasswords();
