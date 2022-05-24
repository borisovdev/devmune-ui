export default class RatingContributor {
  private _id!: number;

  private _name!: string;

  private _avatarUrl!: string;

  private _accountUrl!: string;

  private _username!: string;

  private _weight!: number;

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  set name(value: string) {
    this._name = value;
  }

  get avatarUrl(): string {
    return this._avatarUrl;
  }

  set avatarUrl(value: string) {
    this._avatarUrl = value;
  }

  get accountUrl(): string {
    return this._accountUrl;
  }

  set accountUrl(value: string) {
    this._accountUrl = value;
  }

  get weight(): number {
    return this._weight;
  }

  set weight(value: number) {
    this._weight = value;
  }
}
