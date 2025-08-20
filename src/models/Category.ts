export default class Category {
  constructor(
    public category: string,
    public icon: string,
    public id?: number,
  ) {}

  static getCategory() {
    return new Category('', '', 0)
  }
}
