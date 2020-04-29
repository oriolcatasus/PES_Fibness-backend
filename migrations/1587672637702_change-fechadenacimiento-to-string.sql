-- Up Migration
alter table usuarios
drop column fechadenacimiento;

alter table usuarios
add column fechadenacimiento char(10);
-- Down Migration