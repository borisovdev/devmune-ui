import RatingContributor from "../entity/RatingContributor";

import { AxiosInstance } from "axios";
import UsersGithubApiMapper from "../mappers/UsersGithubApiMapper";

export default class UsersGithubApiGateway {
  private _basePath: string = `https://api.github.com/users`;

  constructor(
    private axiosService: AxiosInstance,
    private mapper: UsersGithubApiMapper
  ) {}

  async getContributor(
    username: string
  ): Promise<RatingContributor | undefined> {
    try {
      const response = await this.axiosService.get<any, any>(
        `${this._basePath}/${username}`
      );

      const userData = response.data;
      if (!userData) return undefined;

      return this.mapper.createRatingContributorFromUserDto(userData);
    } catch (ex) {
      return undefined;
    } finally {
    }
  }
}
