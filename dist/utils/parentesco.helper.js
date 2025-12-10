"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARENTESCOS_ASIMETRICOS = exports.PARENTESCOS_SIMETRICOS = exports.PARENTESCOS_SEGUNDO_GRADO = exports.PARENTESCOS_PRIMER_GRADO = exports.GradoParentesco = exports.PARENTESCO_COMPLEMENTARIO = void 0;
exports.getGradoParentesco = getGradoParentesco;
exports.getParentescoComplementario = getParentescoComplementario;
exports.isParentescoSimetrico = isParentescoSimetrico;
exports.areParentescosComplementarios = areParentescosComplementarios;
exports.getRelacionBidireccionalDescripcion = getRelacionBidireccionalDescripcion;
exports.validateRelacionBidireccional = validateRelacionBidireccional;
exports.getInfoParentesco = getInfoParentesco;
exports.getParentescoComplementarioConGenero = getParentescoComplementarioConGenero;
exports.validateParentescoGenero = validateParentescoGenero;
const client_1 = require("@prisma/client");
exports.PARENTESCO_COMPLEMENTARIO = {
    [client_1.TipoParentesco.PADRE]: client_1.TipoParentesco.HIJO,
    [client_1.TipoParentesco.MADRE]: client_1.TipoParentesco.HIJA,
    [client_1.TipoParentesco.HIJO]: client_1.TipoParentesco.PADRE,
    [client_1.TipoParentesco.HIJA]: client_1.TipoParentesco.MADRE,
    [client_1.TipoParentesco.HERMANO]: client_1.TipoParentesco.HERMANO,
    [client_1.TipoParentesco.HERMANA]: client_1.TipoParentesco.HERMANA,
    [client_1.TipoParentesco.CONYUGE]: client_1.TipoParentesco.CONYUGE,
    [client_1.TipoParentesco.ESPOSA]: client_1.TipoParentesco.ESPOSO,
    [client_1.TipoParentesco.ESPOSO]: client_1.TipoParentesco.ESPOSA,
    [client_1.TipoParentesco.ABUELO]: client_1.TipoParentesco.NIETO,
    [client_1.TipoParentesco.ABUELA]: client_1.TipoParentesco.NIETA,
    [client_1.TipoParentesco.NIETO]: client_1.TipoParentesco.ABUELO,
    [client_1.TipoParentesco.NIETA]: client_1.TipoParentesco.ABUELA,
    [client_1.TipoParentesco.TIO]: client_1.TipoParentesco.SOBRINO,
    [client_1.TipoParentesco.TIA]: client_1.TipoParentesco.SOBRINA,
    [client_1.TipoParentesco.SOBRINO]: client_1.TipoParentesco.TIO,
    [client_1.TipoParentesco.SOBRINA]: client_1.TipoParentesco.TIA,
    [client_1.TipoParentesco.PRIMO]: client_1.TipoParentesco.PRIMO,
    [client_1.TipoParentesco.PRIMA]: client_1.TipoParentesco.PRIMA,
    [client_1.TipoParentesco.OTRO]: client_1.TipoParentesco.OTRO
};
var GradoParentesco;
(function (GradoParentesco) {
    GradoParentesco["PRIMER_GRADO"] = "PRIMER_GRADO";
    GradoParentesco["SEGUNDO_GRADO"] = "SEGUNDO_GRADO";
    GradoParentesco["OTRO"] = "OTRO";
})(GradoParentesco || (exports.GradoParentesco = GradoParentesco = {}));
exports.PARENTESCOS_PRIMER_GRADO = [
    client_1.TipoParentesco.PADRE,
    client_1.TipoParentesco.MADRE,
    client_1.TipoParentesco.HIJO,
    client_1.TipoParentesco.HIJA,
    client_1.TipoParentesco.HERMANO,
    client_1.TipoParentesco.HERMANA,
    client_1.TipoParentesco.CONYUGE,
    client_1.TipoParentesco.ESPOSA,
    client_1.TipoParentesco.ESPOSO
];
exports.PARENTESCOS_SEGUNDO_GRADO = [
    client_1.TipoParentesco.ABUELO,
    client_1.TipoParentesco.ABUELA,
    client_1.TipoParentesco.NIETO,
    client_1.TipoParentesco.NIETA,
    client_1.TipoParentesco.TIO,
    client_1.TipoParentesco.TIA,
    client_1.TipoParentesco.SOBRINO,
    client_1.TipoParentesco.SOBRINA,
    client_1.TipoParentesco.PRIMO,
    client_1.TipoParentesco.PRIMA
];
function getGradoParentesco(parentesco) {
    if (exports.PARENTESCOS_PRIMER_GRADO.includes(parentesco)) {
        return GradoParentesco.PRIMER_GRADO;
    }
    if (exports.PARENTESCOS_SEGUNDO_GRADO.includes(parentesco)) {
        return GradoParentesco.SEGUNDO_GRADO;
    }
    return GradoParentesco.OTRO;
}
exports.PARENTESCOS_SIMETRICOS = [
    client_1.TipoParentesco.HERMANO,
    client_1.TipoParentesco.HERMANA,
    client_1.TipoParentesco.PRIMO,
    client_1.TipoParentesco.PRIMA,
    client_1.TipoParentesco.CONYUGE,
    client_1.TipoParentesco.OTRO
];
exports.PARENTESCOS_ASIMETRICOS = [
    client_1.TipoParentesco.PADRE,
    client_1.TipoParentesco.MADRE,
    client_1.TipoParentesco.HIJO,
    client_1.TipoParentesco.HIJA,
    client_1.TipoParentesco.ABUELO,
    client_1.TipoParentesco.ABUELA,
    client_1.TipoParentesco.NIETO,
    client_1.TipoParentesco.NIETA,
    client_1.TipoParentesco.TIO,
    client_1.TipoParentesco.TIA,
    client_1.TipoParentesco.SOBRINO,
    client_1.TipoParentesco.SOBRINA,
    client_1.TipoParentesco.ESPOSA,
    client_1.TipoParentesco.ESPOSO
];
function getParentescoComplementario(parentesco) {
    return exports.PARENTESCO_COMPLEMENTARIO[parentesco];
}
function isParentescoSimetrico(parentesco) {
    return exports.PARENTESCO_COMPLEMENTARIO[parentesco] === parentesco;
}
function areParentescosComplementarios(parentesco1, parentesco2) {
    return exports.PARENTESCO_COMPLEMENTARIO[parentesco1] === parentesco2 &&
        exports.PARENTESCO_COMPLEMENTARIO[parentesco2] === parentesco1;
}
function getRelacionBidireccionalDescripcion(nombreA, parentescoAB, nombreB) {
    const parentescoBA = getParentescoComplementario(parentescoAB);
    return `${nombreA} es ${parentescoAB} de ${nombreB}, y ${nombreB} es ${parentescoBA} de ${nombreA}`;
}
function validateRelacionBidireccional(relacion1, relacion2) {
    if (relacion1.desdeId !== relacion2.haciaId || relacion1.haciaId !== relacion2.desdeId) {
        return {
            valid: false,
            error: 'Las relaciones no son entre las mismas personas'
        };
    }
    if (!areParentescosComplementarios(relacion1.parentesco, relacion2.parentesco)) {
        return {
            valid: false,
            error: `Los parentescos ${relacion1.parentesco} y ${relacion2.parentesco} no son complementarios`
        };
    }
    return { valid: true };
}
function getInfoParentesco(parentesco) {
    return {
        grado: getGradoParentesco(parentesco),
        complementario: getParentescoComplementario(parentesco),
        simetrico: isParentescoSimetrico(parentesco)
    };
}
function getParentescoComplementarioConGenero(parentesco, generoDestino) {
    const relacionesSinGenero = [
        client_1.TipoParentesco.CONYUGE,
        client_1.TipoParentesco.ESPOSA,
        client_1.TipoParentesco.ESPOSO,
        client_1.TipoParentesco.OTRO
    ];
    if (relacionesSinGenero.includes(parentesco)) {
        return exports.PARENTESCO_COMPLEMENTARIO[parentesco];
    }
    const usarMasculino = !generoDestino || generoDestino === 'NO_BINARIO' || generoDestino === 'PREFIERO_NO_DECIR';
    const esFemenino = generoDestino === 'FEMENINO';
    if (parentesco === client_1.TipoParentesco.PADRE || parentesco === client_1.TipoParentesco.MADRE) {
        return esFemenino ? client_1.TipoParentesco.HIJA : client_1.TipoParentesco.HIJO;
    }
    if (parentesco === client_1.TipoParentesco.HIJO || parentesco === client_1.TipoParentesco.HIJA) {
        return esFemenino ? client_1.TipoParentesco.MADRE : client_1.TipoParentesco.PADRE;
    }
    if (parentesco === client_1.TipoParentesco.HERMANO || parentesco === client_1.TipoParentesco.HERMANA) {
        return esFemenino ? client_1.TipoParentesco.HERMANA : client_1.TipoParentesco.HERMANO;
    }
    if (parentesco === client_1.TipoParentesco.ABUELO || parentesco === client_1.TipoParentesco.ABUELA) {
        return esFemenino ? client_1.TipoParentesco.NIETA : client_1.TipoParentesco.NIETO;
    }
    if (parentesco === client_1.TipoParentesco.NIETO || parentesco === client_1.TipoParentesco.NIETA) {
        return esFemenino ? client_1.TipoParentesco.ABUELA : client_1.TipoParentesco.ABUELO;
    }
    if (parentesco === client_1.TipoParentesco.TIO || parentesco === client_1.TipoParentesco.TIA) {
        return esFemenino ? client_1.TipoParentesco.SOBRINA : client_1.TipoParentesco.SOBRINO;
    }
    if (parentesco === client_1.TipoParentesco.SOBRINO || parentesco === client_1.TipoParentesco.SOBRINA) {
        return esFemenino ? client_1.TipoParentesco.TIA : client_1.TipoParentesco.TIO;
    }
    if (parentesco === client_1.TipoParentesco.PRIMO || parentesco === client_1.TipoParentesco.PRIMA) {
        return esFemenino ? client_1.TipoParentesco.PRIMA : client_1.TipoParentesco.PRIMO;
    }
    return exports.PARENTESCO_COMPLEMENTARIO[parentesco];
}
function validateParentescoGenero(parentesco, genero) {
    if (!genero || genero === 'NO_BINARIO' || genero === 'PREFIERO_NO_DECIR') {
        return { valid: true };
    }
    const parentescosMasculinos = [
        client_1.TipoParentesco.HIJO,
        client_1.TipoParentesco.PADRE,
        client_1.TipoParentesco.HERMANO,
        client_1.TipoParentesco.ABUELO,
        client_1.TipoParentesco.NIETO,
        client_1.TipoParentesco.TIO,
        client_1.TipoParentesco.SOBRINO,
        client_1.TipoParentesco.PRIMO,
        client_1.TipoParentesco.ESPOSO
    ];
    const parentescosFemeninos = [
        client_1.TipoParentesco.HIJA,
        client_1.TipoParentesco.MADRE,
        client_1.TipoParentesco.HERMANA,
        client_1.TipoParentesco.ABUELA,
        client_1.TipoParentesco.NIETA,
        client_1.TipoParentesco.TIA,
        client_1.TipoParentesco.SOBRINA,
        client_1.TipoParentesco.PRIMA,
        client_1.TipoParentesco.ESPOSA
    ];
    if (genero === 'MASCULINO' && parentescosFemeninos.includes(parentesco)) {
        return {
            valid: true,
            warning: `Posible inconsistencia: persona con género MASCULINO asignada como ${parentesco} (parentesco femenino)`
        };
    }
    if (genero === 'FEMENINO' && parentescosMasculinos.includes(parentesco)) {
        return {
            valid: true,
            warning: `Posible inconsistencia: persona con género FEMENINO asignada como ${parentesco} (parentesco masculino)`
        };
    }
    return { valid: true };
}
//# sourceMappingURL=parentesco.helper.js.map