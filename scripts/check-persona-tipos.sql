-- Ver tipos actuales de persona 22
SELECT pt.id, pt.persona_id, pt.tipo_persona_id, tpc.codigo, pt.activo
FROM persona_tipo pt
JOIN tipo_persona_catalogo tpc ON pt.tipo_persona_id = tpc.id
WHERE pt.persona_id = 22;
