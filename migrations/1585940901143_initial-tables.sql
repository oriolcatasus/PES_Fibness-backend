-- Up Migration

create table provincias(
	nombre varchar(50),
	primary key (nombre)
);

create table usuarios(
	id serial,
	tipoUsuario varchar(20) check (tipoUsuario in ('principiante', 'intermedio', 'avanzado')) default 'principiante',
	nombre varchar(50) not null,
	password varchar(100) not null,
	email varchar(100) unique not null,
	facebook boolean not null default false,
	fechaDeRegistro date default CURRENT_DATE,
	provincia varchar(50),
	tipoPerfil varchar(30) check (tipoPerfil in ('privado', 'publico')) default 'publico',
	primary key (id),
	foreign key (provincia) references provincias(nombre)
);

create table elementos(
	idElemento serial,
	nombre varchar(50),
	descripcion varchar(300),
	idUsuario int,
	unique (idUsuario, nombre),
	primary key (idElemento),
	foreign key (idUsuario) references usuarios (id) on delete cascade
);

create table entrenamientos (
	idElemento int,
	primary key (idElemento),
	foreign key (idElemento) references elementos (idElemento) on delete cascade
);

create table actividades (
	nombre varchar(50),
	descripcion varchar(50),
	tiempoEjecucion Integer,
	idElemento int,
	primary key (idElemento, nombre),
	foreign key (idElemento) references entrenamientos (idElemento) on delete cascade
);

create table deportes (
	nombreActividad varchar(50),
	idElemento int,
	primary key (idElemento,nombreActividad),
	foreign key (idElemento,nombreActividad) references actividades (idElemento, nombre) on delete cascade
);

create table ejercicios (
	numSets Integer,
	numRepeticiones Integer,
	tiempoDescanso Integer,
	nombreActividad varchar(50),
	idElemento int,
	primary key (idElemento, nombreActividad),
	foreign key (idElemento, nombreActividad ) references actividades (idElemento, nombre) on delete cascade
);

create table dietas (
	idElemento int,
	primary key (idElemento),
	foreign key (idElemento) references elementos (idElemento) on delete cascade
);

create table comidas (
	nombre varchar(50),
	horaComida time,
	idElemento int,
	primary key (nombre, idElemento),
	foreign key (idElemento) references dietas (idElemento) on delete cascade
);

create table alimentos (
	nombre varchar(50),
	descripción varchar(300),
	calorías Integer,
	nombreComida varchar(50),
	idElemento int,
	primary key (nombre, nombreComida, idElemento),
	foreign key (nombreComida, idElemento) references comidas (nombre, idElemento) on delete cascade
);
-- Down Migration