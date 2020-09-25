export class User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  sessionKey: string;
  authorizations?: {};
  adAttributes?: string;
}
