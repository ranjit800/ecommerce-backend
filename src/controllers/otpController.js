// OTP Controller - Mock implementation with hardcoded OTP
import User from '../models/User.js';

// Hardcoded OTP for demo
const DEMO_OTP = '123456';
const OTP_EXPIRY_MINUTES = 10;

// Temporary storage for signup OTPs (in-memory)
// In production, use Redis or session storage
const tempOTPs = new Map();

// Send OTP (mock - just stores in DB or temp storage)
export const sendOTP = async (req, res) => {
  try {
    const { type, value } = req.body; // type: 'mobile' or 'email', value: phone/email

    if (!type || !value) {
      return res.status(400).json({
        success: false,
        message: 'Type and value are required',
      });
    }

    if (type !== 'mobile' && type !== 'email') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either mobile or email',
      });
    }

    // Try to find existing user
    let user;
    if (type === 'email') {
      user = await User.findOne({ email: value });
    } else {
      user = await User.findOne({ mobile: value });
    }

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    if (user) {
      // Existing user - store OTP in database
      if (type === 'mobile') {
        user.otp.mobile = {
          code: DEMO_OTP,
          expiresAt,
        };
      } else {
        user.otp.email = {
          code: DEMO_OTP,
          expiresAt,
        };
      }
      await user.save();
    } else {
      // New user (signup) - store OTP temporarily
      const key = `${type}:${value}`;
      tempOTPs.set(key, {
        code: DEMO_OTP,
        expiresAt,
      });
      
      // Clean up after expiry
      setTimeout(() => {
        tempOTPs.delete(key);
      }, OTP_EXPIRY_MINUTES * 60 * 1000);
    }

    // In production, send SMS/Email here
    // For demo, just return success
    res.status(200).json({
      success: true,
      message: `OTP sent to ${type}`,
      // ONLY FOR DEMO - don't send OTP in production
      otp: DEMO_OTP,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { type, value, otp } = req.body;

    if (!type || !value || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Type, value, and OTP are required',
      });
    }

    // Try to find existing user
    let user;
    if (type === 'email') {
      user = await User.findOne({ email: value });
    } else {
      user = await User.findOne({ mobile: value });
    }

    let storedOTP;

    if (user) {
      // Existing user - check database
      storedOTP = type === 'mobile' ? user.otp.mobile : user.otp.email;
      
      if (!storedOTP || !storedOTP.code) {
        return res.status(400).json({
          success: false,
          message: 'No OTP found. Please request a new one.',
        });
      }

      // Check expiry
      if (new Date() > storedOTP.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired. Please request a new one.',
        });
      }

      // Verify OTP
      if (storedOTP.code !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      // Mark as verified
      if (type === 'mobile') {
        user.isMobileVerified = true;
        user.otp.mobile = undefined;
      } else {
        user.isEmailVerified = true;
        user.otp.email = undefined;
      }

      await user.save();
    } else {
      // New user (signup) - check temporary storage
      const key = `${type}:${value}`;
      storedOTP = tempOTPs.get(key);

      if (!storedOTP) {
        return res.status(400).json({
          success: false,
          message: 'No OTP found. Please request a new one.',
        });
      }

      // Check expiry
      if (new Date() > storedOTP.expiresAt) {
        tempOTPs.delete(key);
        return res.status(400).json({
          success: false,
          message: 'OTP expired. Please request a new one.',
        });
      }

      // Verify OTP
      if (storedOTP.code !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      // OTP verified - keep in temp storage until account creation
      // Don't delete yet, so signup can confirm verification
    }

    res.status(200).json({
      success: true,
      message: `${type} verified successfully`,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
};

// Helper function to check if OTP was verified (for signup)
export const isOTPVerified = (type, value) => {
  const key = `${type}:${value}`;
  return tempOTPs.has(key);
};

// Helper function to clear temp OTP after account creation
export const clearTempOTP = (type, value) => {
  const key = `${type}:${value}`;
  tempOTPs.delete(key);
};
