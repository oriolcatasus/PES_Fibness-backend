-- Up Migration

alter table usuarios drop column rutaImagen;
alter table usuarios add rutaImagen varchar(300) default null;

alter table usuarios drop column nFollowers;
alter table usuarios add nSeguidores int not null default 0;

alter table usuarios drop column nFollowing;
alter table usuarios add nSeguidos int not null default 0;

alter table usuarios drop column nPost;
alter table usuarios add nPost int not null default 0;

alter table usuarios drop column sAge;
alter table usuarios add sEdad boolean not null default true;

alter table usuarios drop column sDistance;
alter table usuarios add sDistancia boolean not null default true;

alter table usuarios drop column sInvitation;
alter table usuarios add sInvitacion boolean not null default true;

alter table usuarios drop column sFollower;
alter table usuarios add sSeguidor boolean not null default true;

alter table usuarios drop column nMessage;
alter table usuarios add nMensaje boolean not null default true;



-- Down Migration


