-- Up Migration

drop table followers;

create table seguidores(
  idSeguidor int,
  idSeguido int,
  primary key (idSeguido, idSeguidor),
  foreign key (idSeguidor) references usuarios(id),
  foreign key (idSeguido) references usuarios(id)
)

-- Down Migration
