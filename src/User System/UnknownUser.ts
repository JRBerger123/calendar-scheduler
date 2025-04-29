export class UnknownUser {
    constructor(
      public name: string,
      public scheduledBy: string,
      public reason: string
    ) {}
  
    public getDisplayName(): string {
      return `${this.name} (Guest)`;
    }
  
    public isAuthenticated(): boolean {
      return false; // Unknown users are not authenticated
    }
  }
  