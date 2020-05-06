-- Up Migration
create table rutas (
	idElemento int,
	origen varchar(50),
	destino varchar(50),
	primary key (idElemento),
	foreign key (idElemento) references elementos (idElemento) on delete cascade
);
-- Down Migration