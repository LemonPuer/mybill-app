export default class FinancialObjectives {
  constructor(
    public objective: string,
    public icon: string,
    public amount: number,
    public finished: boolean,
    public balance: number,
    public id?: number,
  ) {}
}
