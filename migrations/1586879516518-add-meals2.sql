-- Up Migration

drop table dias cascade;
drop table diasDieta cascade;
drop table comidas cascade;
drop table alimentos cascade;

create table diasDieta (
	idElemento int,
	tipoDia varchar(20) check (tipoDia in ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
	primary key (idElemento, tipoDia),
	foreign key (idElemento) references dietas (idElemento) on delete cascade
);

create table comidas (
	idComida int,
	nombre varchar(50),
	horaComida time,
	idElemento int,
	tipoDia varchar(20),
	primary key (idComida),
	foreign key (idElemento, tipoDia) references diasDieta (idElemento, tipoDia) on delete cascade
);

create table alimentos (
	idAlimento varchar(100),
	nombre varchar(50),
	descripción varchar(300),
	calorías Integer,
	idComida int,
	primary key (idAlimento),
	foreign key (idComida) references comidas (idComida) on delete cascade
);

-- Down Migration
