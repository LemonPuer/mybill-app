export default class Account {
  constructor(
    public accountType: number | string,
    public accountName: string,
    public accountCategory: number | string,
    public amount: number,
    public id?: number,
    public pid?: number,
    public children?: boolean,
  ) {}
}
