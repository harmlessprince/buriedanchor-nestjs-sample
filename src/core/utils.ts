import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(
  enteredPassword: string,
  dbPassword: string,
) {
  return await bcrypt.compare(enteredPassword, dbPassword);
}

export const success = (
  data: any = null,
  message: string = 'Action successful',
) => {
  return {
    success: true,
    message,
    data: data,
    statusCode: 200,
  };
};

export interface TokenPayload {
  email: string;
  userId: ObjectId;
}