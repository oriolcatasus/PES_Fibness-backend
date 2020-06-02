-- Up Migration
    create table estadisticas(
        fecha date default CURRENT_DATE,
        dstRecorrida varchar(300),
        idUsuario int,
        primary key (idUsuario,fecha),
        foreign key (idUsuario) references usuarios (id) on delete cascade
    );

-- Down Migration