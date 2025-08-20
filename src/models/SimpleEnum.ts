export default class Account {
  constructor(
    public key: number,
    public value: string,
  ) {}
}

export interface CommonDicVO {
  id: number | null
  name: string | null
  children: CommonDicVO[] | null
}
