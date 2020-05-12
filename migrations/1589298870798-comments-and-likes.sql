-- Up Migration

create table comentarios(
  idComentario serial,
  idUsuario int,
  idElemento int,
  fecha date default CURRENT_DATE,
  primary key (idComentario),
  foreign key (idUsuario) references usuarios(id) on delete cascade,
  foreign key (idElemento) references elementos(idElemento) on delete cascade
);

create table likesElementos(
  idUsuario int,
  idElemento int,
  primary key (idUsuario, idElemento),
  foreign key (idUsuario) references usuarios(id) on delete cascade,
  foreign key (idElemento) references elementos(idElemento) on delete cascade
);

create table likesComentarios(
  idUsuario int,
  idComentario int,
  primary key (idUsuario, idComentario),
  foreign key (idUsuario) references usuarios(id) on delete cascade,
  foreign key (idComentario) references comentarios(idComentario) on delete cascade
);

alter table elementos add nLikes int default 0;
alter table elementos add nComentarios int default 0;

-- Down Migration
