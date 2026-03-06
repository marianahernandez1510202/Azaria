<?php
/**
 * Tests para EmailService
 * Verifica la generacion de templates y formateo de datos
 */

use App\Services\EmailService;

// ===== Tests EmailService =====

test('EmailService: formatearFecha formatea correctamente', function () {
    $service = new EmailService();

    // Usar reflection para acceder a metodo privado
    $reflection = new ReflectionMethod(EmailService::class, 'formatearFecha');
    $reflection->setAccessible(true);

    $result = $reflection->invoke($service, '2026-02-14');
    assertContains('14', $result, 'Debe contener el dia');
    assertContains('febrero', $result, 'Debe contener el mes en espanol');
    assertContains('2026', $result, 'Debe contener el anio');
});

test('EmailService: formatearFecha con fecha invalida retorna la fecha original', function () {
    $service = new EmailService();

    $reflection = new ReflectionMethod(EmailService::class, 'formatearFecha');
    $reflection->setAccessible(true);

    $result = $reflection->invoke($service, 'fecha-invalida');
    assertEqual('fecha-invalida', $result, 'Debe retornar la fecha original si es invalida');
});

test('EmailService: getCitaTemplate genera HTML para confirmacion', function () {
    $service = new EmailService();

    $reflection = new ReflectionMethod(EmailService::class, 'getCitaTemplate');
    $reflection->setAccessible(true);

    $html = $reflection->invoke($service, 'confirmacion', [
        'paciente' => 'Juan Perez',
        'especialista' => 'Dr. Garcia',
        'fecha' => 'lunes 14 de febrero de 2026',
        'hora' => '10:00',
        'tipo' => 'Consulta general'
    ]);

    assertContains('Juan Perez', $html, 'Debe contener el nombre del paciente');
    assertContains('Dr. Garcia', $html, 'Debe contener el nombre del especialista');
    assertContains('10:00', $html, 'Debe contener la hora');
    assertContains('Cita Confirmada', $html, 'Debe contener el titulo de confirmacion');
});

test('EmailService: getCitaTemplate genera HTML para cancelacion', function () {
    $service = new EmailService();

    $reflection = new ReflectionMethod(EmailService::class, 'getCitaTemplate');
    $reflection->setAccessible(true);

    $html = $reflection->invoke($service, 'cancelacion', [
        'paciente' => 'Maria Lopez',
        'especialista' => 'Dr. Ramirez',
        'fecha' => 'martes 15 de febrero de 2026',
        'hora' => '14:00',
        'tipo' => 'Fisioterapia',
        'motivo' => 'Motivo personal'
    ]);

    assertContains('Cita Cancelada', $html, 'Debe contener el titulo de cancelacion');
    assertContains('Motivo personal', $html, 'Debe contener el motivo');
});

test('EmailService: getCitaTemplate genera HTML para recordatorio', function () {
    $service = new EmailService();

    $reflection = new ReflectionMethod(EmailService::class, 'getCitaTemplate');
    $reflection->setAccessible(true);

    $html = $reflection->invoke($service, 'recordatorio', [
        'paciente' => 'Pedro Sanchez',
        'especialista' => 'Dra. Martinez',
        'fecha' => 'miercoles 16 de febrero de 2026',
        'hora' => '09:00',
        'tipo' => 'Nutricion',
        'ubicacion' => 'Consultorio 3'
    ]);

    assertContains('Recordatorio', $html, 'Debe contener titulo de recordatorio');
    assertContains('Consultorio 3', $html, 'Debe contener la ubicacion');
});

test('EmailService: getCitaTemplate genera HTML para reagendada', function () {
    $service = new EmailService();

    $reflection = new ReflectionMethod(EmailService::class, 'getCitaTemplate');
    $reflection->setAccessible(true);

    $html = $reflection->invoke($service, 'reagendada', [
        'paciente' => 'Ana Torres',
        'especialista' => 'Dr. Hernandez',
        'fecha_anterior' => 'lunes 14 de febrero de 2026',
        'hora_anterior' => '10:00',
        'fecha_nueva' => 'martes 15 de febrero de 2026',
        'hora_nueva' => '11:00',
        'tipo' => 'Medicina general'
    ]);

    assertContains('Reagendada', $html, 'Debe contener titulo de reagendada');
    assertContains('10:00', $html, 'Debe contener la hora anterior');
    assertContains('11:00', $html, 'Debe contener la hora nueva');
});
