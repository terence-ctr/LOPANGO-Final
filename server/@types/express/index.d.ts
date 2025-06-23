import { User } from '../../src/types/user';
import { Property } from '../controllers/property.controller';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        userType: string;
        firstName: string;
        lastName: string;
      };
      property?: Property;
    }
  }
}
