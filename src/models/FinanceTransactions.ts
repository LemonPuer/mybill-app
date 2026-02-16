export default class FinanceTransactions {
  constructor(
    public amount: number,
    public type: number,
    public category: string,
    public icon: string,
    public transactionDate: string,
    public account: string,
    public note: string,
    public id?: number,
    public categoryId?: number,
    public accountId?: number,
  ) {}
}
