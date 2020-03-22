
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
	fechaDeRegistro date default CURRENT_DATE,
	provincia varchar(50),
	tipoPerfil varchar(30) check (tipoPerfil in ('privado', 'publico')) default 'publico',
	primary key (id),
	foreign key (provincia) references provincias(nombre)
);

create table elementos(
	nombre varchar(50),
	descripcion varchar(300),
	idUsuario int,
	primary key (idUsuario, nombre),
	foreign key (idUsuario) references usuarios (id)
);

create table entrenamientos (
	nombreElemento varchar(50),
	idUsuario int,
	primary key (nombreElemento, idUsuario),
	foreign key (nombreElemento, idUsuario) references elementos (nombre, idUsuario)
);

create table actividades (
	nombre varchar(50),
	descripción varchar(50),
	tiempoEjecucion Integer,
	nombreEntrenamiento varchar(50),
	idUsuario int,
	primary key (nombreEntrenamiento, idUsuario, nombre),
	foreign key (nombreEntrenamiento, idUsuario) references entrenamientos (nombreElemento, idUsuario)
);

create table deportes (
	nombreEntrenamiento varchar(50),
	nombreActividad varchar(50),
	idUsuario int,
	primary key (nombreActividad, idUsuario, nombreEntrenamiento),
	foreign key (nombreActividad, idUsuario, nombreEntrenamiento) references actividades (nombre, idUsuario, nombreEntrenamiento)
);

create table ejercicios (
	numSets Integer,
	numRepeticiones Integer,
	tiempoDescanso Integer,
	nombreEntrenamiento varchar(50),
	nombreActividad varchar(50),
	idUsuario int,
	primary key (nombreActividad, idUsuario, nombreEntrenamiento),
	foreign key (nombreActividad, idUsuario, nombreEntrenamiento) references actividades (nombre, idUsuario, nombreEntrenamiento)
);
