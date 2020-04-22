-- Up Migration

alter table usuarios add rutaImagen varchar(300);
alter table usuarios add nFollowers int;
alter table usuarios add nFollowing int;
alter table usuarios add nPost int;
alter table usuarios add sAge boolean;
alter table usuarios add sDistance boolean;
alter table usuarios add sInvitation boolean;
alter table usuarios add sFollower boolean;
alter table usuarios add nMessage boolean;

-- Down Migration
