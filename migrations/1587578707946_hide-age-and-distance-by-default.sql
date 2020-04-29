-- Up Migration
alter table usuarios drop column sEdad;
alter table usuarios add sEdad boolean not null default false;

alter table usuarios drop column sDistancia;
alter table usuarios add sDistancia boolean not null default false;
-- Down Migration