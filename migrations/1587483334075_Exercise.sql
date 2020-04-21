-- Up Migration


drop table actividades;
drop table ejercicios;
drop table deportes;

create table actividades (
	idActividad serial,
	nombre varchar(50),
	descripcion varchar(50),
	tiempoEjecucion Integer,
	idEntrenamiento int not null,
	primary key (idActividad),
	foreign key (idEntrenamiento) references entrenamientos (idElemento) on delete cascade
);

create table ejercicios (
	idActividad int,
	numSets Integer,
	numRepeticiones Integer,
	tiempoDescanso Integer,
	primary key (idActividad),
	foreign key (idActividad) references actividades (idActividad) on delete cascade
);

create table deportes(
	idActividad int,
	primary key (idActividad),
	foreign key (idActividad) references actividades(idActividad) on delete cascade
);

create table dietas (
	idElemento int,
	primary key (idElemento),
	foreign key (idElemento) references elementos (idElemento) on delete cascade
);
-- Down Migration