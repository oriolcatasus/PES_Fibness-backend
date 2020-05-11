-- Up Migration

alter table ejercicios add posicion int;
alter table rutas add distancia varchar(300);

-- Down Migration