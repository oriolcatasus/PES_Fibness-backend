
create table provincias(
	nombre varchar(50),
	primary key (nombre)
);

create table usuarios(
	id serial,
	tipoUsuario varchar(20) check (tipoUsuario in ('principiante', 'intermedio', 'avanzado')) default 'principiante',
	nombre varchar(50) not null,
	password varchar(50) not null,
	email varchar(100) unique not null,
	facebook boolean not null,
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
	primary key (idElemento),
	foreign key (idUsuario) references usuarios (id) on delete cascade
);

create table entrenamientos (
	nombreElemento varchar(50),
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