-- Up Migration


drop table comidas cascade;
drop table alimentos cascade;


create table comidas (
	idComida serial,
	nombre varchar(50),
	horaComida time,
	idElemento int,
	tipoDia varchar(20),
	primary key (idComida),
	foreign key (idElemento, tipoDia) references diasDieta (idElemento, tipoDia) on delete cascade
);

create table alimentos (
	idAlimento serial,
	nombre varchar(50),
	descripción varchar(300),
	calorías Integer,
	idComida int,
	primary key (idAlimento),
	foreign key (idComida) references comidas (idComida) on delete cascade
);

-- Down Migration
