-- Up Migration

create table bloqueados(
  idBloqueador int,
  idBloqueado int,
  primary key (idBloqueador, idBloqueado),
  foreign key (idBloqueador) references usuarios(id) on delete cascade,
  foreign key (idBloqueado) references usuarios(id) on delete cascade
)

-- Down Migration
