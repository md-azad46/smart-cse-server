require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://smart-cse-seven.vercel.app"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.indexOf(origin) === -1) {
//         return callback(new Error("Not allowed by CORS"));
//       }

//       return callback(null, true);
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

const allowedOrigins = [
  "http://localhost:3000", // local development
  "https://smart-cse-three.vercel.app", // frontend (main)
  "https://smart-cse-server-eta.vercel.app", // optional (same-origin / testing)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server / Postman / curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
<<<<<<< HEAD
);
// // IMPORTANT: preflight handle
// app.options("*", cors());
// // app.options("*", cors());

app.use(express.json());

const encodedPass = encodeURIComponent(process.env.DB_PASS);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const calculateGrade = (marks) => {
  if (marks >= 80) return { grade: "A+", point: 4.0 };
  if (marks >= 75) return { grade: "A", point: 3.75 };
  if (marks >= 70) return { grade: "A-", point: 3.5 };
  if (marks >= 65) return { grade: "B+", point: 3.25 };
  if (marks >= 60) return { grade: "B", point: 3.0 };
  if (marks >= 55) return { grade: "B-", point: 2.75 };
  if (marks >= 50) return { grade: "C+", point: 2.5 };
  if (marks >= 45) return { grade: "C", point: 2.25 };
  if (marks >= 40) return { grade: "D", point: 2.0 };
  return { grade: "F", point: 0.0 };
};

