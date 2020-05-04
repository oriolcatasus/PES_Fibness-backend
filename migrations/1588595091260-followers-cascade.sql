-- Up Migration

drop table seguidores;

create table seguidores(
  idSeguidor int,
  idSeguido int,
  primary key (idSeguido, idSeguidor),
  foreign key (idSeguidor) references usuarios(id) on delete cascade,
  foreign key (idSeguido) references usuarios(id) on delete cascade
)

-- Down Migration
