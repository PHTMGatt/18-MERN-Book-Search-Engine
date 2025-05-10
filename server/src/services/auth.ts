import type { Request } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

// Todo: implement 'authenticateToken' middleware to log headers, extract 'authorization' header, verify JWT, and attach user payload to req
// Note logs incoming 'headers' and 'authHeader', splits out token, uses 'JWT_SECRET_KEY' to verify, handles errors, and sets req.user as JwtPayload

// Idea Research: export const authenticateToken = (req: Request) =>

export const authenticateToken = ({ req }:{req: Request}) => {
  console.log('headers: ', req.headers);
  const authHeader = req.headers.authorization;
  console.log('authHeader: ', authHeader);

  if(!authHeader) {
    console.error('No authorization header found'); 
    return req;
  }

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const secretKey = process.env.JWT_SECRET_KEY || '';

    try {
      const user = jwt.verify(token, secretKey) as JwtPayload;
      req.user = user;
    } catch (err) {
      console.error('Token verification error: ', err);
      return req;
    }
  } 

  return req;
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
