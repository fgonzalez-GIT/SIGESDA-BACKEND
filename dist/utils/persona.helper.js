"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIPOS_MUTUAMENTE_EXCLUYENTES = void 0;
exports.validateTiposMutuamenteExcluyentes = validateTiposMutuamenteExcluyentes;
exports.canAgregarTipo = canAgregarTipo;
exports.getTiposExcluyentes = getTiposExcluyentes;
exports.sonTiposExcluyentes = sonTiposExcluyentes;
exports.hasActiveTipo = hasActiveTipo;
exports.getActiveTipos = getActiveTipos;
exports.isPersonaActiva = isPersonaActiva;
exports.darDeBajaPersona = darDeBajaPersona;
exports.reactivarPersona = reactivarPersona;
exports.TIPOS_MUTUAMENTE_EXCLUYENTES = {
    SOCIO: ['NO_SOCIO'],
    NO_SOCIO: ['SOCIO']
};
function validateTiposMutuamenteExcluyentes(tiposCodigos) {
    const tieneSocio = tiposCodigos.includes('SOCIO');
    const tieneNoSocio = tiposCodigos.includes('NO_SOCIO');
    if (tieneSocio && tieneNoSocio) {
        return {
            valid: false,
            error: 'SOCIO y NO_SOCIO son mutuamente excluyentes. Una persona no puede ser SOCIO y NO_SOCIO al mismo tiempo.'
        };
    }
    return { valid: true };
}
function canAgregarTipo(tiposExistentes, nuevoTipo) {
    const tiposExcluyentes = exports.TIPOS_MUTUAMENTE_EXCLUYENTES[nuevoTipo] || [];
    const tiposConflictivos = [];
    for (const tipoExistente of tiposExistentes) {
        if (tiposExcluyentes.includes(tipoExistente)) {
            tiposConflictivos.push(tipoExistente);
        }
    }
    if (tiposConflictivos.length > 0) {
        return {
            valid: true,
            tiposAReemplazar: tiposConflictivos,
            requiresAutoReplace: true
        };
    }
    return { valid: true, tiposAReemplazar: [] };
}
function getTiposExcluyentes(tipoCodigo) {
    return exports.TIPOS_MUTUAMENTE_EXCLUYENTES[tipoCodigo] || [];
}
function sonTiposExcluyentes(tipo1, tipo2) {
    const excluyentesDeTipo1 = exports.TIPOS_MUTUAMENTE_EXCLUYENTES[tipo1] || [];
    const excluyentesDeTipo2 = exports.TIPOS_MUTUAMENTE_EXCLUYENTES[tipo2] || [];
    return excluyentesDeTipo1.includes(tipo2) || excluyentesDeTipo2.includes(tipo1);
}
const client_1 = require("@prisma/client");
let prismaInstance = null;
function getPrismaInstance() {
    if (!prismaInstance) {
        prismaInstance = new client_1.PrismaClient();
    }
    return prismaInstance;
}
async function hasActiveTipo(personaId, tipoCodigo, prisma) {
    const client = prisma || getPrismaInstance();
    const tipos = await client.personaTipo.count({
        where: {
            personaId,
            activo: true,
            tipoPersona: { codigo: tipoCodigo }
        }
    });
    return tipos > 0;
}
async function getActiveTipos(personaId, prisma) {
    const client = prisma || getPrismaInstance();
    const tipos = await client.personaTipo.findMany({
        where: {
            personaId,
            activo: true
        },
        include: {
            tipoPersona: true
        }
    });
    return tipos.map(t => t.tipoPersona.codigo);
}
async function isPersonaActiva(personaId, prisma) {
    const client = prisma || getPrismaInstance();
    const persona = await client.persona.findUnique({
        where: { id: personaId },
        select: { activo: true }
    });
    return persona?.activo ?? false;
}
async function darDeBajaPersona(personaId, motivoBaja, prisma) {
    const client = prisma || getPrismaInstance();
    return client.persona.update({
        where: { id: personaId },
        data: {
            activo: false,
            fechaBaja: new Date(),
            motivoBaja: motivoBaja || 'Sin especificar'
        }
    });
}
async function reactivarPersona(personaId, prisma) {
    const client = prisma || getPrismaInstance();
    return client.persona.update({
        where: { id: personaId },
        data: {
            activo: true,
            fechaBaja: null,
            motivoBaja: null
        }
    });
}
//# sourceMappingURL=persona.helper.js.map