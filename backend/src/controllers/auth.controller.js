const User = require("../models/User");
const { generateAccessToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, stationID, licenseNumber } =
      req.body;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in Use",
      });
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      licenseNumber,
    });

    // generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    console.log(accessToken);

    // pick public fields
    const publicUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      stationIds: user.stationIds,
      licenseNumber: user.licenseNumber,
      employeeId: user.employeeID,
    };

    return res.status(201).json({ user: publicUser, token: accessToken });
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Registration Failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive. Please contact administrator",
      });
    }

    user.lastLogin = new Date();

    const token = generateAccessToken({ userId: user._id, role: user.role });

    const publicUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      stationIds: user.stationIds,
      licenseNumber: user.licenseNumber,
      employeeId: user.employeeID,
    };

    return res.json({ user: publicUser, token });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Login Failed" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const publicUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      stationIds: user.stationIds,
      licenseNumber: user.licenseNumber,
      employeeId: user.employeeID,
    };

    return res.json({ user: publicUser });
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to load profile" });
  }
};
