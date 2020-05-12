-- Up Migration

alter table comentarios add nLikes int default 0;

-- Down Migration
