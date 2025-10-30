import { PrismaClient, TipoContacto } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Personas V2...\n');

  // ============================================================================
  // 1. CATÁLOGO: TIPOS DE PERSONA
  // ============================================================================
  console.log('📚 1. Creando Tipos de Persona...');

  const tipoNoSocio = await prisma.tipoPersonaCatalogo.upsert({
    where: { codigo: 'NO_SOCIO' },
    update: {},
    create: {
      codigo: 'NO_SOCIO',
      nombre: 'No Socio',
      descripcion: 'Persona sin membresía de socio',
      orden: 1,
      activo: true,
      requiresCategoria: false,
      requiresEspecialidad: false,
      requiresCuit: false
    }
  });
  console.log('  ✓ NO_SOCIO');

  const tipoSocio = await prisma.tipoPersonaCatalogo.upsert({
    where: { codigo: 'SOCIO' },
    update: {},
    create: {
      codigo: 'SOCIO',
      nombre: 'Socio',
      descripcion: 'Miembro activo de la asociación',
      orden: 2,
      activo: true,
      requiresCategoria: true,
      requiresEspecialidad: false,
      requiresCuit: false
    }
  });
  console.log('  ✓ SOCIO');

  const tipoDocente = await prisma.tipoPersonaCatalogo.upsert({
    where: { codigo: 'DOCENTE' },
    update: {},
    create: {
      codigo: 'DOCENTE',
      nombre: 'Docente',
      descripcion: 'Profesor o instructor',
      orden: 3,
      activo: true,
      requiresCategoria: false,
      requiresEspecialidad: true,
      requiresCuit: false
    }
  });
  console.log('  ✓ DOCENTE');

  const tipoProveedor = await prisma.tipoPersonaCatalogo.upsert({
    where: { codigo: 'PROVEEDOR' },
    update: {},
    create: {
      codigo: 'PROVEEDOR',
      nombre: 'Proveedor',
      descripcion: 'Proveedor de bienes o servicios',
      orden: 4,
      activo: true,
      requiresCategoria: false,
      requiresEspecialidad: false,
      requiresCuit: true
    }
  });
  console.log('  ✓ PROVEEDOR\n');

  // ============================================================================
  // 2. CATÁLOGO: ESPECIALIDADES DOCENTES
  // ============================================================================
  console.log('🎼 2. Creando Especialidades Docentes...');

  const especialidades = [
    {
      codigo: 'GENERAL',
      nombre: 'General',
      descripcion: 'Docente de formación general',
      orden: 1
    },
    {
      codigo: 'CANTO',
      nombre: 'Canto',
      descripcion: 'Especialista en técnica vocal',
      orden: 2
    },
    {
      codigo: 'PIANO',
      nombre: 'Piano',
      descripcion: 'Profesor de piano',
      orden: 3
    },
    {
      codigo: 'GUITARRA',
      nombre: 'Guitarra',
      descripcion: 'Profesor de guitarra',
      orden: 4
    },
    {
      codigo: 'VIOLIN',
      nombre: 'Violín',
      descripcion: 'Profesor de violín',
      orden: 5
    },
    {
      codigo: 'TEORIA',
      nombre: 'Teoría Musical',
      descripcion: 'Especialista en teoría y armonía',
      orden: 6
    },
    {
      codigo: 'CORO',
      nombre: 'Director de Coro',
      descripcion: 'Director coral',
      orden: 7
    }
  ];

  const especialidadesCreadas: any = {};
  for (const esp of especialidades) {
    const created = await prisma.especialidadDocente.upsert({
      where: { codigo: esp.codigo },
      update: {},
      create: {
        ...esp,
        activo: true
      }
    });
    especialidadesCreadas[esp.codigo] = created;
    console.log(`  ✓ ${esp.nombre}`);
  }
  console.log('');

  // ============================================================================
  // LIMPIAR DATOS OPERACIONALES EXISTENTES Y CATEGORÍAS DUPLICADAS
  // ============================================================================
  console.log('🧹 Limpiando datos operacionales...');
  await prisma.contactoPersona.deleteMany();
  await prisma.personaTipo.deleteMany();
  await prisma.persona.deleteMany();

  // Limpiar TODAS las categorías de socios (incluyendo las del seed.ts principal)
  await prisma.categoriaSocio.deleteMany({});
  console.log('  ✓ Datos limpiados\n');

  // ============================================================================
  // 3. CATÁLOGO: CATEGORÍAS DE SOCIOS
  // ============================================================================
  console.log('🏅 3. Creando Categorías de Socios...');

  const categorias = [
    {
      codigo: 'ACTIVO',
      nombre: 'Socio Activo',
      descripcion: 'Socio con todos los derechos y obligaciones',
      montoCuota: 5000,
      descuento: 0,
      orden: 1
    },
    {
      codigo: 'VITALICIO',
      nombre: 'Socio Vitalicio',
      descripcion: 'Socio con membresía vitalicia',
      montoCuota: 0,
      descuento: 100,
      orden: 2
    },
    {
      codigo: 'HONORARIO',
      nombre: 'Socio Honorario',
      descripcion: 'Socio honorario',
      montoCuota: 0,
      descuento: 100,
      orden: 3
    },
    {
      codigo: 'ADHERENTE',
      nombre: 'Socio Adherente',
      descripcion: 'Socio con derechos limitados',
      montoCuota: 3000,
      descuento: 40,
      orden: 4
    }
  ];

  const categoriasCreadas: any = {};
  for (const cat of categorias) {
    const created = await prisma.categoriaSocio.create({
      data: {
        ...cat,
        activa: true
      }
    });
    categoriasCreadas[cat.codigo] = created;
    console.log(`  ✓ ${cat.nombre}`);
  }
  console.log('');

  // ============================================================================
  // 4. PERSONAS - EJEMPLOS POR TIPO
  // ============================================================================
  console.log('👥 4. Creando Personas de Ejemplo...\n');

  // ============================================================================
  // 4.1 NO_SOCIO - Persona básica
  // ============================================================================
  console.log('  🔹 NO_SOCIO:');

  const noSocio1 = await prisma.persona.create({
    data: {
      nombre: 'María',
      apellido: 'González',
      dni: '12345678',
      direccion: 'Av. Corrientes 1234, CABA',
      fechaNacimiento: new Date('1985-03-15'),
      tipos: {
        create: {
          tipoPersonaId: tipoNoSocio.id,
          activo: true
        }
      },
      contactos: {
        create: [
          {
            tipoContacto: TipoContacto.EMAIL,
            valor: 'maria.gonzalez@example.com',
            principal: true,
            activo: true
          },
          {
            tipoContacto: TipoContacto.TELEFONO,
            valor: '1145678901',
            principal: true,
            activo: true
          }
        ]
      }
    },
    include: {
      tipos: true,
      contactos: true
    }
  });
  console.log(`     ✓ ${noSocio1.nombre} ${noSocio1.apellido} (DNI: ${noSocio1.dni})`);

  const noSocio2 = await prisma.persona.create({
    data: {
      nombre: 'Roberto',
      apellido: 'Fernández',
      dni: '23456789',
      tipos: {
        create: {
          tipoPersonaId: tipoNoSocio.id,
          activo: true
        }
      }
    }
  });
  console.log(`     ✓ ${noSocio2.nombre} ${noSocio2.apellido} (DNI: ${noSocio2.dni})`);
  console.log('');

  // ============================================================================
  // 4.2 SOCIO - Con categoría
  // ============================================================================
  console.log('  🔹 SOCIO:');

  let numeroSocioCounter = 100;

  const socio1 = await prisma.persona.create({
    data: {
      nombre: 'Carlos',
      apellido: 'López',
      dni: '34567890',
      tipos: {
        create: {
          tipoPersonaId: tipoSocio.id,
          categoriaId: categoriasCreadas.ACTIVO.id,
          numeroSocio: numeroSocioCounter++,
          fechaIngreso: new Date(),
          activo: true
        }
      },
      contactos: {
        create: {
          tipoContacto: TipoContacto.EMAIL,
          valor: 'carlos.lopez@example.com',
          principal: true,
          activo: true
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          categoria: true
        }
      }
    }
  });
  console.log(`     ✓ ${socio1.nombre} ${socio1.apellido} - Socio #${socio1.tipos[0].numeroSocio}`);

  const socio2 = await prisma.persona.create({
    data: {
      nombre: 'Laura',
      apellido: 'Martínez',
      dni: '45678901',
      direccion: 'San Martin 567, CABA',
      fechaNacimiento: new Date('1978-08-22'),
      tipos: {
        create: {
          tipoPersonaId: tipoSocio.id,
          categoriaId: categoriasCreadas.VITALICIO.id,
          numeroSocio: numeroSocioCounter++,
          fechaIngreso: new Date('2020-01-15'),
          observaciones: 'Socia fundadora',
          activo: true
        }
      },
      contactos: {
        createMany: {
          data: [
            {
              tipoContacto: TipoContacto.EMAIL,
              valor: 'laura.martinez@example.com',
              principal: true,
              activo: true
            },
            {
              tipoContacto: TipoContacto.TELEFONO,
              valor: '1156789012',
              principal: true,
              activo: true
            }
          ]
        }
      }
    }
  });

  // Obtener socio2 con includes para mostrar info
  const socio2WithTipos = await prisma.persona.findUnique({
    where: { id: socio2.id },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          categoria: true
        }
      }
    }
  });

  console.log(`     ✓ ${socio2.nombre} ${socio2.apellido} - Socio #${socio2WithTipos?.tipos[0]?.numeroSocio} (Vitalicio)`);
  console.log('');

  // ============================================================================
  // 4.3 DOCENTE - Con especialidad
  // ============================================================================
  console.log('  🔹 DOCENTE:');

  const docente1 = await prisma.persona.create({
    data: {
      nombre: 'Ana',
      apellido: 'Rodríguez',
      dni: '56789012',
      tipos: {
        create: {
          tipoPersonaId: tipoDocente.id,
          especialidadId: especialidadesCreadas.CANTO.id,
          honorariosPorHora: 5000,
          activo: true
        }
      },
      contactos: {
        createMany: {
          data: [
            {
              tipoContacto: TipoContacto.EMAIL,
              valor: 'ana.rodriguez@example.com',
              principal: true,
              activo: true
            },
            {
              tipoContacto: TipoContacto.TELEFONO,
              valor: '1167890123',
              principal: true,
              activo: true
            }
          ]
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          especialidad: true
        }
      }
    }
  });
  console.log(`     ✓ ${docente1.nombre} ${docente1.apellido} - ${docente1.tipos[0].especialidad?.nombre}`);

  const docente2 = await prisma.persona.create({
    data: {
      nombre: 'Miguel',
      apellido: 'Sánchez',
      dni: '67890123',
      tipos: {
        create: {
          tipoPersonaId: tipoDocente.id,
          especialidadId: especialidadesCreadas.GENERAL.id,
          activo: true
        }
      },
      contactos: {
        create: {
          tipoContacto: TipoContacto.EMAIL,
          valor: 'miguel.sanchez@example.com',
          principal: true,
          activo: true
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          especialidad: true
        }
      }
    }
  });
  console.log(`     ✓ ${docente2.nombre} ${docente2.apellido} - ${docente2.tipos[0].especialidad?.nombre}`);
  console.log('');

  // ============================================================================
  // 4.4 PROVEEDOR - Con CUIT y razón social
  // ============================================================================
  console.log('  🔹 PROVEEDOR:');

  const proveedor1 = await prisma.persona.create({
    data: {
      nombre: 'Empresa',
      apellido: 'Musical SRL',
      dni: '20123456',
      tipos: {
        create: {
          tipoPersonaId: tipoProveedor.id,
          cuit: '20301234563',
          razonSocial: 'Empresa Musical Sociedad de Responsabilidad Limitada',
          activo: true
        }
      },
      contactos: {
        createMany: {
          data: [
            {
              tipoContacto: TipoContacto.EMAIL,
              valor: 'contacto@empresamusical.com',
              principal: true,
              activo: true
            },
            {
              tipoContacto: TipoContacto.TELEFONO,
              valor: '1178901234',
              principal: true,
              activo: true
            }
          ]
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true
        }
      }
    }
  });
  console.log(`     ✓ ${proveedor1.nombre} ${proveedor1.apellido} - CUIT: ${proveedor1.tipos[0].cuit}`);

  const proveedor2 = await prisma.persona.create({
    data: {
      nombre: 'Jorge',
      apellido: 'Pérez',
      dni: '78901234',
      direccion: 'Rivadavia 890, CABA',
      tipos: {
        create: {
          tipoPersonaId: tipoProveedor.id,
          cuit: '20789012343',
          razonSocial: 'Jorge Pérez - Monotributista',
          activo: true
        }
      },
      contactos: {
        create: {
          tipoContacto: TipoContacto.EMAIL,
          valor: 'jorge.perez@provider.com',
          principal: true,
          activo: true
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true
        }
      }
    }
  });
  console.log(`     ✓ ${proveedor2.nombre} ${proveedor2.apellido} - CUIT: ${proveedor2.tipos[0].cuit}`);
  console.log('');

  // ============================================================================
  // 5. PERSONAS CON MÚLTIPLES TIPOS
  // ============================================================================
  console.log('👥 5. Creando Personas con Múltiples Tipos...\n');

  // ============================================================================
  // 5.1 SOCIO + DOCENTE
  // ============================================================================
  console.log('  🔹 SOCIO + DOCENTE:');

  const socioDocente1 = await prisma.persona.create({
    data: {
      nombre: 'Pedro',
      apellido: 'García',
      dni: '89012345',
      telefono: '1189012345',
      tipos: {
        createMany: {
          data: [
            {
              tipoPersonaId: tipoSocio.id,
              categoriaId: categoriasCreadas.ACTIVO.id,
              numeroSocio: numeroSocioCounter++,
              fechaIngreso: new Date(),
              activo: true
            },
            {
              tipoPersonaId: tipoDocente.id,
              especialidadId: especialidadesCreadas.GUITARRA.id,
              honorariosPorHora: 4500,
              activo: true
            }
          ]
        }
      },
      contactos: {
        createMany: {
          data: [
            {
              tipoContacto: TipoContacto.EMAIL,
              valor: 'pedro.garcia@example.com',
              principal: true,
              activo: true
            },
            {
              tipoContacto: TipoContacto.TELEFONO,
              valor: '1189012345',
              principal: true,
              activo: true
            }
          ]
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          categoria: true,
          especialidad: true
        }
      }
    }
  });
  console.log(`     ✓ ${socioDocente1.nombre} ${socioDocente1.apellido} - Socio #${socioDocente1.tipos.find(t => t.numeroSocio)?.numeroSocio} + Guitarra`);

  // ============================================================================
  // 5.2 SOCIO + PROVEEDOR
  // ============================================================================
  console.log('  🔹 SOCIO + PROVEEDOR:');

  const socioProveedor1 = await prisma.persona.create({
    data: {
      nombre: 'Lucía',
      apellido: 'Fernández',
      dni: '90123456',
      tipos: {
        createMany: {
          data: [
            {
              tipoPersonaId: tipoSocio.id,
              categoriaId: categoriasCreadas.VITALICIO.id,
              numeroSocio: numeroSocioCounter++,
              fechaIngreso: new Date(),
              activo: true
            },
            {
              tipoPersonaId: tipoProveedor.id,
              cuit: '27901234564',
              razonSocial: 'Lucía Fernández - Servicios Musicales',
              activo: true
            }
          ]
        }
      },
      contactos: {
        create: {
          tipoContacto: TipoContacto.EMAIL,
          valor: 'lucia.fernandez@example.com',
          principal: true,
          activo: true
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          categoria: true
        }
      }
    }
  });
  console.log(`     ✓ ${socioProveedor1.nombre} ${socioProveedor1.apellido} - Socio #${socioProveedor1.tipos.find(t => t.numeroSocio)?.numeroSocio} + Proveedor`);

  // ============================================================================
  // 5.3 DOCENTE + PROVEEDOR
  // ============================================================================
  console.log('  🔹 DOCENTE + PROVEEDOR:');

  const docenteProveedor1 = await prisma.persona.create({
    data: {
      nombre: 'Ricardo',
      apellido: 'Gómez',
      dni: '01234567',
      tipos: {
        createMany: {
          data: [
            {
              tipoPersonaId: tipoDocente.id,
              especialidadId: especialidadesCreadas.PIANO.id,
              honorariosPorHora: 7000,
              activo: true
            },
            {
              tipoPersonaId: tipoProveedor.id,
              cuit: '20012345674',
              razonSocial: 'Ricardo Gómez - Servicios Educativos Musicales',
              activo: true
            }
          ]
        }
      },
      contactos: {
        create: {
          tipoContacto: TipoContacto.EMAIL,
          valor: 'ricardo.gomez@example.com',
          principal: true,
          activo: true
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          especialidad: true
        }
      }
    }
  });
  console.log(`     ✓ ${docenteProveedor1.nombre} ${docenteProveedor1.apellido} - Piano + Proveedor`);

  // ============================================================================
  // 5.4 SOCIO + DOCENTE + PROVEEDOR (Triple)
  // ============================================================================
  console.log('  🔹 SOCIO + DOCENTE + PROVEEDOR:');

  const triple1 = await prisma.persona.create({
    data: {
      nombre: 'Silvia',
      apellido: 'Torres',
      dni: '11223344',
      telefono: '1190123456',
      direccion: 'Belgrano 1234, CABA',
      tipos: {
        createMany: {
          data: [
            {
              tipoPersonaId: tipoSocio.id,
              categoriaId: categoriasCreadas.ACTIVO.id,
              numeroSocio: numeroSocioCounter++,
              fechaIngreso: new Date(),
              activo: true
            },
            {
              tipoPersonaId: tipoDocente.id,
              especialidadId: especialidadesCreadas.VIOLIN.id,
              honorariosPorHora: 8000,
              activo: true
            },
            {
              tipoPersonaId: tipoProveedor.id,
              cuit: '27112233445',
              razonSocial: 'Silvia Torres - Servicios Integrales Musicales',
              activo: true
            }
          ]
        }
      },
      contactos: {
        createMany: {
          data: [
            {
              tipoContacto: TipoContacto.EMAIL,
              valor: 'silvia.torres@example.com',
              principal: true,
              activo: true
            },
            {
              tipoContacto: TipoContacto.TELEFONO,
              valor: '1190123456',
              principal: true,
              activo: true
            }
          ]
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          categoria: true,
          especialidad: true
        }
      }
    }
  });
  console.log(`     ✓ ${triple1.nombre} ${triple1.apellido} - Socio #${triple1.tipos.find(t => t.numeroSocio)?.numeroSocio} + Violín + Proveedor`);
  console.log('');

  // ============================================================================
  // 6. PERSONA CON MÚLTIPLES CONTACTOS
  // ============================================================================
  console.log('📞 6. Creando Persona con Múltiples Contactos...\n');

  const personaContactos = await prisma.persona.create({
    data: {
      nombre: 'Daniela',
      apellido: 'Ruiz',
      dni: '22334455',
      tipos: {
        create: {
          tipoPersonaId: tipoSocio.id,
          categoriaId: categoriasCreadas.ACTIVO.id,
          numeroSocio: numeroSocioCounter++,
          fechaIngreso: new Date(),
          activo: true
        }
      },
      contactos: {
        createMany: {
          data: [
            {
              tipoContacto: TipoContacto.EMAIL,
              valor: 'daniela.ruiz@gmail.com',
              principal: true,
              activo: true,
              observaciones: 'Email personal'
            },
            {
              tipoContacto: TipoContacto.EMAIL,
              valor: 'druiz@trabajo.com',
              principal: false,
              activo: true,
              observaciones: 'Email laboral'
            },
            {
              tipoContacto: TipoContacto.CELULAR,
              valor: '1155667788',
              principal: true,
              activo: true
            },
            {
              tipoContacto: TipoContacto.WHATSAPP,
              valor: '1155667788',
              principal: false,
              activo: true
            },
            {
              tipoContacto: TipoContacto.TELEGRAM,
              valor: '@danielaruiz',
              principal: false,
              activo: true
            }
          ]
        }
      }
    },
    include: {
      tipos: {
        include: {
          tipoPersona: true,
          categoria: true
        }
      },
      contactos: true
    }
  });
  console.log(`  ✓ ${personaContactos.nombre} ${personaContactos.apellido} - ${personaContactos.contactos.length} contactos`);
  console.log('');

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================
  console.log('✅ Seed de Personas V2 completado exitosamente!\n');
  console.log('📊 RESUMEN:\n');
  console.log('  📚 Catálogos:');
  console.log(`     - ${await prisma.tipoPersonaCatalogo.count()} tipos de persona`);
  console.log(`     - ${await prisma.especialidadDocente.count()} especialidades docentes`);
  console.log(`     - ${await prisma.categoriaSocio.count()} categorías de socios\n`);

  console.log('  👥 Personas:');
  console.log(`     - ${await prisma.persona.count()} personas totales`);
  console.log(`     - ${await prisma.personaTipo.count()} asignaciones de tipo`);
  console.log(`     - ${await prisma.contactoPersona.count()} contactos\n`);

  // Contar por tipo
  const tiposCount = await prisma.personaTipo.groupBy({
    by: ['tipoPersonaId'],
    _count: true
  });

  console.log('  📈 Por tipo de persona:');
  for (const count of tiposCount) {
    const tipo = await prisma.tipoPersonaCatalogo.findUnique({
      where: { id: count.tipoPersonaId }
    });
    console.log(`     - ${tipo?.nombre}: ${count._count} asignaciones`);
  }

  console.log('');
  console.log('💡 Datos listos para usar con la API Personas V2');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
