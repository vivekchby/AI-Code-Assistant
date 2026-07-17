const supabase = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getAuthenticatedUserId = (req) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Authentication required");
  return jwt.verify(token, process.env.JWT_SECRET).id;
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.trim())
      .neq("id", userId)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already in use" });
    }

    const updates = { name: name.trim(), email: email.trim() };
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("id, name, email")
      .single();
    if (error) throw error;

    res.json({ success: true, user: data });
  } catch (error) {
    const status = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" ? 401 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  updateProfile
};
