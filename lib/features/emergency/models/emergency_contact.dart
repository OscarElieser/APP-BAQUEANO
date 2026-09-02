// ============================================================================
// 🆘 MODELO DE CONTACTOS Y PROTOCOLOS DE ASISTENCIA SOS (EMERGENCY_CONTACT.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una estructura inmutable y confiable para gestionar líneas de
//   emergencia nacionales, puestos médicos y protocolos de asistencia turística
//   en Nicaragua, asegurando disponibilidad inmediata incluso sin conexión a red.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Clase Dart inmutable con identificador único, nombre de institución, número
//   de marcado rápido, número internacional PBX, icono temático y categoría de socorro.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELOS EXPUESTOS):
// - `EmergencyContact`: Entidad de contacto con metadatos de socorro.
// - `EmergencyGuide`: Entidad con instrucciones paso a paso para contingencias.
// - `emergencyContactsList`: Catálogo oficial precargado de Nicaragua.
// ============================================================================

import 'package:flutter/material.dart';

enum EmergencyCategory {
  seguridad,
  salud,
  rescate,
  turismo,
}

class EmergencyContact {
  final String id;
  final String title;
  final String subtitle;
  final String shortDial;
  final String fullPhone;
  final IconData icon;
  final Color accentColor;
  final EmergencyCategory category;

  const EmergencyContact({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.shortDial,
    required this.fullPhone,
    required this.icon,
    required this.accentColor,
    required this.category,
  });
}

class EmergencyGuide {
  final String title;
  final String situation;
  final List<String> actionSteps;
  final IconData icon;

  const EmergencyGuide({
    required this.title,
    required this.situation,
    required this.actionSteps,
    required this.icon,
  });
}

const List<EmergencyContact> officialEmergencyContacts = [
  EmergencyContact(
    id: 'police',
    title: 'Policía Nacional & Turística',
    subtitle: 'Seguridad ciudadana y resguardo a turistas en rutas',
    shortDial: '118',
    fullPhone: '+505 2277-4130',
    icon: Icons.local_police_rounded,
    accentColor: Color(0xFF0284C7),
    category: EmergencyCategory.seguridad,
  ),
  EmergencyContact(
    id: 'red_cross',
    title: 'Cruz Blanca / Ambulancias',
    subtitle: 'Atención prehospitalaria y traslados de urgencia',
    shortDial: '128',
    fullPhone: '+505 2265-2081',
    icon: Icons.medical_services_rounded,
    accentColor: Color(0xFFE11D48),
    category: EmergencyCategory.salud,
  ),
  EmergencyContact(
    id: 'firefighters',
    title: 'Bomberos Unificados de Nicaragua',
    subtitle: 'Control de incendios, rescate en volcanes y estructuras',
    shortDial: '115',
    fullPhone: '+505 2264-0010',
    icon: Icons.fire_extinguisher_rounded,
    accentColor: Color(0xFFC86432),
    category: EmergencyCategory.rescate,
  ),
  EmergencyContact(
    id: 'intur',
    title: 'Asistencia Turística INTUR',
    subtitle: 'Orientación institucional y protección al visitante',
    shortDial: '101',
    fullPhone: '+505 2254-5191',
    icon: Icons.travel_explore_rounded,
    accentColor: Color(0xFFD4AF37),
    category: EmergencyCategory.turismo,
  ),
];

const List<EmergencyGuide> offlineEmergencyGuides = [
  EmergencyGuide(
    title: 'Picaduras o Mordeduras en Selva',
    situation: 'Fauna silvestre o insectos en senderos de reserva natural',
    icon: Icons.healing_rounded,
    actionSteps: [
      'Mantén la calma y reduce el movimiento de la extremidad afectada.',
      'Lava suavemente el área con agua limpia sin aplicar torniquetes ni cortes.',
      'Toma nota o fotografía de las características del animal si es seguro.',
      'Comunícate de inmediato al 128 (Cruz Blanca) para traslado antiofídico.',
    ],
  ),
  EmergencyGuide(
    title: 'Desorientación en Senderos Volcánicos',
    situation: 'Pérdida de visibilidad por niebla o salida de la ruta señalizada',
    icon: Icons.explore_off_rounded,
    actionSteps: [
      'Detente y no continúes avanzando a ciegas por terrenos escarpados.',
      'Usa el botón de SOS en Baqueano para emitir tus coordenadas GPS actuales.',
      'Permanece en un punto visible y resguárdate del viento volcánico.',
      'Llama al 115 o contacta a tu Baqueano / guía asignado.',
    ],
  ),
  EmergencyGuide(
    title: 'Golpe de Calor o Deshidratación',
    situation: 'Exposición térmica en volcanes activos o playas del Pacífico',
    icon: Icons.wb_sunny_rounded,
    actionSteps: [
      'Traslada a la persona a la sombra o lugar ventilado inmediatamente.',
      'Suministra pequeños sorbos de agua o electrolitos de forma constante.',
      'Humedece la frente, cuello y muñecas con paños frescos.',
      'Si hay confusión o pérdida de conciencia, solicita auxilio médico al 128.',
    ],
  ),
];
