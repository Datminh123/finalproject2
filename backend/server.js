import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import jobRoutes from './routes/jobRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'; 
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["https://finalproject2-fe.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true
   }
});
app.use(cors());
app.use(express.json());

connectDB(); // gọi kết nối MongoDB
let onlineUsers = [];
io.on("connection", (socket) => {
  socket.on("registerUser", (email) => {
    if (email && !onlineUsers.some(user => user.email === email)) {
      onlineUsers.push({ email, socketId: socket.id });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
  });
});

app.use((req, res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
});
app.get("/", (req, res) => {
  res.send("API running");
});

app.use('/api/jobs', jobRoutes); 
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});