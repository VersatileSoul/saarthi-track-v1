const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generateResetToken,
  verifyToken,
  decodeToken,
} = require("../utils/jwt");
const { formatError, formatSuccess } = require("../utils/helpers");
const { validationResult } = require("express-validator");

/**
 *  Register new user (Officer only)
 */
const register = async (req, res) => {
  try {
    // check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { name, email, password, phone, role, stationID, licenseNumber } =
      req.body;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
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
    const refreshToken = generateRefreshToken({
      userId: user._id,
    });

    // Save refresh token at database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await refreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt,
    });

    // Return user data (without password)
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json(
      formatSuccess(
        {
          user: userData,
          accessToken,
          refreshToken,
        },
        "User registered successfully. Credentials sent via email"
      )
    );
  } catch (err) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json(formatError(error.message || "Registration failed", 500));
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
    console.log(user);

    if (!user) return res.status(404).json({ message: "User not found" });

    const publicUser = {
      userID: user._id,
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
