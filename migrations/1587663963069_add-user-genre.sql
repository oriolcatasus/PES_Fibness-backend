-- Up Migration
alter table usuarios
add column genero boolean;
-- Down Migration