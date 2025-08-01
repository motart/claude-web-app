import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      sessionId?: string;
      id?: string;
    }
  }
}

export {};