-- Up Migration

alter table usuarios add dstRecorrida int default 0;

-- Down Migration