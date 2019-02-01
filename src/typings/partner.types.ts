export class MinimalStaffMember {
  name: string = '';

  constructor(public id: number | string, public first_name: string,
     public last_name: string, public active: boolean) {
      this.name = this.first_name + ' ' + this.last_name;
  }
}

export class StaffMember extends MinimalStaffMember {
  title!: string;
  email!: string;
  phone!: string;
}