const uri = `mongodb+srv://${process.env.DB_USER}:${encodedPass}@cluster0.mdmdo0u.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.post("/jwt", async (req, res) => {
  const user = req.body;

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.send({ token });
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    req.decoded = decoded;
    next();
  });
};
=======
);
>>>>>>> development

async function run() {
  try {
    const db = client.db("smartCse");
    const usersCollection = db.collection("users");
    const coursesCollection = db.collection("courses");
    const routinesCollection = db.collection("routines");
    const attendanceCollection = db.collection("attendance");
    const settingsCollection = db.collection("settings");
    const feedbackCollection = db.collection("feedback");
    const facultiesCollection = db.collection("faculties");
    const resultsCollection = db.collection("results");
    const noticesCollection = db.collection("notices");
    const classroomsCollection = db.collection("classrooms");
    const classSchedulesCollection = db.collection("classSchedules");

    // Admin verification middleware
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;

      const user = await usersCollection.findOne({ email });

      if (!user || user.role !== "admin") {
        return res
          .status(403)
          .send({ message: "Forbidden access (admin only)" });
      }

      next();
    };

    // Teacher or Admin verification middleware
    const verifyTeacherOrAdmin = async (req, res, next) => {
      const email = req.decoded.email;

      const user = await usersCollection.findOne({ email });
      if (!user || (user.role !== "admin" && user.role !== "teacher")) {
        return res
          .status(403)
          .send({ message: "Forbidden access (Teacher or Admin only)" });
      }
      next();
    };

    // clodinary upload route
    app.post(
      "/upload-image",
      // verifyJWT,
      upload.single("image"),
      async (req, res) => {
        try {
          if (!req.file) {
            return res.status(400).send({ message: "No file uploaded" });
          }

          const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
          const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
            upload_preset: "smartcseimage",
          });

          res.json({
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id,
          });
        } catch (err) {
          console.error("Cloudinary Error:", err);
          res.status(500).send({
            message: "Cloudinary upload failed. Check API keys/Presets.",
          });
        }
      },
    );

    app.delete(
      "/delete-image/:publicId",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const publicId = req.params.publicId;
        try {
          await cloudinary.uploader.destroy(publicId);
          res.send({ message: "Image deleted from Cloudinary" });
        } catch (err) {
          res.status(500).send({ message: "Delete failed" });
        }
      },
    );


    // User related routes

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      try {
        const user = await client
          .db("smartCse")
          .collection("users")
          .findOne({ email });

        if (!user) {
          return res.status(401).send({ message: "Invalid email or password" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (isPasswordMatch) {
          const token = jwt.sign(
            { email: user.email, role: user.role, id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
          );

          return res.send({
            token,
            user: {
              id: user._id.toString(),
              email: user.email,
              role: user.role,
              name: user.name,
            },
          });
        } else {
          return res.status(401).send({ message: "Invalid email or password" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
      }
    });
    // forget password and reset password routes
    app.post("/forget-password", async (req, res) => {
      const { email } = req.body;
      try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res
            .status(404)
            .send({ message: "User not found with this email!" });
        }

        // টোকেন তৈরি (১ ঘণ্টা মেয়াদী)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000;

        await usersCollection.updateOne(
          { email },
          { $set: { resetToken, resetTokenExpiry } },
        );

        // রিসেট লিংক (আপনার ফ্রন্টএন্ড ইউআরএল অনুযায়ী)
        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${email}`;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"SmartCSE Support" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Password Reset Request",
          html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Valid for 1 hour.</p>`,
        });

        res.send({ message: "Reset link sent to your email!" });
      } catch (error) {
        res.status(500).send({ message: "Failed to process request" });
      }
    });

    app.patch("/reset-password", async (req, res) => {
      const { email, token, newPassword } = req.body;
      try {
        const user = await usersCollection.findOne({
          email,
          resetToken: token,
          resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
          return res.status(400).send({ message: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await usersCollection.updateOne(
          { email },
          {
            $set: { password: hashedPassword },
            $unset: { resetToken: "", resetTokenExpiry: "" },
          },
        );

        res.send({ message: "Password updated successfully!" });
      } catch (error) {
        res.status(500).send({ message: "Reset failed" });
      }
    });
    // get all users (admin only)
    // verifyJWT, verifyTeacherOrAdmin,
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });
    app.get("/users/status/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.send({ user });
    });

    // post new user (registration)

    app.post("/users", async (req, res) => {
      try {
        const user = req.body;

        if (!user.email || !user.password) {
          return res
            .status(400)
            .send({ message: "Email and password are required" });
        }

        const existingUser = await usersCollection.findOne({
          email: user.email,
        });
        if (existingUser) {
          return res.status(409).send({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        const newUser = {
          ...user,
          password: hashedPassword,
          createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Registration failed" });
      }
    });

    // delete user (admin only)
    // verifyJWT, verifyAdmin,
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.patch("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;

        delete updateData._id;

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData },
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "User not found" });
        }

        res.send({ success: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Update process failed" });
      }
    });

    // get user by email (for profile page)
    // verifyJWT,
    app.get("/users/email/:email",verifyJWT,  async (req, res) => {
      const email = req.params.email;

      if (req.decoded?.email !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }

      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      res.send(user);
    });
    // pending get for admin dashboard
    app.get("/users/pending", verifyJWT, verifyAdmin, async (req, res) => {
      const pendingUsers = await usersCollection
        .find({ status: "pending" })
        .toArray();
      res.send(pendingUsers);
    });
    app.patch(
      "/users/pending/:id",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: "approved" } },
        );
        res.send(result);
      },
    );
    app.get("/admin-stats", verifyJWT, verifyAdmin, async (req, res) => {
      try {
        const totalStudents = await usersCollection.countDocuments({
          role: "student",
        });
        const totalTeachers = await usersCollection.countDocuments({
          role: "teacher",
        });
        const pendingUsersCount = await usersCollection.countDocuments({
          status: "pending",
        });

        const pendingUsersList = await usersCollection
          .find({ status: "pending" })
          .limit(5)
          .toArray();
        const totalNotices = await noticesCollection.countDocuments();

        res.send({
          totalStudents,
          totalTeachers,
          pendingUsersCount,
          totalNotices,
          pendingUsersList,
        });
      } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // student dashboard stats route
    // verifyJWT,
    app.get("/student/dashboard-overview",verifyJWT, async (req, res) => {
      try {
        const email = req.decoded.email;
        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(404).send({ message: "User not found" });

        const studentIdStr = user._id.toString();
        const semester = user.semester || "1";

        // ১. এটেনডেন্স ক্যালকুলেশন (আপনার ডাটা স্ট্রাকচার অনুযায়ী)
        const attendanceRecords = await attendanceCollection
          .find({
            semester: semester,
            [`attendance.${studentIdStr}`]: { $exists: true },
          })
          .toArray();

        let presentCount = 0;
        attendanceRecords.forEach((record) => {
          const status = record.attendance[studentIdStr];
          // P = Present, L = Late (Late কেও উপস্থিতি ধরা হয়েছে)
          if (status === "P" || status === "L") presentCount++;
        });

        const attendanceRate =
          attendanceRecords.length > 0
            ? Math.round((presentCount / attendanceRecords.length) * 100)
            : 0;

        const coursesCount = await coursesCollection.countDocuments({
          semester: semester,
        });
        const results = await resultsCollection
          .find({ studentEmail: email })
          .toArray();
        const totalPoints = results.reduce((sum, r) => sum + (r.point || 0), 0);
        const cgpa =
          results.length > 0
            ? (totalPoints / results.length).toFixed(2)
            : "0.00";

        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const today = days[new Date().getDay()];
        const routines = await routinesCollection
          .find({ semester: semester, day: today })
          .toArray();

        const recentNotices = await noticesCollection
          .find()
          .sort({ createdAt: -1 })
          .limit(3)
          .toArray();

        res.send({
          stats: {
            attendanceRate: attendanceRate,
            totalClasses: attendanceRecords.length,
            presentDays: presentCount,
            cgpa: cgpa,
            enrolledCourses: coursesCount,
            pendingTasks: 3,
          },
          todaySchedule: routines.map((r) => ({
            time: r.startTime,
            subject: r.courseName,
            room: r.roomNo,
            instructor: r.teacherName,
            type: r.type || "Lecture",
          })),
          recentNotifications: recentNotices.map((n) => ({
            title: n.title,
            description: n.description.substring(0, 60) + "...",
            time: "Just Now",
          })),
          courseProgress: results.slice(0, 3).map((r) => ({
            name: r.courseName,
            code: r.courseCode,
            progress: 100, // রেজাল্ট আসা মানে কোর্স শেষ
          })),
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // course related routes

    // get courses by semester (admin and teachers only)
    // verifyJWT,
    app.get("/courses/:semester", async (req, res) => {
      try {
        const sem = req.params.semester;
        console.log(sem);
        const query = { semester: sem };

        const courses = await coursesCollection.find(query).toArray();

        res.status(200).send(Array.isArray(courses) ? courses : []);
      } catch (error) {
        console.error("Course fetch error:", error);
        res.status(500).send([]);
      }
    });
    // verifyJWT,
    app.get("/courses", async (req, res) => {
      const courseCode = req.query.code;

      let query = {};
      if (courseCode) {
        query.courseCode = courseCode;
      }
      const courses = await coursesCollection.find(query).toArray();
      res.send(courses);
    });
    //  verifyJWT, verifyTeacherOrAdmin,
    app.post("/courses", async (req, res) => {
      const course = req.body;
      const existingCourse = await coursesCollection.findOne({
        courseCode: course.code,
      });

      if (existingCourse) {
        return res.status(409).send({ message: "Course already exists" });
      }
      const result = await coursesCollection.insertOne(course);
      res.send(result);
    });

    app.delete(
      "/courses/:id",
      verifyJWT,
      verifyTeacherOrAdmin,
      async (req, res) => {
        const id = req.params.id;
        const result = await coursesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      },
    );


