export abstract class User {
    id: string | null = null; // User ID, can be null if not authenticated
    name: string;
    email: string;
    role: UserRole;

    constructor(name: string, email: string, role: UserRole) {
        this.name = name;
        this.email = email;
        this.role = role;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getRole(): UserRole {
        return this.role;
    }

    setRole(role: UserRole): void {
        this.role = role;
    }

    getEmail(): string {
        return this.email;
    }

    setEmail(email: string): void {
        this.email = email;
    }

    canEditCalendar(): boolean {
        return this.getRole() === UserRole.ADMIN || this.getRole() === UserRole.FACULTY;
    }

    isAuthenticated(): boolean {
        return !!this.id; // Assuming id is set when authenticated
    }
}