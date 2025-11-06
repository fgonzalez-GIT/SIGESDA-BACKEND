-- CreateEnum
CREATE TYPE "EstadoRecibo" AS ENUM ('PENDIENTE', 'PAGADO', 'VENCIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MedioPagoTipo" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE');

-- CreateEnum
CREATE TYPE "TipoParentesco" AS ENUM ('HIJO', 'HIJA', 'CONYUGE', 'PADRE', 'MADRE', 'HERMANO', 'HERMANA', 'OTRO', 'ABUELO', 'ABUELA', 'NIETO', 'NIETA', 'TIO', 'TIA', 'SOBRINO', 'SOBRINA', 'PRIMO', 'PRIMA');

-- CreateEnum
CREATE TYPE "TipoRecibo" AS ENUM ('CUOTA', 'SUELDO', 'DEUDA', 'PAGO_ACTIVIDAD');

-- CreateEnum
CREATE TYPE "CategoriaSocioLegacy" AS ENUM ('ACTIVO', 'ESTUDIANTE', 'FAMILIAR', 'JUBILADO');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('CORO', 'CLASE_CANTO', 'CLASE_INSTRUMENTO');

-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('SOCIO', 'NO_SOCIO', 'DOCENTE', 'PROVEEDOR');

-- CreateEnum
CREATE TYPE "TipoContacto" AS ENUM ('EMAIL', 'TELEFONO', 'CELULAR', 'WHATSAPP', 'TELEGRAM', 'OTRO');

