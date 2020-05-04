-- Up Migration

create table followers(
  followedID int,
  followerID int,
  primary key (followedID, followerID),
  foreign key (followerID) references usuarios(id),
  foreign key (followedID) references usuarios(id)
)

-- Down Migration
