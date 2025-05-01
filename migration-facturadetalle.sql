-- Paso 1: Eliminar las restricciones de clave foránea existentes
ALTER TABLE facturadetalle DROP CONSTRAINT IF EXISTS "FK_5c54dc050ac242cf3c771a6ff56"; -- Restricción para factura
ALTER TABLE facturadetalle DROP CONSTRAINT IF EXISTS "FK_facturadetalle_producto"; -- Restricción para producto (el nombre puede variar)

-- Paso 2: Eliminar las columnas redundantes si existen
ALTER TABLE facturadetalle DROP COLUMN IF EXISTS "facturaFacNumero";
ALTER TABLE facturadetalle DROP COLUMN IF EXISTS "productoProCodigo";

-- Paso 3: Crear nuevas restricciones de clave foránea usando los campos primarios
ALTER TABLE facturadetalle 
  ADD CONSTRAINT "FK_facturadetalle_factura" 
  FOREIGN KEY ("facNumero") 
  REFERENCES facturas("facNumero") 
  ON DELETE CASCADE;

ALTER TABLE facturadetalle 
  ADD CONSTRAINT "FK_facturadetalle_producto" 
  FOREIGN KEY ("facProducto") 
  REFERENCES productos("proCodigo") 
  ON DELETE SET NULL;
