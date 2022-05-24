import RatingContributor from "../entity/RatingContributor";

export default class UsersGithubApiMapper {
  createRatingContributorFromUserDto(userDto: any): RatingContributor {
    const entity = new RatingContributor();
    entity.id = userDto.id;
    entity.username = userDto.login;
    entity.avatarUrl = userDto.avatar_url;
    entity.name = userDto.name;
    entity.accountUrl = `https://github.com/${userDto.login}`;
    return entity;
  }
}
