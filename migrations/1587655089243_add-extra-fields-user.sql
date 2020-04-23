-- Up Migration
alter table usuarios
add column descripcion varchar(300);

alter table usuarios
add column pais integer;

alter table usuarios
add column fechaDeNacimiento date;
-- Down Migration