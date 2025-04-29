import { User } from "./User";

export class Admin extends User {
  constructor(
    id: string,
    name: string,
    email: string,
    public accessLevel: number
  ) {
    super(name, email, UserRole.ADMIN);
  }

  public canEditCalendar(): boolean {
    return true; // Admins have full control
  }
}
