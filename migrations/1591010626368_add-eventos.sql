-- Up Migration
create table eventos(
    id serial,
    titulo varchar(70) not null,
    descripcion varchar(250),
    fecha varchar(10),
    hora varchar(10),
    localizacion varchar(50),
    idcreador int not null,
    primary key (id),
    foreign key (idcreador) references usuarios(id) on delete cascade
);
create table participacionevento(
    idevento int,
    idusuario int,
    primary key (idevento, idusuario),
    foreign key (idevento) references eventos(id),
    foreign key (idusuario) references usuarios(id)
);
-- Down Migration