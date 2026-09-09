require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      email: process.env.SUPER_ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("Super Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD,
      12,
    );

    const superAdmin = await User.create({
      name: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      tenantId: null,
      isActive: true,
    });

    console.log(`Super Admin created: ${superAdmin.email}`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating Super Admin:", error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
