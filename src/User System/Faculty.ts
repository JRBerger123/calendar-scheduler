import { User } from "./User";

export class Faculty extends User {
  constructor(
    id: string,
    name: string,
    email: string,
    public department: string,
    public officeLocation: string
  ) {
    super(name, email, UserRole.FACULTY);
  }

  public canEditCalendar(): boolean {
    return true; // Faculty can edit their own calendar
  }
}
