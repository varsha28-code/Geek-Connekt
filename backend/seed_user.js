const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

// Load backend env variables
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/user");
const mongo_url = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/geekConnekt";

async function seed() {
    try {
        await mongoose.connect(mongo_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");

        // Delete existing user if any
        await User.deleteOne({ username: "testuser" });
        console.log("Cleared old testuser");

        // Create new user
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = new User({
            username: "testuser",
            email: "testuser@example.com",
            password: hashedPassword,
            role: "student",
            college: "SWEC",
            phoneNumber: "1234567890",
            rollNumber: "20SWEC001",
            fullName: "Test User"
        });

        await user.save();
        console.log("Successfully seeded testuser: password123");
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

seed();
