import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authorizeRoles } from './roleMiddleware.js';

export const protect = async (req, res, next) => {
  let token;
  
  console.log('--- AUTH HANDSHAKE DEBUG ---');
  console.log('Raw Authorization Header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Split and clean token of accidental stringified quotes
      let rawToken = req.headers.authorization.split(' ')[1];
      token = rawToken.replace(/['"]+/g, '').trim();
      
      console.log('Cleaned Token Array:', token.substring(0, 15) + '...');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user profile not found' });
      }
      return next();
    } catch (error) {
      console.error('JWT Verify Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export { authorizeRoles };