-- CreateTable
CREATE TABLE "actividades" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoActividad" NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "duracion" INTEGER,
    "capacidadMaxima" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_actividades" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_actividades" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_actividades" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dias_semana" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "orden" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dias_semana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_docentes" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_persona" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "requires_categoria" BOOLEAN NOT NULL DEFAULT false,
    "requires_especialidad" BOOLEAN NOT NULL DEFAULT false,
    "requires_cuit" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aulas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "ubicacion" TEXT,
    "equipamiento" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_socios" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "montoCuota" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_socios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comision_directiva" (
    "id" SERIAL NOT NULL,
    "socioId" INTEGER NOT NULL,
    "cargo" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comision_directiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'STRING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuotas" (
    "id" SERIAL NOT NULL,
    "reciboId" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "montoBase" DECIMAL(8,2) NOT NULL,
    "montoActividades" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "montoTotal" DECIMAL(8,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "familiares" (
    "id" SERIAL NOT NULL,
    "socioId" INTEGER NOT NULL,
    "familiarId" INTEGER NOT NULL,
    "parentesco" "TipoParentesco" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "permisoResponsableFinanciero" BOOLEAN NOT NULL DEFAULT false,
    "permisoContactoEmergencia" BOOLEAN NOT NULL DEFAULT false,
    "permisoAutorizadoRetiro" BOOLEAN NOT NULL DEFAULT false,
    "descuento" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "grupoFamiliarId" INTEGER,

    CONSTRAINT "familiares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_actividades" (
    "id" SERIAL NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes_actividades" (
    "id" SERIAL NOT NULL,
    "actividad_id" INTEGER NOT NULL,
    "docente_id" INTEGER NOT NULL,
    "rol_docente_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desasignacion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "docentes_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medios_pago" (
    "id" SERIAL NOT NULL,
    "reciboId" INTEGER NOT NULL,
    "tipo" "MedioPagoTipo" NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "numero" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banco" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medios_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoPersona",
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "numeroSocio" INTEGER,
    "categoria" "CategoriaSocioLegacy",
    "fechaIngreso" TIMESTAMP(3),
    "fechaBaja" TIMESTAMP(3),
    "motivoBaja" TEXT,
    "especialidad" TEXT,
    "honorariosPorHora" DECIMAL(10,2),
    "cuit" TEXT,
    "razonSocial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoriaId" INTEGER,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recibos" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoRecibo" NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "estado" "EstadoRecibo" NOT NULL DEFAULT 'PENDIENTE',
    "concepto" TEXT NOT NULL,
    "observaciones" TEXT,
    "emisorId" INTEGER,
    "receptorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recibos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_secciones" (
    "id" SERIAL NOT NULL,
    "seccionId" INTEGER NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participacion_actividades" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "precioEspecial" DECIMAL(8,2),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participacion_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participaciones_secciones" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "seccionId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "precioEspecial" DECIMAL(8,2),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participaciones_secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_aulas" (
    "id" SERIAL NOT NULL,
    "aulaId" INTEGER NOT NULL,
    "actividadId" INTEGER,
    "docenteId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserva_aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas_aulas_secciones" (
    "id" SERIAL NOT NULL,
    "seccionId" INTEGER NOT NULL,
    "aulaId" INTEGER NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "fechaVigencia" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_aulas_secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secciones_actividades" (
    "id" SERIAL NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT,
    "capacidadMaxima" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secciones_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_persona_catalogo" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "requires_categoria" BOOLEAN NOT NULL DEFAULT false,
    "requires_especialidad" BOOLEAN NOT NULL DEFAULT false,
    "requires_cuit" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_persona_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especialidad_docente" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "especialidad_docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona_tipo" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "tipo_persona_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desasignacion" TIMESTAMP(3),
    "categoria_id" INTEGER,
    "numero_socio" INTEGER,
    "fecha_ingreso" TIMESTAMP(3),
    "fecha_baja" TIMESTAMP(3),
    "motivo_baja" VARCHAR(200),
    "especialidad_id" INTEGER,
    "honorarios_por_hora" DECIMAL(10,2),
    "cuit" VARCHAR(11),
    "razon_social" VARCHAR(200),
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persona_tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacto_persona" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "tipo_contacto" "TipoContacto" NOT NULL,
    "valor" VARCHAR(200) NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacto_persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocenteSeccion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_actividades_codigo_key" ON "tipos_actividades"("codigo");

-- CreateIndex
CREATE INDEX "tipos_actividades_codigo_idx" ON "tipos_actividades"("codigo");

-- CreateIndex
CREATE INDEX "tipos_actividades_activo_idx" ON "tipos_actividades"("activo");

-- CreateIndex
CREATE INDEX "tipos_actividades_orden_idx" ON "tipos_actividades"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_actividades_codigo_key" ON "categorias_actividades"("codigo");

-- CreateIndex
CREATE INDEX "categorias_actividades_codigo_idx" ON "categorias_actividades"("codigo");

-- CreateIndex
CREATE INDEX "categorias_actividades_activo_idx" ON "categorias_actividades"("activo");

-- CreateIndex
CREATE INDEX "categorias_actividades_orden_idx" ON "categorias_actividades"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "estados_actividades_codigo_key" ON "estados_actividades"("codigo");

-- CreateIndex
CREATE INDEX "estados_actividades_codigo_idx" ON "estados_actividades"("codigo");

-- CreateIndex
CREATE INDEX "estados_actividades_activo_idx" ON "estados_actividades"("activo");

-- CreateIndex
CREATE INDEX "estados_actividades_orden_idx" ON "estados_actividades"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "dias_semana_codigo_key" ON "dias_semana"("codigo");

-- CreateIndex
CREATE INDEX "dias_semana_codigo_idx" ON "dias_semana"("codigo");

-- CreateIndex
CREATE INDEX "dias_semana_orden_idx" ON "dias_semana"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "roles_docentes_codigo_key" ON "roles_docentes"("codigo");

-- CreateIndex
CREATE INDEX "roles_docentes_codigo_idx" ON "roles_docentes"("codigo");

-- CreateIndex
CREATE INDEX "roles_docentes_activo_idx" ON "roles_docentes"("activo");

-- CreateIndex
CREATE INDEX "roles_docentes_orden_idx" ON "roles_docentes"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_persona_codigo_key" ON "tipos_persona"("codigo");

-- CreateIndex
CREATE INDEX "tipos_persona_codigo_idx" ON "tipos_persona"("codigo");

-- CreateIndex
CREATE INDEX "tipos_persona_activo_idx" ON "tipos_persona"("activo");

-- CreateIndex
CREATE INDEX "tipos_persona_orden_idx" ON "tipos_persona"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "aulas_nombre_key" ON "aulas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_socios_codigo_key" ON "categorias_socios"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_socios_nombre_key" ON "categorias_socios"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "comision_directiva_socioId_key" ON "comision_directiva"("socioId");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_clave_key" ON "configuracion_sistema"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_reciboId_key" ON "cuotas"("reciboId");

-- CreateIndex
CREATE INDEX "cuotas_categoriaId_idx" ON "cuotas"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_categoriaId_mes_anio_key" ON "cuotas"("categoriaId", "mes", "anio");

-- CreateIndex
CREATE INDEX "familiares_grupoFamiliarId_idx" ON "familiares"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "familiares_activo_idx" ON "familiares"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "familiares_socioId_familiarId_key" ON "familiares"("socioId", "familiarId");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_actividades_actividadId_diaSemana_horaInicio_key" ON "horarios_actividades"("actividadId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE INDEX "docentes_actividades_actividad_id_idx" ON "docentes_actividades"("actividad_id");

-- CreateIndex
CREATE INDEX "docentes_actividades_docente_id_idx" ON "docentes_actividades"("docente_id");

-- CreateIndex
CREATE INDEX "docentes_actividades_rol_docente_id_idx" ON "docentes_actividades"("rol_docente_id");

-- CreateIndex
CREATE INDEX "docentes_actividades_activo_idx" ON "docentes_actividades"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_actividades_actividad_id_docente_id_rol_docente_id_key" ON "docentes_actividades"("actividad_id", "docente_id", "rol_docente_id");

-- CreateIndex
CREATE UNIQUE INDEX "personas_dni_key" ON "personas"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "personas_email_key" ON "personas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personas_numeroSocio_key" ON "personas"("numeroSocio");

-- CreateIndex
CREATE UNIQUE INDEX "personas_cuit_key" ON "personas"("cuit");

-- CreateIndex
CREATE INDEX "personas_categoriaId_idx" ON "personas"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "recibos_numero_key" ON "recibos"("numero");

-- CreateIndex
CREATE INDEX "horarios_secciones_activo_idx" ON "horarios_secciones"("activo");

-- CreateIndex
CREATE INDEX "horarios_secciones_diaSemana_idx" ON "horarios_secciones"("diaSemana");

-- CreateIndex
CREATE INDEX "horarios_secciones_seccionId_diaSemana_horaInicio_idx" ON "horarios_secciones"("seccionId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "participacion_actividades_personaId_actividadId_key" ON "participacion_actividades"("personaId", "actividadId");

-- CreateIndex
CREATE INDEX "participaciones_secciones_activa_idx" ON "participaciones_secciones"("activa");

-- CreateIndex
CREATE INDEX "participaciones_secciones_personaId_idx" ON "participaciones_secciones"("personaId");

-- CreateIndex
CREATE INDEX "participaciones_secciones_seccionId_idx" ON "participaciones_secciones"("seccionId");

-- CreateIndex
CREATE UNIQUE INDEX "participaciones_secciones_personaId_seccionId_key" ON "participaciones_secciones"("personaId", "seccionId");

-- CreateIndex
CREATE INDEX "reservas_aulas_secciones_aulaId_diaSemana_horaInicio_idx" ON "reservas_aulas_secciones"("aulaId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE INDEX "reservas_aulas_secciones_seccionId_idx" ON "reservas_aulas_secciones"("seccionId");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_aulas_secciones_seccionId_aulaId_diaSemana_horaIni_key" ON "reservas_aulas_secciones"("seccionId", "aulaId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE INDEX "secciones_actividades_activa_idx" ON "secciones_actividades"("activa");

-- CreateIndex
CREATE INDEX "secciones_actividades_actividadId_idx" ON "secciones_actividades"("actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "secciones_actividades_actividadId_nombre_key" ON "secciones_actividades"("actividadId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_persona_catalogo_codigo_key" ON "tipo_persona_catalogo"("codigo");

-- CreateIndex
CREATE INDEX "tipo_persona_catalogo_codigo_idx" ON "tipo_persona_catalogo"("codigo");

-- CreateIndex
CREATE INDEX "tipo_persona_catalogo_activo_idx" ON "tipo_persona_catalogo"("activo");

-- CreateIndex
CREATE INDEX "tipo_persona_catalogo_orden_idx" ON "tipo_persona_catalogo"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "especialidad_docente_codigo_key" ON "especialidad_docente"("codigo");

-- CreateIndex
CREATE INDEX "especialidad_docente_codigo_idx" ON "especialidad_docente"("codigo");

-- CreateIndex
CREATE INDEX "especialidad_docente_activo_idx" ON "especialidad_docente"("activo");

-- CreateIndex
CREATE INDEX "persona_tipo_persona_id_idx" ON "persona_tipo"("persona_id");

-- CreateIndex
CREATE INDEX "persona_tipo_tipo_persona_id_idx" ON "persona_tipo"("tipo_persona_id");

-- CreateIndex
CREATE INDEX "persona_tipo_activo_idx" ON "persona_tipo"("activo");

-- CreateIndex
CREATE INDEX "persona_tipo_categoria_id_idx" ON "persona_tipo"("categoria_id");

-- CreateIndex
CREATE INDEX "persona_tipo_especialidad_id_idx" ON "persona_tipo"("especialidad_id");

-- CreateIndex
CREATE INDEX "persona_tipo_numero_socio_idx" ON "persona_tipo"("numero_socio");

-- CreateIndex
CREATE UNIQUE INDEX "persona_tipo_persona_id_tipo_persona_id_key" ON "persona_tipo"("persona_id", "tipo_persona_id");

-- CreateIndex
CREATE INDEX "contacto_persona_persona_id_idx" ON "contacto_persona"("persona_id");

-- CreateIndex
CREATE INDEX "contacto_persona_tipo_contacto_idx" ON "contacto_persona"("tipo_contacto");

-- CreateIndex
CREATE INDEX "contacto_persona_activo_idx" ON "contacto_persona"("activo");

-- CreateIndex
CREATE INDEX "contacto_persona_principal_idx" ON "contacto_persona"("principal");

-- CreateIndex
CREATE UNIQUE INDEX "_DocenteSeccion_AB_unique" ON "_DocenteSeccion"("A", "B");

-- CreateIndex
CREATE INDEX "_DocenteSeccion_B_index" ON "_DocenteSeccion"("B");

-- AddForeignKey
ALTER TABLE "comision_directiva" ADD CONSTRAINT "comision_directiva_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_socios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "recibos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiares" ADD CONSTRAINT "familiares_familiarId_fkey" FOREIGN KEY ("familiarId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiares" ADD CONSTRAINT "familiares_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_actividades" ADD CONSTRAINT "horarios_actividades_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_actividades" ADD CONSTRAINT "docentes_actividades_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_actividades" ADD CONSTRAINT "docentes_actividades_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_actividades" ADD CONSTRAINT "docentes_actividades_rol_docente_id_fkey" FOREIGN KEY ("rol_docente_id") REFERENCES "roles_docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medios_pago" ADD CONSTRAINT "medios_pago_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "recibos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_socios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_secciones" ADD CONSTRAINT "horarios_secciones_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacion_actividades" ADD CONSTRAINT "participacion_actividades_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacion_actividades" ADD CONSTRAINT "participacion_actividades_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participaciones_secciones" ADD CONSTRAINT "participaciones_secciones_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participaciones_secciones" ADD CONSTRAINT "participaciones_secciones_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_aulas_secciones" ADD CONSTRAINT "reservas_aulas_secciones_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_aulas_secciones" ADD CONSTRAINT "reservas_aulas_secciones_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones_actividades" ADD CONSTRAINT "secciones_actividades_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_tipo" ADD CONSTRAINT "persona_tipo_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_tipo" ADD CONSTRAINT "persona_tipo_tipo_persona_id_fkey" FOREIGN KEY ("tipo_persona_id") REFERENCES "tipo_persona_catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_tipo" ADD CONSTRAINT "persona_tipo_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_socios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_tipo" ADD CONSTRAINT "persona_tipo_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "especialidad_docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacto_persona" ADD CONSTRAINT "contacto_persona_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocenteSeccion" ADD CONSTRAINT "_DocenteSeccion_A_fkey" FOREIGN KEY ("A") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocenteSeccion" ADD CONSTRAINT "_DocenteSeccion_B_fkey" FOREIGN KEY ("B") REFERENCES "secciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
