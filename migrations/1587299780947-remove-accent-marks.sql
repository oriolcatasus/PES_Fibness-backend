-- Up Migration

drop table alimentos cascade;

create table alimentos (
	idAlimento serial,
	nombre varchar(50),
	descripcion varchar(300),
	calorias Integer,
	idComida int,
	primary key (idAlimento),
	foreign key (idComida) references comidas (idComida) on delete cascade
);

-- Down Migration
