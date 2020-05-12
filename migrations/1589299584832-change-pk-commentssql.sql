-- Up Migration



drop table likesComentarios;

create table likesComentarios(
  idUsuario int,
  idElemento int,
  primary key (idUsuario, idElemento),
  foreign key (idUsuario) references usuarios(id) on delete cascade,
  foreign key (idElemento) references comentarios(idComentario) on delete cascade
);


-- Down Migration
