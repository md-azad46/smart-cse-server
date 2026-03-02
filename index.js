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
