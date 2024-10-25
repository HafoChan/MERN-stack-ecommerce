import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import cors from "cors";
import path from "path";
import { connectDB, disconnectDB } from "./ConnectionDB.js";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

connectDB().then(() => {
  app.listen(port, (error) => {
    if (!error) {
      console.log(`Server is running on port ${port}`);
    } else {
      console.log("Error: ", error);
    }
  });
});

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
});

// Create upload endpoint for images

app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  res.json({
    success: true,
    image_url: `http://localhost:4000/images/${req.file.filename}`,
  });
});

// Schema product

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

app.post("/product", async (req, res) => {
  const product = new Product(req.body);
  console.log(product);
  await product.save();
  res.json({
    success: true,
    name: req.body.name,
  });
});
