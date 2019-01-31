export class MinimalStaffMember {
  constructor(public id: number | string, public first_name: string,
     public last_name: string, public active: boolean) {

  }

  get name(): string {
    return this.first_name + ' ' + this.last_name;
  }
}

export class StaffMember extends MinimalStaffMember {
  title!: string;
  email!: string;
  phone!: string;
}
