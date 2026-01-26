<?php
namespace App\Services;

class ChartService {
    public function generateChartData($type, $data) {
        // Generar datos para gráficas
        return [
            'labels' => [],
            'datasets' => []
        ];
    }
}
