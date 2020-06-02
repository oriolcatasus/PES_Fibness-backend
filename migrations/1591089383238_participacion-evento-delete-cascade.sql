-- Up Migration
drop table participacionevento;
create table participacionevento(
    idevento int,
    idusuario int,
    primary key (idevento, idusuario),
    foreign key (idevento) references eventos(id),
    foreign key (idusuario) references usuarios(id) on delete cascade
);
-- Down Migration