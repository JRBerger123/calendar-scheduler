import { User } from "./User";

export class Student extends User {
  constructor(
    id: string,
    name: string,
    email: string,
    public major: string,
    public graduationYear: number
  ) {
    super(name, email, UserRole.STUDENT);
  }

  public canEditCalendar(): boolean {
    return false; // Students cannot edit the master calendar by default
  }
}
