-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: vitalia_db
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alertas_medicas`
--

DROP TABLE IF EXISTS `alertas_medicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas_medicas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `tipo` enum('glucosa','presion','dolor','adherencia_medicamento','efectos_secundarios','medicamento_sin_stock','patron_olvido') COLLATE utf8mb4_unicode_ci NOT NULL,
  `severidad` enum('baja','media','alta') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `datos_referencia` json DEFAULT NULL,
  `atendida` tinyint(1) DEFAULT '0',
  `atendida_por` int unsigned DEFAULT NULL,
  `atendida_en` timestamp NULL DEFAULT NULL,
  `acciones_tomadas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `atendida_por` (`atendida_por`),
  KEY `idx_paciente` (`paciente_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_atendida` (`atendida`),
  KEY `idx_severidad` (`severidad`),
  CONSTRAINT `alertas_medicas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alertas_medicas_ibfk_2` FOREIGN KEY (`atendida_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_medicas`
--

LOCK TABLES `alertas_medicas` WRITE;
/*!40000 ALTER TABLE `alertas_medicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `alertas_medicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alimentos`
--

DROP TABLE IF EXISTS `alimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alimentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `porcion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '100g',
  `calorias` int DEFAULT '0',
  `carbohidratos` int DEFAULT '0',
  `proteinas` int DEFAULT '0',
  `grasas` int DEFAULT '0',
  `fibra` int DEFAULT '0',
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alimentos`
--

LOCK TABLES `alimentos` WRITE;
/*!40000 ALTER TABLE `alimentos` DISABLE KEYS */;
INSERT INTO `alimentos` VALUES (1,'Manzana','1 mediana',95,25,0,0,4,'frutas','2026-01-20 15:50:54'),(2,'Platano','1 mediano',105,27,1,0,3,'frutas','2026-01-20 15:50:54'),(3,'Naranja','1 mediana',62,15,1,0,3,'frutas','2026-01-20 15:50:54'),(4,'Huevo cocido','1 grande',78,1,6,5,0,'proteinas','2026-01-20 15:50:54'),(5,'Pollo a la plancha','100g',165,0,31,4,0,'proteinas','2026-01-20 15:50:54'),(6,'Arroz blanco','1 taza',206,45,4,0,1,'carbohidratos','2026-01-20 15:50:54'),(7,'Pan integral','1 rebanada',69,12,4,1,2,'carbohidratos','2026-01-20 15:50:54'),(8,'Avena','1/2 taza',150,27,5,3,4,'carbohidratos','2026-01-20 15:50:54'),(9,'Leche descremada','1 taza',83,12,8,0,0,'lacteos','2026-01-20 15:50:54'),(10,'Yogurt natural','1 taza',149,17,9,5,0,'lacteos','2026-01-20 15:50:54'),(11,'Ensalada verde','1 taza',10,2,1,0,1,'vegetales','2026-01-20 15:50:54'),(12,'Brocoli cocido','1 taza',55,11,4,1,5,'vegetales','2026-01-20 15:50:54'),(13,'Aguacate','1/2',160,9,2,15,7,'grasas','2026-01-20 15:50:54'),(14,'Almendras','1 onza',164,6,6,14,4,'grasas','2026-01-20 15:50:54'),(15,'Cafe con leche','1 taza',67,6,4,3,0,'bebidas','2026-01-20 15:50:54');
/*!40000 ALTER TABLE `alimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areas_medicas`
--

DROP TABLE IF EXISTS `areas_medicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas_medicas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#000000',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas_medicas`
--

LOCK TABLES `areas_medicas` WRITE;
/*!40000 ALTER TABLE `areas_medicas` DISABLE KEYS */;
INSERT INTO `areas_medicas` VALUES (1,'fisioterapia','Rehabilitación física y ejercicios terapéuticos','fitness','#4CAF50',1,'2026-01-19 04:15:59','2026-01-19 04:15:59'),(2,'nutricion','Alimentación y planes nutricionales','restaurant','#FF9800',1,'2026-01-19 04:15:59','2026-01-19 04:15:59'),(3,'medicina','Seguimiento médico general y bitácoras de salud','medical_services','#F44336',1,'2026-01-19 04:15:59','2026-01-19 04:15:59'),(4,'neuropsicologia','Salud mental y bienestar emocional','psychology','#9C27B0',1,'2026-01-19 04:15:59','2026-01-19 04:15:59'),(5,'ortesis','Dispositivos ortopédicos y prótesis','accessibility','#2196F3',1,'2026-01-19 04:15:59','2026-01-19 04:15:59');
/*!40000 ALTER TABLE `areas_medicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articulo_likes`
--

DROP TABLE IF EXISTS `articulo_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articulo_likes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `articulo_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`articulo_id`,`usuario_id`),
  KEY `idx_articulo` (`articulo_id`),
  KEY `idx_usuario` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articulo_likes`
--

LOCK TABLES `articulo_likes` WRITE;
/*!40000 ALTER TABLE `articulo_likes` DISABLE KEYS */;
INSERT INTO `articulo_likes` VALUES (1,3,7,'2026-01-20 03:38:01'),(2,2,7,'2026-01-20 03:38:06');
/*!40000 ALTER TABLE `articulo_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articulos`
--

DROP TABLE IF EXISTS `articulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articulos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resumen` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenido` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen_portada_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `area_medica_id` int unsigned DEFAULT NULL,
  `autor_id` int unsigned NOT NULL,
  `tiempo_lectura_minutos` int unsigned DEFAULT '5',
  `publicado` tinyint(1) DEFAULT '0',
  `destacado` tinyint(1) DEFAULT '0',
  `fecha_publicacion` timestamp NULL DEFAULT NULL,
  `vistas` int unsigned DEFAULT '0',
  `likes` int unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `autor_id` (`autor_id`),
  KEY `idx_area` (`area_medica_id`),
  KEY `idx_publicado` (`publicado`),
  KEY `idx_destacado` (`destacado`),
  KEY `idx_fecha` (`fecha_publicacion`),
  FULLTEXT KEY `ft_articulos` (`titulo`,`resumen`,`contenido`),
  CONSTRAINT `articulos_ibfk_1` FOREIGN KEY (`area_medica_id`) REFERENCES `areas_medicas` (`id`),
  CONSTRAINT `articulos_ibfk_2` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articulos`
--

LOCK TABLES `articulos` WRITE;
/*!40000 ALTER TABLE `articulos` DISABLE KEYS */;
INSERT INTO `articulos` VALUES (1,'5 ejercicios esenciales para fortalecer tu muñón','ejercicios-fortalecer-munon','Descubre los ejercicios fundamentales que te ayudarán a preparar tu muñón para el uso de la prótesis.','El fortalecimiento del muñón es crucial para el éxito en el uso de una prótesis. Aquí te presentamos 5 ejercicios que puedes realizar en casa:\n\n**1. Contracciones isométricas**\nAprieta los músculos del muñón durante 5 segundos, relaja por 5 segundos. Repite 10 veces.\n\n**2. Elevaciones laterales**\nAcostado de lado, eleva el muñón hacia el techo. 3 series de 10 repeticiones.\n\n**3. Extensiones de cadera**\nEn posición boca abajo, eleva el muñón hacia atrás. Mantén 3 segundos. 3 series de 10.\n\n**4. Círculos con el muñón**\nRealiza círculos pequeños en el aire. 10 en cada dirección.\n\n**5. Resistencia con banda elástica**\nColoca una banda alrededor del muñón y realiza movimientos de extensión.\n\n**Importante:** Realiza estos ejercicios solo después de que tu herida haya sanado completamente.',NULL,1,2,5,1,1,'2026-01-14 16:48:37',0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,'Alimentación para una mejor cicatrización','alimentacion-cicatrizacion','Conoce los nutrientes esenciales que aceleran la recuperación y fortalecen tu sistema inmune.','Una buena alimentación es fundamental para una recuperación exitosa. Estos son los nutrientes que debes priorizar:\n\n**Proteínas**\nFundamentales para la regeneración de tejidos: pollo, pescado, huevos, legumbres.\n\n**Vitamina C**\nEsencial para la síntesis de colágeno: cítricos, guayaba, kiwi, pimientos.\n\n**Zinc**\nAcelera la cicatrización: carnes magras, semillas de calabaza, garbanzos.\n\n**Vitamina A**\nProtege contra infecciones: zanahoria, calabaza, espinacas.\n\n**Hidratación**\nBebe al menos 8 vasos de agua al día.\n\n**Evita:** Azúcares refinados, alimentos procesados, alcohol.',NULL,2,3,4,1,0,'2026-01-16 16:48:37',0,1,'2026-01-19 16:48:37','2026-01-20 03:38:06'),(3,'Manejando la ansiedad durante tu recuperación','manejando-ansiedad-recuperacion','Estrategias prácticas para sobrellevar los momentos difíciles durante tu proceso de rehabilitación.','Es completamente normal sentir ansiedad después de una amputación. Aquí te compartimos estrategias que pueden ayudarte:\n\n**Técnicas de respiración**\nLa respiración 4-7-8 es muy efectiva: inhala por 4 segundos, mantén por 7, exhala por 8.\n\n**Mindfulness**\nPractica estar en el presente. Cuando notes que tu mente divaga hacia preocupaciones, regresa tu atención al momento actual.\n\n**Grupos de apoyo**\nConectar con personas que han pasado por experiencias similares puede ser muy reconfortante.\n\n**Comunicación abierta**\nHabla con tus seres queridos sobre cómo te sientes.\n\n**Actividad física**\nEl ejercicio, dentro de tus posibilidades, libera endorfinas que mejoran el estado de ánimo.\n\nRecuerda: pedir ayuda es una señal de fortaleza, no de debilidad.',NULL,4,5,5,1,0,'2026-01-18 16:48:37',0,1,'2026-01-19 16:48:37','2026-01-20 03:38:01');
/*!40000 ALTER TABLE `articulos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articulos_etiquetas`
--

DROP TABLE IF EXISTS `articulos_etiquetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articulos_etiquetas` (
  `articulo_id` int unsigned NOT NULL,
  `etiqueta_id` int unsigned NOT NULL,
  PRIMARY KEY (`articulo_id`,`etiqueta_id`),
  KEY `etiqueta_id` (`etiqueta_id`),
  CONSTRAINT `articulos_etiquetas_ibfk_1` FOREIGN KEY (`articulo_id`) REFERENCES `articulos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `articulos_etiquetas_ibfk_2` FOREIGN KEY (`etiqueta_id`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articulos_etiquetas`
--

LOCK TABLES `articulos_etiquetas` WRITE;
/*!40000 ALTER TABLE `articulos_etiquetas` DISABLE KEYS */;
/*!40000 ALTER TABLE `articulos_etiquetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articulos_favoritos`
--

DROP TABLE IF EXISTS `articulos_favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articulos_favoritos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `articulo_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorito` (`articulo_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `articulos_favoritos_ibfk_1` FOREIGN KEY (`articulo_id`) REFERENCES `articulos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `articulos_favoritos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articulos_favoritos`
--

LOCK TABLES `articulos_favoritos` WRITE;
/*!40000 ALTER TABLE `articulos_favoritos` DISABLE KEYS */;
/*!40000 ALTER TABLE `articulos_favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones_especialista`
--

DROP TABLE IF EXISTS `asignaciones_especialista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_especialista` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `especialista_id` int unsigned NOT NULL,
  `area_medica_id` int unsigned NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_asignacion` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `asignado_por` int unsigned NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion` (`paciente_id`,`area_medica_id`,`activo`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_especialista` (`especialista_id`),
  KEY `idx_area` (`area_medica_id`),
  CONSTRAINT `asignaciones_especialista_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_especialista_ibfk_2` FOREIGN KEY (`especialista_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `asignaciones_especialista_ibfk_3` FOREIGN KEY (`area_medica_id`) REFERENCES `areas_medicas` (`id`),
  CONSTRAINT `asignaciones_especialista_ibfk_4` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_especialista`
--

LOCK TABLES `asignaciones_especialista` WRITE;
/*!40000 ALTER TABLE `asignaciones_especialista` DISABLE KEYS */;
INSERT INTO `asignaciones_especialista` VALUES (1,1,2,1,1,'2024-06-15',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,1,3,2,1,'2024-06-15',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,1,4,3,1,'2024-06-15',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(4,1,5,4,1,'2024-06-15',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(5,1,6,5,1,'2024-06-15',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(6,2,2,1,1,'2024-03-20',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(7,2,3,2,1,'2024-03-20',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(8,2,4,3,1,'2024-03-20',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(9,3,2,1,1,'2024-08-10',NULL,1,'sdasdasdasasdcasdascascascascassasdasas','2026-01-19 16:48:37','2026-01-25 04:49:16'),(10,3,3,2,1,'2024-08-10',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(11,3,6,5,1,'2024-08-10',NULL,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37');
/*!40000 ALTER TABLE `asignaciones_especialista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bitacora_dolor`
--

DROP TABLE IF EXISTS `bitacora_dolor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_dolor` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `intensidad` tinyint unsigned NOT NULL,
  `ubicacion_id` int unsigned NOT NULL,
  `tipo_dolor_id` int unsigned DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `alerta_generada` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ubicacion_id` (`ubicacion_id`),
  KEY `tipo_dolor_id` (`tipo_dolor_id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_intensidad` (`intensidad`),
  CONSTRAINT `bitacora_dolor_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bitacora_dolor_ibfk_2` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones_dolor` (`id`),
  CONSTRAINT `bitacora_dolor_ibfk_3` FOREIGN KEY (`tipo_dolor_id`) REFERENCES `tipos_dolor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora_dolor`
--

LOCK TABLES `bitacora_dolor` WRITE;
/*!40000 ALTER TABLE `bitacora_dolor` DISABLE KEYS */;
INSERT INTO `bitacora_dolor` VALUES (1,1,3,1,2,'Dolor leve después de ejercicios','2026-01-18','18:00:00',0,'2026-01-19 16:48:37'),(2,1,2,1,5,'Sensación fantasma leve','2026-01-19','10:00:00',0,'2026-01-19 16:48:37'),(3,2,5,1,4,'Dolor moderado en la noche','2026-01-17','23:00:00',0,'2026-01-19 16:48:37'),(4,2,4,1,5,'Sensación de pie que no existe','2026-01-18','21:00:00',0,'2026-01-19 16:48:37'),(5,3,2,1,1,'Solo al caminar mucho','2026-01-19','17:00:00',0,'2026-01-19 16:48:37'),(6,1,7,1,5,'','2026-01-19','12:46:37',0,'2026-01-19 18:46:37'),(7,1,1,1,1,'','2026-01-19','21:55:42',0,'2026-01-20 03:55:42');
/*!40000 ALTER TABLE `bitacora_dolor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bitacora_glucosa`
--

DROP TABLE IF EXISTS `bitacora_glucosa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_glucosa` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `valor` decimal(5,1) NOT NULL,
  `momento_id` int unsigned NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `alerta_generada` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `momento_id` (`momento_id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_alerta` (`alerta_generada`),
  CONSTRAINT `bitacora_glucosa_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bitacora_glucosa_ibfk_2` FOREIGN KEY (`momento_id`) REFERENCES `momentos_medicion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora_glucosa`
--

LOCK TABLES `bitacora_glucosa` WRITE;
/*!40000 ALTER TABLE `bitacora_glucosa` DISABLE KEYS */;
INSERT INTO `bitacora_glucosa` VALUES (1,1,95.0,1,'Nivel normal','2026-01-18','07:00:00',0,'2026-01-19 16:48:37'),(2,1,140.0,4,'Después del almuerzo','2026-01-18','14:30:00',0,'2026-01-19 16:48:37'),(3,1,110.0,7,NULL,'2026-01-18','22:00:00',0,'2026-01-19 16:48:37'),(4,1,98.0,1,'Buen control','2026-01-19','07:15:00',0,'2026-01-19 16:48:37'),(5,3,105.0,1,NULL,'2026-01-17','06:45:00',0,'2026-01-19 16:48:37'),(6,3,165.0,4,'Comí más carbohidratos de lo normal','2026-01-17','14:00:00',0,'2026-01-19 16:48:37'),(7,3,92.0,1,'Excelente','2026-01-18','07:00:00',0,'2026-01-19 16:48:37'),(8,3,135.0,4,'Dentro de rango','2026-01-19','14:15:00',0,'2026-01-19 16:48:37'),(9,1,600.0,4,'','2026-01-19','12:47:15',0,'2026-01-19 18:47:15');
/*!40000 ALTER TABLE `bitacora_glucosa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bitacora_presion`
--

DROP TABLE IF EXISTS `bitacora_presion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_presion` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `sistolica` int unsigned NOT NULL,
  `diastolica` int unsigned NOT NULL,
  `pulso` int unsigned DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `alerta_generada` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `bitacora_presion_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora_presion`
--

LOCK TABLES `bitacora_presion` WRITE;
/*!40000 ALTER TABLE `bitacora_presion` DISABLE KEYS */;
INSERT INTO `bitacora_presion` VALUES (1,1,125,82,72,'Normal','2026-01-17','08:00:00',0,'2026-01-19 16:48:37'),(2,1,130,85,75,'Ligeramente elevada','2026-01-18','08:30:00',0,'2026-01-19 16:48:37'),(3,1,122,78,70,'Controlada','2026-01-19','08:00:00',0,'2026-01-19 16:48:37'),(4,3,138,88,78,'Tomar medicamento','2026-01-18','07:30:00',0,'2026-01-19 16:48:37'),(5,3,128,82,74,'Mejorando','2026-01-19','07:45:00',0,'2026-01-19 16:48:37'),(6,1,120,90,60,'','2026-01-19','12:46:54',0,'2026-01-19 18:46:54'),(7,1,130,90,80,'','2026-01-19','22:04:30',0,'2026-01-20 04:04:30'),(8,1,156,93,80,'','2026-01-19','22:07:37',0,'2026-01-20 04:07:37');
/*!40000 ALTER TABLE `bitacora_presion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_ejercicio`
--

DROP TABLE IF EXISTS `categorias_ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_ejercicio` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_ejercicio`
--

LOCK TABLES `categorias_ejercicio` WRITE;
/*!40000 ALTER TABLE `categorias_ejercicio` DISABLE KEYS */;
INSERT INTO `categorias_ejercicio` VALUES (1,'fortalecimiento','Ejercicios para fortalecer músculos',NULL,'2026-01-19 04:16:00'),(2,'estiramiento','Ejercicios de estiramiento y flexibilidad',NULL,'2026-01-19 04:16:00'),(3,'balance','Ejercicios de equilibrio y coordinación',NULL,'2026-01-19 04:16:00'),(4,'cardio','Ejercicios cardiovasculares',NULL,'2026-01-19 04:16:00');
/*!40000 ALTER TABLE `categorias_ejercicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checklist_comidas`
--

DROP TABLE IF EXISTS `checklist_comidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checklist_comidas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `fecha` date NOT NULL,
  `desayuno` tinyint(1) DEFAULT '0',
  `colacion_matutina` tinyint(1) DEFAULT '0',
  `comida` tinyint(1) DEFAULT '0',
  `colacion_vespertina` tinyint(1) DEFAULT '0',
  `cena` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_checklist` (`paciente_id`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `checklist_comidas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checklist_comidas`
--

LOCK TABLES `checklist_comidas` WRITE;
/*!40000 ALTER TABLE `checklist_comidas` DISABLE KEYS */;
INSERT INTO `checklist_comidas` VALUES (1,1,'2026-01-18',1,1,1,0,1,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,1,'2026-01-19',1,1,1,1,1,'2026-01-19 16:48:37','2026-01-19 19:00:48'),(3,3,'2026-01-18',1,0,1,1,1,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(4,3,'2026-01-19',1,1,0,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(5,1,'2026-01-20',1,0,0,0,0,'2026-01-20 03:26:45','2026-01-20 03:26:45');
/*!40000 ALTER TABLE `checklist_comidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checklist_protesis`
--

DROP TABLE IF EXISTS `checklist_protesis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checklist_protesis` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `fecha` date NOT NULL,
  `limpieza_realizada` tinyint(1) DEFAULT '0',
  `inspeccion_visual` tinyint(1) DEFAULT '0',
  `ajuste_correcto` tinyint(1) DEFAULT '0',
  `comodidad_uso` tinyint(1) DEFAULT '0',
  `problemas_detectados` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_checklist` (`paciente_id`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `checklist_protesis_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checklist_protesis`
--

LOCK TABLES `checklist_protesis` WRITE;
/*!40000 ALTER TABLE `checklist_protesis` DISABLE KEYS */;
INSERT INTO `checklist_protesis` VALUES (1,1,'2026-01-18',1,1,1,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,1,'2026-01-19',1,1,1,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,3,'2026-01-18',1,1,0,0,'Ligera molestia en el encaje','2026-01-19 16:48:37','2026-01-19 16:48:37'),(4,3,'2026-01-19',1,1,1,1,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37');
/*!40000 ALTER TABLE `checklist_protesis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `especialista_id` int unsigned NOT NULL,
  `area_medica_id` int unsigned NOT NULL,
  `tipo_cita_id` int unsigned NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('programada','confirmada','completada','cancelada','no_asistio') COLLATE utf8mb4_unicode_ci DEFAULT 'programada',
  `notas_consulta` text COLLATE utf8mb4_unicode_ci,
  `google_event_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelada_por` int unsigned DEFAULT NULL,
  `motivo_cancelacion` text COLLATE utf8mb4_unicode_ci,
  `fecha_cancelacion` timestamp NULL DEFAULT NULL,
  `recordatorio_24h_enviado` tinyint(1) DEFAULT '0',
  `recordatorio_1h_enviado` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `area_medica_id` (`area_medica_id`),
  KEY `tipo_cita_id` (`tipo_cita_id`),
  KEY `cancelada_por` (`cancelada_por`),
  KEY `idx_paciente` (`paciente_id`),
  KEY `idx_especialista` (`especialista_id`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`especialista_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`area_medica_id`) REFERENCES `areas_medicas` (`id`),
  CONSTRAINT `citas_ibfk_4` FOREIGN KEY (`tipo_cita_id`) REFERENCES `tipos_cita` (`id`),
  CONSTRAINT `citas_ibfk_5` FOREIGN KEY (`cancelada_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,1,2,1,2,'2026-01-12','09:00:00','10:00:00','Revisión de avance en fisioterapia','completada','Paciente muestra buen progreso. Continuar con ejercicios asignados.',NULL,NULL,NULL,NULL,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,1,3,2,2,'2026-01-14','10:00:00','10:45:00','Control nutricional mensual','completada','Peso estable. Ajustar dieta para mejorar energía.',NULL,NULL,NULL,NULL,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,2,4,3,2,'2026-01-16','11:00:00','11:30:00','Control de medicamentos','completada','Continuar con tratamiento actual.',NULL,NULL,NULL,NULL,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(4,1,2,1,2,'2026-01-21','09:00:00','10:00:00','Sesión de fisioterapia semanal','confirmada',NULL,NULL,NULL,NULL,NULL,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(5,1,5,4,2,'2026-01-24','14:00:00','14:45:00','Evaluación psicológica mensual','programada',NULL,NULL,NULL,NULL,NULL,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(6,2,3,2,2,'2026-01-22','10:00:00','10:45:00','Consulta de nutrición','confirmada',NULL,NULL,NULL,NULL,NULL,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(7,3,6,5,2,'2026-01-20','08:00:00','09:00:00','Ajuste de prótesis','confirmada',NULL,NULL,NULL,NULL,NULL,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(8,3,2,1,2,'2026-01-23','11:00:00','12:00:00','Evaluación de marcha','programada',NULL,NULL,NULL,NULL,NULL,0,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(9,1,2,1,2,'2026-01-25','10:00:00','10:30:00','','programada',NULL,NULL,NULL,NULL,NULL,0,0,'2026-01-25 07:17:51','2026-01-25 07:17:51');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios_articulo`
--

DROP TABLE IF EXISTS `comentarios_articulo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios_articulo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `articulo_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_anonimo` tinyint(1) DEFAULT '0',
  `aprobado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_articulo` (`articulo_id`),
  KEY `idx_aprobado` (`aprobado`),
  CONSTRAINT `comentarios_articulo_ibfk_1` FOREIGN KEY (`articulo_id`) REFERENCES `articulos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_articulo_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios_articulo`
--

LOCK TABLES `comentarios_articulo` WRITE;
/*!40000 ALTER TABLE `comentarios_articulo` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentarios_articulo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios_articulos`
--

DROP TABLE IF EXISTS `comentarios_articulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios_articulos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `articulo_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_articulo` (`articulo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios_articulos`
--

LOCK TABLES `comentarios_articulos` WRITE;
/*!40000 ALTER TABLE `comentarios_articulos` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentarios_articulos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios_comunidad`
--

DROP TABLE IF EXISTS `comentarios_comunidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios_comunidad` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `publicacion_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `contenido` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_anonimo` tinyint(1) DEFAULT '0',
  `estado` enum('pendiente','aprobado','rechazado') COLLATE utf8mb4_unicode_ci DEFAULT 'aprobado',
  `moderado_por` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `moderado_por` (`moderado_por`),
  KEY `idx_publicacion` (`publicacion_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `comentarios_comunidad_ibfk_1` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones_comunidad` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_comunidad_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_comunidad_ibfk_3` FOREIGN KEY (`moderado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios_comunidad`
--

LOCK TABLES `comentarios_comunidad` WRITE;
/*!40000 ALTER TABLE `comentarios_comunidad` DISABLE KEYS */;
INSERT INTO `comentarios_comunidad` VALUES (1,1,8,'¡Felicidades Juan! Es un gran logro. Sigue así.',0,'aprobado',NULL,'2026-01-19 16:48:37'),(2,1,9,'Eres una inspiración para todos nosotros.',0,'aprobado',NULL,'2026-01-19 16:48:37'),(3,2,7,'A mí me ayuda mucho la técnica de la caja espejo, pregúntale a tu fisioterapeuta.',0,'aprobado',NULL,'2026-01-19 16:48:37'),(4,2,9,'También me pasa. Los ejercicios de respiración antes de dormir me han ayudado.',0,'aprobado',NULL,'2026-01-19 16:48:37');
/*!40000 ALTER TABLE `comentarios_comunidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `tipo` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,'nombre_sistema','Vitalia 2.0','string','Nombre del sistema','2026-01-19 04:16:03','2026-01-19 04:16:03'),(2,'email_soporte','soporte@vitalia.mx','string','Email de soporte','2026-01-19 04:16:03','2026-01-19 04:16:03'),(3,'telefono_soporte','+52 442 123 4567','string','Teléfono de soporte','2026-01-19 04:16:03','2026-01-19 04:16:03'),(4,'horario_atencion','{\"inicio\": \"08:00\", \"fin\": \"18:00\", \"dias\": [1,2,3,4,5]}','json','Horario de atención','2026-01-19 04:16:03','2026-01-19 04:16:03'),(5,'duracion_sesion_dias','30','number','Días de duración de sesión persistente','2026-01-19 04:16:03','2026-01-19 04:16:03'),(6,'max_intentos_login','5','number','Máximo de intentos de login antes de bloqueo','2026-01-19 04:16:03','2026-01-19 04:16:03'),(7,'tiempo_bloqueo_minutos','15','number','Minutos de bloqueo por intentos fallidos','2026-01-19 04:16:03','2026-01-19 04:16:03'),(8,'expiracion_codigo_minutos','15','number','Minutos de validez del código de recuperación','2026-01-19 04:16:03','2026-01-19 04:16:03'),(9,'chat_expiracion_horas','24','number','Horas antes de eliminar mensajes de chat','2026-01-19 04:16:03','2026-01-19 04:16:03'),(10,'moderacion_auto_aprobacion','5','number','Publicaciones aprobadas para auto-aprobación','2026-01-19 04:16:03','2026-01-19 04:16:03');
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversaciones`
--

DROP TABLE IF EXISTS `conversaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversaciones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `especialista_id` int unsigned NOT NULL,
  `ultimo_mensaje_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_conversacion` (`paciente_id`,`especialista_id`),
  KEY `especialista_id` (`especialista_id`),
  KEY `idx_ultimo_mensaje` (`ultimo_mensaje_at`),
  CONSTRAINT `conversaciones_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversaciones_ibfk_2` FOREIGN KEY (`especialista_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversaciones`
--

LOCK TABLES `conversaciones` WRITE;
/*!40000 ALTER TABLE `conversaciones` DISABLE KEYS */;
INSERT INTO `conversaciones` VALUES (1,1,2,'2026-01-25 05:55:59','2026-01-19 16:48:37'),(2,2,3,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,3,2,'2026-01-25 06:21:12','2026-01-25 05:39:34'),(4,1,6,'2026-01-25 06:45:28','2026-01-25 06:42:54');
/*!40000 ALTER TABLE `conversaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuestionarios_bienestar`
--

DROP TABLE IF EXISTS `cuestionarios_bienestar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuestionarios_bienestar` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `fecha_semana` date NOT NULL,
  `durmio_bien` tinyint(1) DEFAULT NULL,
  `horas_sueno_promedio` decimal(3,1) DEFAULT NULL,
  `socializo` tinyint(1) DEFAULT NULL,
  `actividad_fisica` tinyint(1) DEFAULT NULL,
  `nivel_estres` tinyint unsigned DEFAULT NULL,
  `pensamientos_negativos` tinyint(1) DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha_semana`),
  CONSTRAINT `cuestionarios_bienestar_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuestionarios_bienestar`
--

LOCK TABLES `cuestionarios_bienestar` WRITE;
/*!40000 ALTER TABLE `cuestionarios_bienestar` DISABLE KEYS */;
/*!40000 ALTER TABLE `cuestionarios_bienestar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuestionarios_nutricion`
--

DROP TABLE IF EXISTS `cuestionarios_nutricion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuestionarios_nutricion` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `fecha` date NOT NULL,
  `comio_fuera_casa` tinyint(1) DEFAULT NULL,
  `vasos_agua` int unsigned DEFAULT NULL,
  `sintio_hambre_entre_comidas` tinyint(1) DEFAULT NULL,
  `dificultades` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  CONSTRAINT `cuestionarios_nutricion_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuestionarios_nutricion`
--

LOCK TABLES `cuestionarios_nutricion` WRITE;
/*!40000 ALTER TABLE `cuestionarios_nutricion` DISABLE KEYS */;
/*!40000 ALTER TABLE `cuestionarios_nutricion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidad_especialista`
--

DROP TABLE IF EXISTS `disponibilidad_especialista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidad_especialista` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `especialista_id` int unsigned NOT NULL,
  `dia_semana` tinyint unsigned NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_especialista` (`especialista_id`),
  KEY `idx_dia` (`dia_semana`),
  CONSTRAINT `disponibilidad_especialista_ibfk_1` FOREIGN KEY (`especialista_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_especialista`
--

LOCK TABLES `disponibilidad_especialista` WRITE;
/*!40000 ALTER TABLE `disponibilidad_especialista` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilidad_especialista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dispositivos_paciente`
--

DROP TABLE IF EXISTS `dispositivos_paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispositivos_paciente` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `tipo_dispositivo_id` int unsigned NOT NULL,
  `fecha_entrega` date NOT NULL,
  `marca` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modelo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_serie` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nivel_k` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_evaluacion_k` date DEFAULT NULL,
  `objetivos_rehabilitacion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `tipo_dispositivo_id` (`tipo_dispositivo_id`),
  KEY `idx_paciente` (`paciente_id`),
  CONSTRAINT `dispositivos_paciente_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dispositivos_paciente_ibfk_2` FOREIGN KEY (`tipo_dispositivo_id`) REFERENCES `tipos_dispositivo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispositivos_paciente`
--

LOCK TABLES `dispositivos_paciente` WRITE;
/*!40000 ALTER TABLE `dispositivos_paciente` DISABLE KEYS */;
INSERT INTO `dispositivos_paciente` VALUES (1,1,15,'2024-10-15','Ottobock','1C30 Trias','OB-2024-001','Prótesis transtibial con pie de carbono',1,'2026-01-19 16:48:37','2026-01-30 01:20:37','K2','2024-06-01','Caminar distancias moderadas. Meta: independencia en actividades diarias.'),(2,3,1,'2024-11-01','Össur','Pro-Flex XC','OS-2024-002','Prótesis transtibial, adaptación en proceso',1,'2026-01-19 16:48:37','2026-01-19 16:48:37',NULL,NULL,NULL),(4,2,16,'2024-08-20',NULL,NULL,'PTF-2024-002',NULL,1,'2026-01-30 00:52:25','2026-01-30 00:52:25','K3','2024-08-10','Marcha independiente. Retorno a actividades laborales.');
/*!40000 ALTER TABLE `dispositivos_paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emociones`
--

DROP TABLE IF EXISTS `emociones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emociones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria` enum('positiva','negativa','neutra') COLLATE utf8mb4_unicode_ci DEFAULT 'neutra',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emociones`
--

LOCK TABLES `emociones` WRITE;
/*!40000 ALTER TABLE `emociones` DISABLE KEYS */;
INSERT INTO `emociones` VALUES (1,'tristeza',NULL,'negativa'),(2,'alegria',NULL,'positiva'),(3,'ansiedad',NULL,'negativa'),(4,'frustracion',NULL,'negativa'),(5,'esperanza',NULL,'positiva'),(6,'miedo',NULL,'negativa'),(7,'calma',NULL,'positiva'),(8,'enojo',NULL,'negativa'),(9,'gratitud',NULL,'positiva'),(10,'confusion',NULL,'neutra'),(11,'motivacion',NULL,'positiva'),(12,'soledad',NULL,'negativa');
/*!40000 ALTER TABLE `emociones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etiquetas`
--

DROP TABLE IF EXISTS `etiquetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etiquetas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etiquetas`
--

LOCK TABLES `etiquetas` WRITE;
/*!40000 ALTER TABLE `etiquetas` DISABLE KEYS */;
/*!40000 ALTER TABLE `etiquetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faq_protesis`
--

DROP TABLE IF EXISTS `faq_protesis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faq_protesis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pregunta` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `respuesta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` enum('general','cuidados','ajustes','dolor','actividades','mantenimiento') COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faq_protesis`
--

LOCK TABLES `faq_protesis` WRITE;
/*!40000 ALTER TABLE `faq_protesis` DISABLE KEYS */;
INSERT INTO `faq_protesis` VALUES (16,'¿Cuánto tiempo dura una prótesis?','La vida útil de una prótesis varía según el tipo, uso y cuidado. En general:\n- Socket: 2-5 años\n- Liner: 6-12 meses\n- Pie protésico: 3-5 años\n- Rodilla mecánica: 5-10 años\n- Rodilla con microprocesador: 5-7 años','general',1,1,'2026-01-30 00:50:22'),(17,'¿Puedo bañarme o nadar con mi prótesis?','La mayoría de las prótesis NO son resistentes al agua. Existen prótesis acuáticas especiales. Consulta con tu protesista.','cuidados',2,1,'2026-01-30 00:50:22'),(18,'¿Qué son los niveles K?','Los niveles K (K0-K4) clasifican tu potencial de movilidad. Determinan qué componentes protésicos te corresponden.','general',3,1,'2026-01-30 00:50:22'),(19,'¿Cada cuánto debo visitar a mi protesista?','Primeros 3 meses: cada 2-4 semanas. Después: cada 6 meses mínimo. Siempre que notes problemas.','mantenimiento',4,1,'2026-01-30 00:50:22'),(20,'¿Por qué mi muñón cambia de tamaño?','Es normal por fluctuaciones de fluidos, cambios de peso, actividad física y temperatura.','cuidados',5,1,'2026-01-30 00:50:22'),(21,'¿Puedo hacer deporte con prótesis?','¡Absolutamente! Caminar, natación, ciclismo, correr. Existen prótesis deportivas especializadas.','actividades',6,1,'2026-01-30 00:50:22'),(22,'¿Cómo sé si mi prótesis está mal alineada?','Señales: dolor en rodilla/cadera/espalda, cojera, desgaste irregular del zapato, tropiezos frecuentes.','ajustes',7,1,'2026-01-30 00:50:22'),(23,'¿Qué hago si tengo dolor en el muñón?','Retira la prótesis, inspecciona la piel, descansa el muñón. Contacta a tu equipo médico si persiste.','dolor',8,1,'2026-01-30 00:50:22'),(24,'¿Cuánto cuesta una prótesis?','Desde $30,000 MXN básica hasta $800,000 MXN con microprocesador. Consulta tu seguro médico.','general',9,1,'2026-01-30 00:50:22'),(25,'¿Puedo dormir con la prótesis puesta?','No se recomienda. Permite que la piel respire y ayuda a controlar el volumen del muñón.','cuidados',10,1,'2026-01-30 00:50:22'),(26,'¿Cuánto tarda la adaptación?','Adaptación básica: 1-3 meses. Marcha fluida: 3-6 meses. Uso natural: 6-12 meses.','general',11,1,'2026-01-30 00:50:22'),(27,'¿Cómo cuido la piel del muñón?','Lavar con jabón neutro, secar bien, hidratar por la noche, inspeccionar diariamente.','cuidados',12,1,'2026-01-30 00:50:22');
/*!40000 ALTER TABLE `faq_protesis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `pregunta` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `respuesta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `area_medica_id` int unsigned DEFAULT NULL,
  `orden` int unsigned DEFAULT '0',
  `vistas` int unsigned DEFAULT '0',
  `votos_util` int unsigned DEFAULT '0',
  `votos_no_util` int unsigned DEFAULT '0',
  `publicada` tinyint(1) DEFAULT '1',
  `creado_por` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_area` (`area_medica_id`),
  KEY `idx_publicada` (`publicada`),
  FULLTEXT KEY `ft_faqs` (`pregunta`,`respuesta`),
  CONSTRAINT `faqs_ibfk_1` FOREIGN KEY (`area_medica_id`) REFERENCES `areas_medicas` (`id`),
  CONSTRAINT `faqs_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,'¿Cuántas horas al día debo usar mi prótesis al inicio?','Al principio, se recomienda usar la prótesis de 1 a 2 horas, aumentando gradualmente 30 minutos cada día según tolerancia. Tu especialista te dará indicaciones específicas.',5,1,0,0,0,1,6,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,'¿Qué hago si mi muñón está irritado?','Suspende el uso de la prótesis, limpia y seca bien el área, y contacta a tu especialista. No apliques cremas sin autorización médica.',5,2,0,0,0,1,6,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,'¿Cada cuánto debo medir mi glucosa?','Generalmente se recomienda medir en ayunas diariamente y 2 horas después de las comidas principales. Tu médico ajustará la frecuencia según tu caso.',3,1,0,0,0,1,4,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(4,'¿Qué valores de glucosa son normales?','En ayunas: 70-100 mg/dL. Después de comer (2 horas): menos de 140 mg/dL. Valores fuera de rango deben reportarse a tu médico.',3,2,0,0,0,1,4,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(5,'¿Puedo hacer ejercicio si me duele el muñón?','Un dolor leve es normal. Si el dolor es intenso (mayor a 5/10), descansa y consulta a tu fisioterapeuta antes de continuar.',1,1,0,0,0,1,2,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(6,'¿Qué alimentos debo evitar si soy diabético?','Evita azúcares refinados, bebidas azucaradas, harinas blancas, y alimentos procesados. Prefiere carbohidratos complejos y controla las porciones.',2,1,0,0,0,1,3,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(7,'¿Es normal sentir el pie que ya no tengo?','Sí, esto se llama \"sensación fantasma\" y es muy común. Técnicas como la terapia espejo y ejercicios de visualización pueden ayudar a manejarla.',4,1,0,0,0,1,5,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(8,'¿Cómo puedo manejar la ansiedad sobre mi recuperación?','Es normal sentir ansiedad. Practica técnicas de respiración, mantén comunicación con tu equipo de salud, y considera unirte al grupo de apoyo en la comunidad.',4,2,0,0,0,1,5,'2026-01-19 16:48:37','2026-01-19 16:48:37');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fases_tratamiento`
--

DROP TABLE IF EXISTS `fases_tratamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fases_tratamiento` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `numero` tinyint unsigned NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fases_tratamiento`
--

LOCK TABLES `fases_tratamiento` WRITE;
/*!40000 ALTER TABLE `fases_tratamiento` DISABLE KEYS */;
INSERT INTO `fases_tratamiento` VALUES (1,1,'Evaluación Inicial','Primera aproximación al dispositivo, evaluaciones médicas','2026-01-19 04:15:59'),(2,2,'Adaptación y Aprendizaje','Aprendizaje de uso, ejercicios básicos, ajustes','2026-01-19 04:15:59'),(3,3,'Seguimiento Activo','Uso regular, monitoreo constante, correcciones','2026-01-19 04:15:59'),(4,4,'Autonomía Completa','Uso independiente, seguimiento periódico','2026-01-19 04:15:59');
/*!40000 ALTER TABLE `fases_tratamiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guias_cuidado`
--

DROP TABLE IF EXISTS `guias_cuidado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guias_cuidado` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('limpieza_diaria','mantenimiento_semanal','inspeccion_mensual','almacenamiento','dano','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int unsigned DEFAULT '0',
  `creado_por` int unsigned DEFAULT '1',
  `publicado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `pasos` json DEFAULT NULL,
  `tips` json DEFAULT NULL,
  `advertencias` json DEFAULT NULL,
  `nivel_k_aplicable` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_tipo` (`tipo`),
  FULLTEXT KEY `ft_guias` (`titulo`,`contenido`),
  CONSTRAINT `guias_cuidado_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guias_cuidado`
--

LOCK TABLES `guias_cuidado` WRITE;
/*!40000 ALTER TABLE `guias_cuidado` DISABLE KEYS */;
INSERT INTO `guias_cuidado` VALUES (14,'Limpieza Diaria del Socket','limpieza_diaria','La limpieza diaria del socket es fundamental para mantener la higiene y prevenir problemas en la piel. Mantén tu socket limpio para prevenir irritaciones.',NULL,1,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','limpieza_protesis','[\"Retira la prótesis y el liner\", \"Limpia el interior del socket con un paño húmedo\", \"Usa jabón neutro si hay residuos\", \"Seca completamente antes de guardar\", \"Revisa que no haya grietas o daños\"]','[\"Hazlo cada noche antes de dormir\", \"Usa agua tibia, nunca caliente\", \"Deja secar al aire, no uses secador\"]','[\"No uses alcohol directo en el socket\", \"No sumerjas el socket en agua\", \"Evita productos con fragancias fuertes\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]'),(15,'Limpieza del Liner','limpieza_diaria','El liner está en contacto directo con tu piel, mantenerlo limpio es esencial. Acumula sudor y células muertas, su limpieza diaria previene infecciones.',NULL,2,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','limpieza_protesis','[\"Voltea el liner al revés\", \"Lava con agua tibia y jabón neutro\", \"Frota suavemente toda la superficie\", \"Enjuaga completamente\", \"Seca con toalla limpia\", \"Deja secar al aire antes de usar\"]','[\"Ten un liner de repuesto mientras el otro seca\", \"Revisa el liner por desgaste o roturas\", \"Reemplaza cada 6-12 meses\"]','[\"Nunca uses agua caliente\", \"No uses cremas o lociones antes de ponerte el liner\", \"No lo seques con secador de pelo\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]'),(16,'Cuidado del Muñón','limpieza_diaria','Tu muñón necesita atención diaria para mantenerse saludable. El cuidado adecuado previene irritaciones, infecciones y mejora el ajuste de la prótesis.',NULL,3,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','cuidado_munon','[\"Lava el muñón con agua tibia y jabón neutro\", \"Seca completamente, especialmente entre pliegues\", \"Inspecciona buscando enrojecimiento o heridas\", \"Aplica hidratante si la piel está seca (no antes de usar prótesis)\", \"Masajea suavemente para mejorar circulación\"]','[\"Lava por la noche para que la piel descanse\", \"Usa espejo para revisar todas las áreas\", \"Reporta cualquier cambio a tu especialista\"]','[\"No uses la prótesis si hay heridas abiertas\", \"Evita cremas perfumadas\", \"No afeites el muñón sin consultar\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]'),(17,'Inspección Semanal de la Prótesis','mantenimiento_semanal','Revisa tu prótesis cada semana para detectar problemas temprano. Una inspección regular ayuda a identificar desgaste o daños.',NULL,4,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','mantenimiento','[\"Revisa todas las correas y velcros\", \"Inspecciona el socket por grietas\", \"Verifica que los tornillos estén apretados\", \"Revisa el pie protésico por desgaste\", \"Comprueba la alineación visual\", \"Limpia las articulaciones con paño seco\"]','[\"Lleva un registro de lo que encuentras\", \"Toma fotos para comparar con el tiempo\", \"Programa revisiones profesionales cada 6 meses\"]','[\"No intentes reparaciones complejas tú mismo\", \"No uses herramientas inadecuadas\", \"Consulta ante cualquier duda\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]'),(18,'Lubricación de Articulaciones','mantenimiento_semanal','Mantén las articulaciones de tu prótesis funcionando suavemente. Necesitan lubricación periódica para funcionar correctamente.',NULL,5,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','mantenimiento','[\"Limpia la articulación con paño seco\", \"Aplica lubricante específico para prótesis\", \"Mueve la articulación varias veces\", \"Limpia el exceso de lubricante\", \"Verifica que el movimiento sea suave\"]','[\"Usa solo lubricantes recomendados por el fabricante\", \"Poco lubricante es mejor que mucho\", \"Hazlo en un lugar limpio\"]','[\"No uses WD-40 ni aceites domésticos\", \"No lubricantes las partes electrónicas\", \"Evita que el lubricante toque el liner\"]','[\"K2\", \"K3\", \"K4\"]'),(19,'Revisión Mensual Completa','inspeccion_mensual','Una vez al mes, realiza una revisión profunda de todo el sistema protésico para mantenerlo en óptimas condiciones.',NULL,6,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','mantenimiento','[\"Revisa el estado del liner (busca grietas o adelgazamiento)\", \"Inspecciona el socket interior y exterior\", \"Verifica todas las conexiones y adaptadores\", \"Revisa el pie por desgaste en la suela\", \"Comprueba la suspensión y ajuste\", \"Mide si ha habido cambios en el muñón\"]','[\"Anota cualquier cambio en un diario\", \"Compara con fotos anteriores\", \"Programa cita si notas cambios significativos\"]','[\"No ignores pequeños cambios\", \"Cambios en el ajuste pueden indicar problemas\", \"Consulta antes de ajustar tú mismo\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]'),(20,'Almacenamiento Correcto','almacenamiento','Guarda tu prótesis adecuadamente para protegerla cuando no la uses. Un almacenamiento correcto prolonga su vida útil.',NULL,7,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','mantenimiento','[\"Limpia la prótesis antes de guardar\", \"Colócala en posición vertical o acostada\", \"Usa el soporte proporcionado si tienes uno\", \"Guarda en lugar seco y fresco\", \"Mantén alejada de mascotas y niños\", \"Cubre para proteger del polvo\"]','[\"Ten un lugar fijo para guardarla\", \"Evita la luz solar directa\", \"No la dejes en el auto (temperaturas extremas)\"]','[\"No cuelgues la prótesis de las correas\", \"No la guardes húmeda\", \"Evita lugares con humedad excesiva\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]'),(21,'Señales de Alerta: Cuándo Buscar Ayuda','dano','Reconoce las señales que indican que necesitas atención profesional. Identificar problemas temprano previene complicaciones.',NULL,8,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','emergencias','[\"Revisa si hay dolor persistente o que empeora\", \"Busca enrojecimiento que no desaparece\", \"Identifica hinchazón inusual\", \"Nota cambios en el ajuste de la prótesis\", \"Detecta sonidos inusuales al caminar\", \"Observa si hay ampollas o heridas\"]','[\"No esperes a que el dolor sea severo\", \"Toma fotos de cualquier cambio en la piel\", \"Lleva registro de cuándo empezó el problema\"]','[\"Dolor intenso = consulta inmediata\", \"Heridas abiertas = no uses la prótesis\", \"Fiebre con enrojecimiento = urgencia médica\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]'),(22,'Colocación Correcta de la Prótesis','otro','Aprende la técnica correcta para ponerte tu prótesis de forma segura. Una colocación correcta asegura comodidad y previene lesiones.',NULL,9,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','colocacion','[\"Siéntate en una superficie estable\", \"Asegúrate que el muñón esté limpio y seco\", \"Coloca el liner enrollándolo desde la punta\", \"Elimina burbujas de aire del liner\", \"Introduce el muñón en el socket gradualmente\", \"Verifica que el pin de suspensión encaje (si aplica)\", \"Ponte de pie y verifica el ajuste\"]','[\"Tómate tu tiempo, especialmente al inicio\", \"Usa un espejo para verificar la posición\", \"Practica sentado antes de ponerte de pie\"]','[\"Nunca fuerces la entrada al socket\", \"Si sientes dolor, retira y revisa\", \"No uses con el muñón hinchado\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]'),(23,'Retiro Seguro de la Prótesis','otro','Técnica correcta para quitarte la prótesis sin lastimarte. Protege tu muñón y prolonga la vida del equipo.',NULL,10,1,1,'2026-01-30 02:29:55','2026-01-30 02:29:55','colocacion','[\"Siéntate en lugar seguro\", \"Libera el sistema de suspensión (pin, vacío, etc.)\", \"Sostén la prótesis firmemente\", \"Retira el muñón gradualmente\", \"Enrolla el liner hacia afuera para retirarlo\", \"Inspecciona el muñón inmediatamente\"]','[\"No tengas prisa al retirarte la prótesis\", \"Ten un lugar seguro donde colocarla\", \"Aprovecha para revisar el muñón\"]','[\"No jales bruscamente\", \"Si está pegada, no fuerces\", \"Consulta si tienes dificultad recurrente\"]','[\"K1\", \"K2\", \"K3\", \"K4\"]');
/*!40000 ALTER TABLE `guias_cuidado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_ajustes`
--

DROP TABLE IF EXISTS `historial_ajustes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_ajustes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `dispositivo_id` int unsigned NOT NULL,
  `tipo_ajuste` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `realizado_por` int unsigned NOT NULL,
  `fecha_ajuste` date NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `realizado_por` (`realizado_por`),
  KEY `idx_dispositivo` (`dispositivo_id`),
  KEY `idx_fecha` (`fecha_ajuste`),
  CONSTRAINT `historial_ajustes_ibfk_1` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos_paciente` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_ajustes_ibfk_2` FOREIGN KEY (`realizado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_ajustes`
--

LOCK TABLES `historial_ajustes` WRITE;
/*!40000 ALTER TABLE `historial_ajustes` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_ajustes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_fases`
--

DROP TABLE IF EXISTS `historial_fases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_fases` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `fase_anterior_id` int unsigned DEFAULT NULL,
  `fase_nueva_id` int unsigned NOT NULL,
  `especialista_id` int unsigned NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fase_anterior_id` (`fase_anterior_id`),
  KEY `fase_nueva_id` (`fase_nueva_id`),
  KEY `especialista_id` (`especialista_id`),
  KEY `idx_paciente` (`paciente_id`),
  KEY `idx_fecha` (`created_at`),
  CONSTRAINT `historial_fases_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_fases_ibfk_2` FOREIGN KEY (`fase_anterior_id`) REFERENCES `fases_tratamiento` (`id`),
  CONSTRAINT `historial_fases_ibfk_3` FOREIGN KEY (`fase_nueva_id`) REFERENCES `fases_tratamiento` (`id`),
  CONSTRAINT `historial_fases_ibfk_4` FOREIGN KEY (`especialista_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_fases`
--

LOCK TABLES `historial_fases` WRITE;
/*!40000 ALTER TABLE `historial_fases` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_fases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_recordatorios`
--

DROP TABLE IF EXISTS `historial_recordatorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_recordatorios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `recordatorio_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `enviado_en` timestamp NOT NULL,
  `completado` tinyint(1) DEFAULT '0',
  `completado_en` timestamp NULL DEFAULT NULL,
  `pospuesto` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_recordatorio` (`recordatorio_id`),
  KEY `idx_fecha` (`enviado_en`),
  CONSTRAINT `historial_recordatorios_ibfk_1` FOREIGN KEY (`recordatorio_id`) REFERENCES `recordatorios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_recordatorios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_recordatorios`
--

LOCK TABLES `historial_recordatorios` WRITE;
/*!40000 ALTER TABLE `historial_recordatorios` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_recordatorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios_medicamento`
--

DROP TABLE IF EXISTS `horarios_medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_medicamento` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `medicamento_id` int unsigned NOT NULL,
  `hora` time NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_medicamento` (`medicamento_id`),
  CONSTRAINT `horarios_medicamento_ibfk_1` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamentos_paciente` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_medicamento`
--

LOCK TABLES `horarios_medicamento` WRITE;
/*!40000 ALTER TABLE `horarios_medicamento` DISABLE KEYS */;
/*!40000 ALTER TABLE `horarios_medicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagenes_publicacion`
--

DROP TABLE IF EXISTS `imagenes_publicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagenes_publicacion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `publicacion_id` int unsigned NOT NULL,
  `imagen_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden` int unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `publicacion_id` (`publicacion_id`),
  CONSTRAINT `imagenes_publicacion_ibfk_1` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones_comunidad` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenes_publicacion`
--

LOCK TABLES `imagenes_publicacion` WRITE;
/*!40000 ALTER TABLE `imagenes_publicacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `imagenes_publicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes_articulo`
--

DROP TABLE IF EXISTS `likes_articulo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes_articulo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `articulo_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`articulo_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `likes_articulo_ibfk_1` FOREIGN KEY (`articulo_id`) REFERENCES `articulos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_articulo_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes_articulo`
--

LOCK TABLES `likes_articulo` WRITE;
/*!40000 ALTER TABLE `likes_articulo` DISABLE KEYS */;
/*!40000 ALTER TABLE `likes_articulo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_accesos`
--

DROP TABLE IF EXISTS `log_accesos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_accesos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned DEFAULT NULL,
  `email_intento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accion` enum('login_exitoso','login_fallido','logout','recuperacion_solicitada','recuperacion_exitosa','bloqueo_cuenta','cambio_password','cambio_pin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `detalles` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_accion` (`accion`),
  KEY `idx_fecha` (`created_at`),
  CONSTRAINT `log_accesos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_accesos`
--

LOCK TABLES `log_accesos` WRITE;
/*!40000 ALTER TABLE `log_accesos` DISABLE KEYS */;
INSERT INTO `log_accesos` VALUES (1,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 16:57:57'),(2,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 16:58:16'),(3,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:01:02'),(4,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:01:06'),(5,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 17:34:42'),(6,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 17:35:43'),(7,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:40:27'),(8,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:40:46'),(9,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:45:31'),(10,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:45:38'),(11,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-19 17:46:43'),(12,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-19 17:47:39'),(13,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-19 17:47:50'),(14,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-19 17:49:19'),(15,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-19 17:50:09'),(16,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:52:56'),(17,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:56:00'),(18,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:56:08'),(19,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:56:16'),(20,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:56:34'),(21,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 17:57:11'),(22,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 17:57:13'),(23,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 17:57:14'),(24,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 17:57:14'),(25,7,'paciente1@test.com','login_fallido','::1',NULL,NULL,'2026-01-19 17:57:14'),(26,7,'paciente1@test.com','bloqueo_cuenta','::1',NULL,NULL,'2026-01-19 17:57:14'),(27,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:58:59'),(28,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:59:05'),(29,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 17:59:46'),(30,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:00:12'),(31,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:00:59'),(32,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:03:01'),(33,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:03:39'),(34,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:06:56'),(35,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:09:55'),(36,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-19 18:16:19'),(37,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-19 18:16:40'),(38,1,'admin@vitalia.app','bloqueo_cuenta','::1',NULL,NULL,'2026-01-19 18:16:40'),(39,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:17:09'),(40,7,'paciente1@test.com','login_exitoso','127.0.0.1',NULL,NULL,'2026-01-19 18:29:22'),(41,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:41:49'),(42,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:42:39'),(43,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:45:44'),(44,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 18:48:25'),(45,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-19 19:00:20'),(46,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-20 03:21:42'),(47,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-20 03:37:29'),(48,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-20 15:21:31'),(49,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-20 16:56:51'),(50,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-20 17:22:56'),(51,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-20 17:24:11'),(52,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-20 17:45:26'),(53,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-23 21:37:29'),(54,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-23 21:49:06'),(55,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-23 21:49:14'),(56,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-23 21:49:42'),(57,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-23 21:50:02'),(58,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-23 22:58:47'),(59,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-23 23:16:40'),(60,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-23 23:38:55'),(61,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-24 00:01:50'),(62,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-24 00:11:01'),(63,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-24 00:52:04'),(64,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-24 00:55:26'),(65,1,'admin@vitalia.app','login_fallido','::1',NULL,NULL,'2026-01-24 01:19:29'),(66,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-24 01:19:36'),(67,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-24 01:20:06'),(68,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-24 01:24:25'),(69,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-24 04:22:28'),(70,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 04:34:16'),(71,3,'dra.martinez@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 04:36:51'),(72,1,'admin@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 04:42:36'),(73,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 04:45:08'),(74,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-25 05:55:45'),(75,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 05:59:31'),(76,9,'paciente3@test.com','login_exitoso','::1',NULL,NULL,'2026-01-25 06:07:45'),(77,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 06:20:42'),(78,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-25 06:42:02'),(79,6,'tec.sanchez@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 06:45:20'),(80,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-25 06:51:14'),(81,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 06:59:32'),(82,2,'dr.garcia@vitalia.app','login_exitoso','::1',NULL,NULL,'2026-01-25 07:17:31'),(83,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-25 07:18:08'),(84,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-29 21:53:30'),(85,7,'paciente1@test.com','login_exitoso','::1',NULL,NULL,'2026-01-30 00:58:00');
/*!40000 ALTER TABLE `log_accesos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_auditoria`
--

DROP TABLE IF EXISTS `log_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_auditoria` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned DEFAULT NULL,
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tabla_afectada` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registro_id` int unsigned DEFAULT NULL,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_accion` (`accion`),
  KEY `idx_tabla` (`tabla_afectada`),
  KEY `idx_fecha` (`created_at`),
  CONSTRAINT `log_auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_auditoria`
--

LOCK TABLES `log_auditoria` WRITE;
/*!40000 ALTER TABLE `log_auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicamentos_paciente`
--

DROP TABLE IF EXISTS `medicamentos_paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamentos_paciente` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `nombre_comercial` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_generico` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dosis` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frecuencia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `via_administracion` enum('oral','inyectable','topica','inhalada','sublingual','otra') COLLATE utf8mb4_unicode_ci DEFAULT 'oral',
  `instrucciones_especiales` text COLLATE utf8mb4_unicode_ci,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_por` int unsigned NOT NULL,
  `notas_medico` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_paciente` (`paciente_id`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `medicamentos_paciente_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medicamentos_paciente_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamentos_paciente`
--

LOCK TABLES `medicamentos_paciente` WRITE;
/*!40000 ALTER TABLE `medicamentos_paciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicamentos_paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_chat`
--

DROP TABLE IF EXISTS `mensajes_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_chat` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversacion_id` int unsigned NOT NULL,
  `remitente_id` int unsigned NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `leido_at` timestamp NULL DEFAULT NULL,
  `expira_en` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `remitente_id` (`remitente_id`),
  KEY `idx_conversacion` (`conversacion_id`),
  KEY `idx_expiracion` (`expira_en`),
  KEY `idx_leido` (`leido`),
  CONSTRAINT `mensajes_chat_ibfk_1` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_chat_ibfk_2` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_chat`
--

LOCK TABLES `mensajes_chat` WRITE;
/*!40000 ALTER TABLE `mensajes_chat` DISABLE KEYS */;
INSERT INTO `mensajes_chat` VALUES (1,1,7,'Dr. García, ¿puedo hacer los ejercicios si me duele un poco el muñón?',1,'2026-01-25 06:21:05','2026-01-20 14:48:37','2026-01-19 16:48:37'),(2,1,2,'Hola Juan, si el dolor es leve (1-3) puedes continuar. Si aumenta, descansa y me avisas.',1,'2026-01-25 07:18:44','2026-01-20 15:48:37','2026-01-19 16:48:37'),(3,1,7,'Perfecto, gracias doctor. El dolor es como 2, entonces continuaré.',1,'2026-01-25 06:21:05','2026-01-20 16:48:37','2026-01-19 16:48:37'),(4,2,8,'Licenciada, ¿puedo sustituir el pollo por atún en la receta?',1,NULL,'2026-01-20 13:48:37','2026-01-19 16:48:37'),(5,2,3,'Sí María, el atún es una excelente fuente de proteína. Solo asegúrate de que sea en agua, no en aceite.',0,NULL,'2026-01-20 14:48:37','2026-01-19 16:48:37'),(6,3,2,'wrgegrger',1,'2026-01-25 06:20:27','2026-01-26 08:39:44','2026-01-25 05:39:44'),(7,3,2,'sdfghgfd',1,'2026-01-25 06:20:27','2026-01-26 08:39:52','2026-01-25 05:39:52'),(8,1,2,'gtfbgfbgfb',1,'2026-01-25 07:18:44','2026-01-26 08:40:02','2026-01-25 05:40:02'),(9,1,7,'srdtfryhuklñ{',1,'2026-01-25 06:21:05','2026-01-26 08:55:59','2026-01-25 05:55:59'),(10,3,9,'hola es una prueba lol q ml',1,'2026-01-25 06:37:54','2026-01-26 09:08:11','2026-01-25 06:08:11'),(11,3,9,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',1,'2026-01-25 06:37:54','2026-01-26 09:08:16','2026-01-25 06:08:16'),(12,3,9,'aaaaaaaaaaaaaaaaaaaaaaaa',1,'2026-01-25 06:37:54','2026-01-26 09:08:24','2026-01-25 06:08:24'),(13,3,9,'dios mio',1,'2026-01-25 06:37:54','2026-01-26 09:20:17','2026-01-25 06:20:17'),(14,3,2,'hola',0,NULL,'2026-01-26 09:21:12','2026-01-25 06:21:12'),(15,4,7,'Holis',1,'2026-01-25 06:45:25','2026-01-26 09:42:57','2026-01-25 06:42:57'),(16,4,6,'holis',1,'2026-01-25 07:18:45','2026-01-26 09:45:28','2026-01-25 06:45:28');
/*!40000 ALTER TABLE `mensajes_chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `momentos_medicion`
--

DROP TABLE IF EXISTS `momentos_medicion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `momentos_medicion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `momentos_medicion`
--

LOCK TABLES `momentos_medicion` WRITE;
/*!40000 ALTER TABLE `momentos_medicion` DISABLE KEYS */;
INSERT INTO `momentos_medicion` VALUES (1,'ayuno','Antes del desayuno',1),(2,'post_desayuno','Después del desayuno',2),(3,'pre_comida','Antes de la comida',3),(4,'post_comida','Después de la comida',4),(5,'pre_cena','Antes de la cena',5),(6,'post_cena','Después de la cena',6),(7,'antes_dormir','Antes de dormir',7);
/*!40000 ALTER TABLE `momentos_medicion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `niveles_ejercicio`
--

DROP TABLE IF EXISTS `niveles_ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `niveles_ejercicio` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden` int unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `niveles_ejercicio`
--

LOCK TABLES `niveles_ejercicio` WRITE;
/*!40000 ALTER TABLE `niveles_ejercicio` DISABLE KEYS */;
INSERT INTO `niveles_ejercicio` VALUES (1,'basico',1),(2,'intermedio',2),(3,'avanzado',3);
/*!40000 ALTER TABLE `niveles_ejercicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `niveles_k`
--

DROP TABLE IF EXISTS `niveles_k`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `niveles_k` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nivel` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `caracteristicas` json DEFAULT NULL,
  `actividades_permitidas` json DEFAULT NULL,
  `tipo_protesis_recomendada` json DEFAULT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nivel` (`nivel`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `niveles_k`
--

LOCK TABLES `niveles_k` WRITE;
/*!40000 ALTER TABLE `niveles_k` DISABLE KEYS */;
INSERT INTO `niveles_k` VALUES (1,'K0','No Ambulatorio','El paciente no tiene la capacidad o el potencial para deambular o transferirse de manera segura con o sin asistencia. Una prótesis no mejora la calidad de vida o la movilidad.','[\"No puede caminar ni con asistencia\", \"Usa silla de ruedas permanentemente\", \"Puede necesitar prótesis cosmética\", \"Enfoque en transferencias seguras\"]','[\"Transferencias asistidas\", \"Actividades sedentarias\", \"Terapia ocupacional adaptada\"]','[\"Prótesis cosmética (opcional)\", \"No se recomienda prótesis funcional\"]','/images/niveles/k0.png','2026-01-29 21:51:52'),(2,'K1','Ambulador de Interiores','El paciente tiene la capacidad o potencial de usar una prótesis para transferencias o para deambulación en superficies planas a un ritmo fijo. Es un caminador ilimitado en el hogar o ambulador limitado en la comunidad.','[\"Camina en superficies planas y uniformes\", \"Velocidad de marcha fija y lenta\", \"Principalmente en interiores\", \"Puede necesitar ayudas como bastón o andadera\", \"Buen candidato para rehabilitación básica\"]','[\"Caminar en casa\", \"Transferencias independientes\", \"Actividades de la vida diaria en el hogar\", \"Caminatas cortas en exteriores controlados\"]','[\"Pie SACH (Solid Ankle Cushion Heel)\", \"Pie de eje simple\", \"Rodilla con bloqueo manual (transfemoral)\", \"Socket de contacto total\"]','/images/niveles/k1.png','2026-01-29 21:51:52'),(3,'K2','Ambulador Comunitario Limitado','El paciente tiene la capacidad o potencial para deambular con la habilidad de atravesar barreras ambientales de bajo nivel como bordillos, escaleras o superficies irregulares.','[\"Camina en exteriores con precaución\", \"Puede subir escaleras con baranda\", \"Supera obstáculos pequeños\", \"Velocidad variable limitada\", \"Camina distancias moderadas\"]','[\"Caminatas en la comunidad\", \"Subir y bajar escaleras\", \"Caminar en superficies irregulares\", \"Compras y mandados\", \"Trabajo sedentario o de pie limitado\"]','[\"Pie de respuesta dinámica básica\", \"Pie multiaxial\", \"Rodilla policéntrica\", \"Rodilla con control de fricción\", \"Sistema de suspensión con pin o vacío\"]','/images/niveles/k2.png','2026-01-29 21:51:52'),(4,'K3','Ambulador Comunitario Ilimitado','El paciente tiene la capacidad o potencial para deambulación con cadencia variable. Es un caminador comunitario típico con la habilidad de atravesar la mayoría de las barreras ambientales y puede tener actividad vocacional, terapéutica o de ejercicio.','[\"Camina a diferentes velocidades\", \"Supera la mayoría de obstáculos\", \"Puede correr distancias cortas\", \"Participa en actividades recreativas\", \"Alta demanda de la prótesis\"]','[\"Caminatas largas\", \"Deportes recreativos\", \"Ciclismo\", \"Natación\", \"Trabajo activo\", \"Senderismo ligero\", \"Golf, boliche\"]','[\"Pie de respuesta dinámica avanzada\", \"Pie de fibra de carbono\", \"Rodilla con microprocesador (opcional)\", \"Rodilla hidráulica\", \"Rodilla con control de fase de apoyo y balanceo\"]','/images/niveles/k3.png','2026-01-29 21:51:52'),(5,'K4','Ambulador de Alta Actividad','El paciente tiene la capacidad o potencial para la deambulación protésica que excede las habilidades de ambulación básica, exhibiendo alta demanda de impacto, estrés o niveles de energía. Típico de las demandas protésicas del niño activo, adulto atlético o trabajador muy activo.','[\"Atleta o muy activo físicamente\", \"Corre y salta\", \"Practica deportes de impacto\", \"Niños activos\", \"Trabajos de alta demanda física\"]','[\"Correr y trotar\", \"Deportes de impacto\", \"Baloncesto, fútbol, tenis\", \"Escalada\", \"Esquí\", \"Trabajo físicamente demandante\", \"Competencias deportivas\"]','[\"Pie de carrera/running\", \"Pie de alto rendimiento deportivo\", \"Rodilla con microprocesador\", \"Rodilla deportiva especializada\", \"Componentes de titanio o fibra de carbono\"]','/images/niveles/k4.png','2026-01-29 21:51:52');
/*!40000 ALTER TABLE `niveles_k` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci,
  `datos` json DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `leida_en` timestamp NULL DEFAULT NULL,
  `referencia_tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_leida` (`leida`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fecha` (`created_at`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `objetivos_nutricion`
--

DROP TABLE IF EXISTS `objetivos_nutricion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objetivos_nutricion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `calorias` int DEFAULT '1800',
  `carbohidratos` int DEFAULT '167',
  `proteinas` int DEFAULT '93',
  `grasas` int DEFAULT '49',
  `agua` decimal(4,2) DEFAULT '2.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_paciente` (`paciente_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objetivos_nutricion`
--

LOCK TABLES `objetivos_nutricion` WRITE;
/*!40000 ALTER TABLE `objetivos_nutricion` DISABLE KEYS */;
/*!40000 ALTER TABLE `objetivos_nutricion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `fase_actual_id` int unsigned DEFAULT '1',
  `fecha_cambio_fase` date DEFAULT NULL,
  `progreso_general` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  KEY `idx_fase` (`fase_actual_id`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pacientes_ibfk_2` FOREIGN KEY (`fase_actual_id`) REFERENCES `fases_tratamiento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,7,3,'2024-10-01',65.00,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,8,2,'2024-11-01',40.00,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,9,3,'2024-09-15',80.00,'2026-01-19 16:48:37','2026-01-19 16:48:37');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_notificacion`
--

DROP TABLE IF EXISTS `preferencias_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferencias_notificacion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `email_citas` tinyint(1) DEFAULT '1',
  `email_mensajes` tinyint(1) DEFAULT '1',
  `email_comunidad` tinyint(1) DEFAULT '1',
  `email_recordatorios` tinyint(1) DEFAULT '1',
  `push_citas` tinyint(1) DEFAULT '1',
  `push_mensajes` tinyint(1) DEFAULT '1',
  `push_comunidad` tinyint(1) DEFAULT '1',
  `push_recordatorios` tinyint(1) DEFAULT '1',
  `frecuencia_comunidad` enum('inmediata','diaria','desactivada') COLLATE utf8mb4_unicode_ci DEFAULT 'inmediata',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `preferencias_notificacion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_notificacion`
--

LOCK TABLES `preferencias_notificacion` WRITE;
/*!40000 ALTER TABLE `preferencias_notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `preferencias_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problemas_ortesis`
--

DROP TABLE IF EXISTS `problemas_ortesis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problemas_ortesis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `urgencia` enum('baja','media','alta') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `estado` enum('pendiente','en_revision','resuelto') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `respuesta` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `problemas_ortesis_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problemas_ortesis`
--

LOCK TABLES `problemas_ortesis` WRITE;
/*!40000 ALTER TABLE `problemas_ortesis` DISABLE KEYS */;
/*!40000 ALTER TABLE `problemas_ortesis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicaciones_comunidad`
--

DROP TABLE IF EXISTS `publicaciones_comunidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicaciones_comunidad` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `tema_id` int unsigned NOT NULL,
  `titulo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_anonimo` tinyint(1) DEFAULT '0',
  `estado` enum('pendiente','aprobada','rechazada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `moderado_por` int unsigned DEFAULT NULL,
  `moderado_en` timestamp NULL DEFAULT NULL,
  `motivo_rechazo` text COLLATE utf8mb4_unicode_ci,
  `destacada` tinyint(1) DEFAULT '0',
  `total_reacciones` int unsigned DEFAULT '0',
  `total_comentarios` int unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `moderado_por` (`moderado_por`),
  KEY `idx_estado` (`estado`),
  KEY `idx_tema` (`tema_id`),
  KEY `idx_fecha` (`created_at`),
  KEY `idx_destacada` (`destacada`),
  CONSTRAINT `publicaciones_comunidad_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `publicaciones_comunidad_ibfk_2` FOREIGN KEY (`tema_id`) REFERENCES `temas_comunidad` (`id`),
  CONSTRAINT `publicaciones_comunidad_ibfk_3` FOREIGN KEY (`moderado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicaciones_comunidad`
--

LOCK TABLES `publicaciones_comunidad` WRITE;
/*!40000 ALTER TABLE `publicaciones_comunidad` DISABLE KEYS */;
INSERT INTO `publicaciones_comunidad` VALUES (1,7,2,'Mi primer medio kilómetro','¡Hoy logré caminar 500 metros con mi prótesis sin descansar! Hace 3 meses apenas podía dar 10 pasos. No se rindan, el esfuerzo vale la pena.',0,'aprobada',NULL,NULL,NULL,0,3,2,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,8,9,'Tips para el dolor fantasma','¿Alguien tiene tips para el dolor fantasma en las noches? A veces me despierta y no sé qué hacer.',0,'aprobada',NULL,NULL,NULL,0,2,2,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,9,8,'Gracias a esta comunidad','Gracias a todos en este grupo. Cuando me dijeron que necesitaba una prótesis, pensé que mi vida había terminado. Ahora, 6 meses después, me doy cuenta de que apenas está comenzando una nueva etapa.',0,'aprobada',NULL,NULL,NULL,0,3,0,'2026-01-19 16:48:37','2026-01-19 16:48:37');
/*!40000 ALTER TABLE `publicaciones_comunidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reacciones_publicacion`
--

DROP TABLE IF EXISTS `reacciones_publicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reacciones_publicacion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `publicacion_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `tipo_reaccion_id` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reaccion` (`publicacion_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `tipo_reaccion_id` (`tipo_reaccion_id`),
  CONSTRAINT `reacciones_publicacion_ibfk_1` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones_comunidad` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reacciones_publicacion_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reacciones_publicacion_ibfk_3` FOREIGN KEY (`tipo_reaccion_id`) REFERENCES `tipos_reaccion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reacciones_publicacion`
--

LOCK TABLES `reacciones_publicacion` WRITE;
/*!40000 ALTER TABLE `reacciones_publicacion` DISABLE KEYS */;
INSERT INTO `reacciones_publicacion` VALUES (1,1,8,1,'2026-01-19 16:48:37'),(2,1,9,2,'2026-01-19 16:48:37'),(3,1,3,5,'2026-01-19 16:48:37'),(4,2,7,5,'2026-01-19 16:48:37'),(5,2,9,1,'2026-01-19 16:48:37'),(6,3,7,1,'2026-01-19 16:48:37'),(7,3,8,3,'2026-01-19 16:48:37'),(8,3,2,5,'2026-01-19 16:48:37');
/*!40000 ALTER TABLE `reacciones_publicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recetas`
--

DROP TABLE IF EXISTS `recetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recetas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `ingredientes` json NOT NULL,
  `instrucciones` json NOT NULL,
  `tiempo_preparacion` int unsigned DEFAULT NULL,
  `porciones` int unsigned DEFAULT '1',
  `calorias` decimal(8,2) DEFAULT NULL,
  `proteinas` decimal(8,2) DEFAULT NULL,
  `carbohidratos` decimal(8,2) DEFAULT NULL,
  `grasas` decimal(8,2) DEFAULT NULL,
  `imagen_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_comida_id` int unsigned DEFAULT NULL,
  `creado_por` int unsigned NOT NULL,
  `publicada` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_tipo` (`tipo_comida_id`),
  KEY `idx_publicada` (`publicada`),
  FULLTEXT KEY `ft_recetas` (`titulo`,`descripcion`),
  CONSTRAINT `recetas_ibfk_1` FOREIGN KEY (`tipo_comida_id`) REFERENCES `tipos_comida` (`id`),
  CONSTRAINT `recetas_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recetas`
--

LOCK TABLES `recetas` WRITE;
/*!40000 ALTER TABLE `recetas` DISABLE KEYS */;
INSERT INTO `recetas` VALUES (1,'Desayuno energético proteico','Ideal para comenzar el día con energía durante la rehabilitación','[\"2 huevos\", \"1 rebanada de pan integral\", \"1/2 aguacate\", \"1 taza de espinacas\", \"Sal y pimienta al gusto\"]','[\"Cocinar los huevos revueltos a fuego medio\", \"Tostar el pan integral\", \"Servir con aguacate rebanado y espinacas frescas\", \"Sazonar al gusto\"]',15,1,350.00,18.00,25.00,20.00,NULL,1,3,1,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,'Pollo a la plancha con verduras','Almuerzo balanceado y fácil de preparar','[\"150g pechuga de pollo\", \"1 taza de brócoli\", \"1/2 taza de zanahoria\", \"1 cucharada de aceite de oliva\", \"Hierbas al gusto\"]','[\"Sazonar el pollo con hierbas\", \"Cocinar a la plancha 6-7 minutos por lado\", \"Cocer las verduras al vapor\", \"Servir juntos\"]',25,1,320.00,35.00,15.00,12.00,NULL,3,3,1,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,'Licuado de recuperación','Bebida ideal post-ejercicio para recuperación muscular','[\"1 plátano\", \"1 taza de leche descremada\", \"2 cucharadas de avena\", \"1 cucharada de mantequilla de maní\", \"Canela al gusto\"]','[\"Colocar todos los ingredientes en la licuadora\", \"Licuar hasta obtener consistencia homogénea\", \"Servir inmediatamente\"]',5,1,280.00,12.00,40.00,8.00,NULL,2,3,1,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(4,'Ensalada mediterránea','Cena ligera rica en nutrientes','[\"2 tazas de lechuga mixta\", \"1/2 taza de tomate cherry\", \"1/4 taza de pepino\", \"30g queso feta\", \"1 cucharada de aceite de oliva\", \"Orégano\"]','[\"Lavar y cortar las verduras\", \"Mezclar en un bowl\", \"Agregar queso feta\", \"Aderezar con aceite y orégano\"]',10,1,180.00,8.00,12.00,12.00,NULL,5,3,1,'2026-01-19 16:48:37','2026-01-19 16:48:37');
/*!40000 ALTER TABLE `recetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recetas_asignadas`
--

DROP TABLE IF EXISTS `recetas_asignadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recetas_asignadas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `receta_id` int unsigned NOT NULL,
  `asignado_por` int unsigned NOT NULL,
  `notas_personalizadas` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion` (`paciente_id`,`receta_id`),
  KEY `receta_id` (`receta_id`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_paciente` (`paciente_id`),
  CONSTRAINT `recetas_asignadas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recetas_asignadas_ibfk_2` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recetas_asignadas_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recetas_asignadas`
--

LOCK TABLES `recetas_asignadas` WRITE;
/*!40000 ALTER TABLE `recetas_asignadas` DISABLE KEYS */;
INSERT INTO `recetas_asignadas` VALUES (1,1,1,3,'Ideal para días de ejercicio',1,'2026-01-19 16:48:37'),(2,1,2,3,'Reducir sal por hipertensión',1,'2026-01-19 16:48:37'),(3,1,4,3,'Cena ligera recomendada',1,'2026-01-19 16:48:37'),(4,3,1,3,NULL,1,'2026-01-19 16:48:37'),(5,3,3,3,'Tomar después de fisioterapia',1,'2026-01-19 16:48:37');
/*!40000 ALTER TABLE `recetas_asignadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recetas_favoritas`
--

DROP TABLE IF EXISTS `recetas_favoritas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recetas_favoritas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `receta_id` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorito` (`usuario_id`,`receta_id`),
  KEY `receta_id` (`receta_id`),
  CONSTRAINT `recetas_favoritas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recetas_favoritas_ibfk_2` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recetas_favoritas`
--

LOCK TABLES `recetas_favoritas` WRITE;
/*!40000 ALTER TABLE `recetas_favoritas` DISABLE KEYS */;
/*!40000 ALTER TABLE `recetas_favoritas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recordatorios`
--

DROP TABLE IF EXISTS `recordatorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recordatorios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `tipo_id` int unsigned NOT NULL,
  `hora` time NOT NULL,
  `dias_semana` json NOT NULL,
  `mensaje_personalizado` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `referencia_tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tipo_id` (`tipo_id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `recordatorios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recordatorios_ibfk_2` FOREIGN KEY (`tipo_id`) REFERENCES `tipos_recordatorio` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recordatorios`
--

LOCK TABLES `recordatorios` WRITE;
/*!40000 ALTER TABLE `recordatorios` DISABLE KEYS */;
INSERT INTO `recordatorios` VALUES (1,7,6,'08:00:00','[\"lunes\", \"martes\", \"miercoles\", \"jueves\", \"viernes\", \"sabado\", \"domingo\"]','Tomar Metformina 500mg con el desayuno',1,NULL,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,7,6,'08:00:00','[\"lunes\", \"martes\", \"miercoles\", \"jueves\", \"viernes\", \"sabado\", \"domingo\"]','Tomar Losartán 50mg para presión',1,NULL,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,7,3,'10:00:00','[\"lunes\", \"miercoles\", \"viernes\"]','Ejercicios de fortalecimiento de muñón',1,NULL,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(4,7,1,'07:00:00','[\"lunes\", \"martes\", \"miercoles\", \"jueves\", \"viernes\", \"sabado\", \"domingo\"]','Medir glucosa en ayunas',1,NULL,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(5,9,6,'08:00:00','[\"lunes\", \"martes\", \"miercoles\", \"jueves\", \"viernes\", \"sabado\", \"domingo\"]','Tomar Metformina 850mg',1,NULL,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(6,9,3,'11:00:00','[\"martes\", \"jueves\", \"sabado\"]','Práctica de marcha con prótesis',1,NULL,NULL,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(8,7,4,'21:31:00','[\"lunes\", \"martes\"]','sdfsdsdcs',1,NULL,NULL,'2026-01-20 03:30:58','2026-01-20 03:30:58'),(9,7,3,'00:52:00','[\"domingo\", \"lunes\", \"martes\", \"miercoles\", \"jueves\", \"viernes\", \"sabado\"]','holi',1,NULL,NULL,'2026-01-25 06:51:58','2026-01-25 06:51:58');
/*!40000 ALTER TABLE `recordatorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_agua`
--

DROP TABLE IF EXISTS `registro_agua`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_agua` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `fecha` date NOT NULL,
  `cantidad` decimal(4,2) DEFAULT '0.00',
  `vasos` tinyint unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_dia` (`paciente_id`,`fecha`),
  KEY `idx_paciente` (`paciente_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_agua`
--

LOCK TABLES `registro_agua` WRITE;
/*!40000 ALTER TABLE `registro_agua` DISABLE KEYS */;
INSERT INTO `registro_agua` VALUES (1,1,'2026-01-20',0.50,2,'2026-01-20 16:00:56','2026-01-20 16:00:56');
/*!40000 ALTER TABLE `registro_agua` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_animo`
--

DROP TABLE IF EXISTS `registro_animo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_animo` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `nivel_animo` tinyint unsigned NOT NULL,
  `nivel_motivacion` tinyint unsigned DEFAULT NULL,
  `nivel_energia` tinyint unsigned DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  KEY `idx_nivel_animo` (`nivel_animo`),
  CONSTRAINT `registro_animo_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_animo`
--

LOCK TABLES `registro_animo` WRITE;
/*!40000 ALTER TABLE `registro_animo` DISABLE KEYS */;
INSERT INTO `registro_animo` VALUES (1,1,4,4,3,'Buen día de ejercicios','2026-01-17','2026-01-19 16:48:37'),(2,1,5,5,4,'Logré caminar sin apoyo','2026-01-18','2026-01-19 16:48:37'),(3,1,4,4,4,'Familia me visitó','2026-01-19','2026-01-19 16:48:37'),(4,2,3,2,3,'Nervioso por la próxima cita','2026-01-18','2026-01-19 16:48:37'),(5,2,3,3,3,'Día normal','2026-01-19','2026-01-19 16:48:37'),(6,3,4,4,4,'Me adapto bien a la prótesis','2026-01-18','2026-01-19 16:48:37'),(7,3,2,2,2,'Tropecé hoy','2026-01-19','2026-01-19 16:48:37'),(8,1,2,NULL,NULL,'sdsdfdsfdsfdsfds','2026-01-20','2026-01-20 17:06:56');
/*!40000 ALTER TABLE `registro_animo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_animo_emociones`
--

DROP TABLE IF EXISTS `registro_animo_emociones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_animo_emociones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `registro_animo_id` bigint unsigned NOT NULL,
  `emocion_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_emocion` (`registro_animo_id`,`emocion_id`),
  KEY `emocion_id` (`emocion_id`),
  CONSTRAINT `registro_animo_emociones_ibfk_1` FOREIGN KEY (`registro_animo_id`) REFERENCES `registro_animo` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registro_animo_emociones_ibfk_2` FOREIGN KEY (`emocion_id`) REFERENCES `emociones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_animo_emociones`
--

LOCK TABLES `registro_animo_emociones` WRITE;
/*!40000 ALTER TABLE `registro_animo_emociones` DISABLE KEYS */;
INSERT INTO `registro_animo_emociones` VALUES (1,1,7),(2,2,2),(3,2,9),(4,3,9),(5,4,3),(6,5,7),(7,6,5),(8,6,11),(9,7,4),(10,8,1);
/*!40000 ALTER TABLE `registro_animo_emociones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_comidas`
--

DROP TABLE IF EXISTS `registro_comidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_comidas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `tipo_comida_id` int unsigned NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `alimento_id` int unsigned DEFAULT NULL,
  `calorias_override` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tipo_comida_id` (`tipo_comida_id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `registro_comidas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registro_comidas_ibfk_2` FOREIGN KEY (`tipo_comida_id`) REFERENCES `tipos_comida` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_comidas`
--

LOCK TABLES `registro_comidas` WRITE;
/*!40000 ALTER TABLE `registro_comidas` DISABLE KEYS */;
INSERT INTO `registro_comidas` VALUES (1,1,2,'sdfsddsfsdfsdsdsdsds',NULL,'2026-01-19','13:00:37','2026-01-19 19:00:37','2026-01-19 19:00:37',NULL,NULL),(2,1,3,'asdfsadvsdcxd',NULL,'2026-01-19','13:03:59','2026-01-19 19:03:59','2026-01-19 19:03:59',NULL,NULL);
/*!40000 ALTER TABLE `registro_comidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_medicamentos`
--

DROP TABLE IF EXISTS `registro_medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_medicamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `medicamento_id` int unsigned NOT NULL,
  `paciente_id` int unsigned NOT NULL,
  `horario_id` int unsigned NOT NULL,
  `fecha` date NOT NULL,
  `hora_programada` time NOT NULL,
  `hora_real` time DEFAULT NULL,
  `estado` enum('tomado_a_tiempo','tomado_tarde','omitido','doble_dosis') COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo_omision` enum('olvide','no_tenia_medicamento','efectos_secundarios','otro') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `efectos_secundarios` text COLLATE utf8mb4_unicode_ci,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `horario_id` (`horario_id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  KEY `idx_medicamento_fecha` (`medicamento_id`,`fecha`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `registro_medicamentos_ibfk_1` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamentos_paciente` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registro_medicamentos_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registro_medicamentos_ibfk_3` FOREIGN KEY (`horario_id`) REFERENCES `horarios_medicamento` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_medicamentos`
--

LOCK TABLES `registro_medicamentos` WRITE;
/*!40000 ALTER TABLE `registro_medicamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `registro_medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_videos`
--

DROP TABLE IF EXISTS `registro_videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_videos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `video_id` int unsigned NOT NULL,
  `porcentaje_visto` tinyint unsigned DEFAULT '0',
  `completado` tinyint(1) DEFAULT '0',
  `fecha` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `video_id` (`video_id`),
  KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  CONSTRAINT `registro_videos_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registro_videos_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos_ejercicios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_videos`
--

LOCK TABLES `registro_videos` WRITE;
/*!40000 ALTER TABLE `registro_videos` DISABLE KEYS */;
/*!40000 ALTER TABLE `registro_videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes_contenido`
--

DROP TABLE IF EXISTS `reportes_contenido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes_contenido` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `reportado_por` int unsigned NOT NULL,
  `tipo_contenido` enum('publicacion','comentario') COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido_id` int unsigned NOT NULL,
  `razon` enum('spam','contenido_inapropiado','lenguaje_ofensivo','informacion_incorrecta','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('pendiente','revisado','accion_tomada','desestimado') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `revisado_por` int unsigned DEFAULT NULL,
  `accion_tomada` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reportado_por` (`reportado_por`),
  KEY `revisado_por` (`revisado_por`),
  KEY `idx_estado` (`estado`),
  KEY `idx_tipo` (`tipo_contenido`),
  CONSTRAINT `reportes_contenido_ibfk_1` FOREIGN KEY (`reportado_por`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `reportes_contenido_ibfk_2` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes_contenido`
--

LOCK TABLES `reportes_contenido` WRITE;
/*!40000 ALTER TABLE `reportes_contenido` DISABLE KEYS */;
/*!40000 ALTER TABLE `reportes_contenido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes_problemas`
--

DROP TABLE IF EXISTS `reportes_problemas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes_problemas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `dispositivo_id` int unsigned NOT NULL,
  `paciente_id` int unsigned NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `severidad` enum('leve','moderado','severo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('pendiente','en_revision','resuelto') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `fecha_reporte` date NOT NULL,
  `fecha_resolucion` date DEFAULT NULL,
  `notas_resolucion` text COLLATE utf8mb4_unicode_ci,
  `atendido_por` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `dispositivo_id` (`dispositivo_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `atendido_por` (`atendido_por`),
  KEY `idx_estado` (`estado`),
  KEY `idx_severidad` (`severidad`),
  CONSTRAINT `reportes_problemas_ibfk_1` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos_paciente` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reportes_problemas_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reportes_problemas_ibfk_3` FOREIGN KEY (`atendido_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes_problemas`
--

LOCK TABLES `reportes_problemas` WRITE;
/*!40000 ALTER TABLE `reportes_problemas` DISABLE KEYS */;
/*!40000 ALTER TABLE `reportes_problemas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'administrador','Acceso total al sistema, gestión de usuarios, configuración global','2026-01-19 04:15:59','2026-01-19 04:15:59'),(2,'especialista','Gestión de pacientes asignados, creación de contenido, moderación','2026-01-19 04:15:59','2026-01-19 04:15:59'),(3,'paciente','Registro de información personal, consulta de contenido, interacción con comunidad','2026-01-19 04:15:59','2026-01-19 04:15:59');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones`
--

DROP TABLE IF EXISTS `sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dispositivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `navegador` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sistema_operativo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion_aproximada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_confiable` tinyint(1) DEFAULT '0',
  `ultima_actividad` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expira_en` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_token` (`token_hash`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_expiracion` (`expira_en`),
  CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones`
--

LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_activas`
--

DROP TABLE IF EXISTS `sesiones_activas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones_activas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dispositivo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `navegador` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expira_en` datetime NOT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_usuario_id` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_activas`
--

LOCK TABLES `sesiones_activas` WRITE;
/*!40000 ALTER TABLE `sesiones_activas` DISABLE KEYS */;
INSERT INTO `sesiones_activas` VALUES (1,7,'df885a01db7639d773cdce803585004dc54d9d5db93322b42d388ee25d8f42d6','Win32','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','::1','2026-02-18 11:45:32','2026-01-19 11:45:32','2026-01-19 17:45:32'),(2,7,'a6b3c945ef6cfaa50292ea0dce30e43bc92e47c0e34d7be0178c1157266e68ff','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:45:39','2026-01-19 11:45:39','2026-01-19 17:45:39'),(3,1,'5877d74d0c5d1d7165ecb6d2d4a60ef85c322cf1dbe9ece84cc1f6a8bff8cf7b','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:46:43','2026-01-19 11:46:43','2026-01-19 17:46:43'),(4,1,'db7df48bd914bb54d6044a5740f45cc5a2bfef71ab1a15b2316a5b1f8de0ae66','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:47:39','2026-01-19 11:47:39','2026-01-19 17:47:39'),(5,7,'d61da037d488484883e003f5e3534005c6207bcc958819bd7a7ee2be061c8a21','Navegador Web','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','::1','2026-02-18 11:53:39','2026-01-19 11:53:39','2026-01-19 17:53:39'),(6,7,'bd71b48d85aa3163db4264c1518bc4f5548e266f8b803e625edaae74de626d70','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:56:00','2026-01-19 11:56:00','2026-01-19 17:56:00'),(7,7,'2804946dbc79a697fc0e155b679a41af7f5e178fff12d789499039ee5223c3a2','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:56:08','2026-01-19 11:56:08','2026-01-19 17:56:08'),(8,7,'e71aa8e7b2a63dd4230f47beb9d32c72727437802eca58d7073a3da74b054c74','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:56:16','2026-01-19 11:56:16','2026-01-19 17:56:16'),(9,7,'d9b4891b5b765fa5d0b6172fb3de91bee67346dbfa3ece187c8404faf70df4e8','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:56:34','2026-01-19 11:56:34','2026-01-19 17:56:34'),(10,7,'47c7715b386bb1f1bf7df048b6e6228e744413ebc9c7149ba90be83b6c1e26c6','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:58:59','2026-01-19 11:58:59','2026-01-19 17:58:59'),(11,7,'4bad258251004b04d9ad10b8fc8b3fc20ab39051ffff78efa1b10a0f3e0833eb','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:59:05','2026-01-19 11:59:05','2026-01-19 17:59:05'),(12,7,'ddfd8fe99fd22ef06247bb55cacef603d01fda3db8fee6328c19e21453ecf19f','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 11:59:46','2026-01-19 11:59:46','2026-01-19 17:59:46'),(13,7,'0f3796079a064dfbd4cd29bcdf6d00a346de1c407741fddd49f7aab01c77e0d1','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 12:00:12','2026-01-19 12:00:12','2026-01-19 18:00:12'),(14,7,'8090076cfe47b3986a817ad4652374305bab193569edc082ee0db45154b48c86','Navegador Web','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','::1','2026-02-18 12:00:59','2026-01-19 12:00:59','2026-01-19 18:00:59'),(15,7,'9ed31cf023fa942b2f1a9ae3d61075d3a6923075d7dc9152896e28bf8d3b4bc2','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 12:03:01','2026-01-19 12:03:01','2026-01-19 18:03:01'),(16,7,'10f0a943b0d8a381fe3a638694f1842cb45a41cda9839a928fcce07f32f66513','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 12:03:39','2026-01-19 12:03:39','2026-01-19 18:03:39'),(17,7,'3837df71c805f8045b11cad1992e81e2e4dac70150579af6ffcb100362f6c428','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 12:06:56','2026-01-19 12:06:56','2026-01-19 18:06:56'),(18,7,'8185f41a5a890598016890ec2a6de0604455af750559facccc4ce59e81c26dc9','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 12:09:55','2026-01-19 12:13:42','2026-01-19 18:09:55'),(19,7,'186f382278f3f8a4b782c4b5262a5318a78561e6afb35c8e1a5f9d93509aa14c','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 12:17:09','2026-01-19 12:21:28','2026-01-19 18:17:09'),(27,7,'6062df7bd7f95f7244e10498ece992984aa2e4f7f6197561c15cbaa428ac71ac','Win32','Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','::1','2026-02-18 21:37:29','2026-01-19 22:08:48','2026-01-20 03:37:29'),(31,7,'c823f3ffac5dbbfe703adf88b18c6da4aa1c868717b7dd03eb6b3b8ac2eb7aed','Win32','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','::1','2026-02-19 11:24:11','2026-01-20 11:29:29','2026-01-20 17:24:11'),(32,7,'36cd9e0c249bbd4294c9200eea4f286b7ad913276819259d6f4ddfea76e63a2d','Win32','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','::1','2026-02-19 11:45:26','2026-01-20 11:48:13','2026-01-20 17:45:26'),(36,2,'1915c27e13ca3fdbaec0b581b031eea8a012b3c51685a7c31c6d539a8eb30a7b','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36','::1','2026-02-22 17:16:40','2026-01-23 17:17:25','2026-01-23 23:16:40'),(40,1,'bf8d1b156c03f21398068f77ea948b6b91df7030280aae4556a28673fb1e1258','Win32','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','::1','2026-02-22 18:52:04','2026-01-23 18:55:10','2026-01-24 00:52:04'),(45,2,'04aae7597e3ecf12b5ed20264f0508df7553e68f29a4abc34213e9bf8d5af116','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36','::1','2026-02-22 22:22:28','2026-01-23 22:49:35','2026-01-24 04:22:28'),(61,7,'1c394b2dbabe6a9d1f829bf356d097d69fcf4eb4d38928defdd5d491cd72290b','Win32','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36','::1','2026-02-28 18:58:00','2026-01-29 20:30:42','2026-01-30 00:58:00');
/*!40000 ALTER TABLE `sesiones_activas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temas_comunidad`
--

DROP TABLE IF EXISTS `temas_comunidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temas_comunidad` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int unsigned DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temas_comunidad`
--

LOCK TABLES `temas_comunidad` WRITE;
/*!40000 ALTER TABLE `temas_comunidad` DISABLE KEYS */;
INSERT INTO `temas_comunidad` VALUES (1,'Primera vez','primera-vez','?',NULL,1,1,'2026-01-19 04:16:02'),(2,'Logros alcanzados','logros','?',NULL,2,1,'2026-01-19 04:16:02'),(3,'Superación de miedos','superacion','?',NULL,3,1,'2026-01-19 04:16:02'),(4,'Tips y consejos','tips','?',NULL,4,1,'2026-01-19 04:16:02'),(5,'Apoyo emocional','apoyo','?',NULL,5,1,'2026-01-19 04:16:02'),(6,'Mi rutina diaria','rutina','?',NULL,6,1,'2026-01-19 04:16:02'),(7,'Mi progreso','progreso','?',NULL,7,1,'2026-01-19 04:16:02'),(8,'Agradecimientos','agradecimientos','?',NULL,8,1,'2026-01-19 04:16:02'),(9,'Preguntas a la comunidad','preguntas','❓',NULL,9,1,'2026-01-19 04:16:02');
/*!40000 ALTER TABLE `temas_comunidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_cita`
--

DROP TABLE IF EXISTS `tipos_cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_cita` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duracion_minutos` int unsigned DEFAULT '30',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_cita`
--

LOCK TABLES `tipos_cita` WRITE;
/*!40000 ALTER TABLE `tipos_cita` DISABLE KEYS */;
INSERT INTO `tipos_cita` VALUES (1,'primera_vez',60,'Primera consulta con el especialista'),(2,'seguimiento',30,'Consulta de seguimiento regular'),(3,'urgencia',45,'Consulta por situación urgente');
/*!40000 ALTER TABLE `tipos_cita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_comida`
--

DROP TABLE IF EXISTS `tipos_comida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_comida` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden` int unsigned DEFAULT '0',
  `hora_sugerida` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_comida`
--

LOCK TABLES `tipos_comida` WRITE;
/*!40000 ALTER TABLE `tipos_comida` DISABLE KEYS */;
INSERT INTO `tipos_comida` VALUES (1,'desayuno',1,'08:00:00','2026-01-19 04:15:59'),(2,'colacion_matutina',2,'11:00:00','2026-01-19 04:15:59'),(3,'comida',3,'14:00:00','2026-01-19 04:15:59'),(4,'colacion_vespertina',4,'17:00:00','2026-01-19 04:15:59'),(5,'cena',5,'20:00:00','2026-01-19 04:15:59');
/*!40000 ALTER TABLE `tipos_comida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_dispositivo`
--

DROP TABLE IF EXISTS `tipos_dispositivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_dispositivo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'ortesis',
  `componentes` json DEFAULT NULL,
  `nivel_k_minimo` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ventajas` json DEFAULT NULL,
  `desventajas` json DEFAULT NULL,
  `cuidados_especificos` json DEFAULT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_dispositivo`
--

LOCK TABLES `tipos_dispositivo` WRITE;
/*!40000 ALTER TABLE `tipos_dispositivo` DISABLE KEYS */;
INSERT INTO `tipos_dispositivo` VALUES (1,'protesis_miembro_inferior','Prótesis de pierna o pie','ortesis',NULL,NULL,NULL,NULL,NULL,NULL),(2,'protesis_miembro_superior','Prótesis de brazo o mano','ortesis',NULL,NULL,NULL,NULL,NULL,NULL),(3,'ortesis_rodilla','Órtesis de rodilla','ortesis',NULL,NULL,NULL,NULL,NULL,NULL),(4,'ortesis_tobillo','Órtesis de tobillo','ortesis',NULL,NULL,NULL,NULL,NULL,NULL),(5,'ortesis_columna','Órtesis de columna vertebral','ortesis',NULL,NULL,NULL,NULL,NULL,NULL),(6,'otro','Otro tipo de dispositivo','ortesis',NULL,NULL,NULL,NULL,NULL,NULL),(15,'Transtibial','Prótesis para amputación debajo de la rodilla. Es el tipo más común y permite una marcha natural.','protesis','[\"Socket de contacto total\", \"Liner de silicona o gel\", \"Sistema de suspensión (pin, vacío o correa)\", \"Tubo adaptador de titanio\", \"Pie protésico dinámico\"]','K1','[\"Conserva la articulación de rodilla natural\", \"Menor gasto energético al caminar\", \"Más fácil de aprender a usar\", \"Mejor propiocepción\", \"Permite actividades deportivas\"]','[\"Requiere buen estado del muñón\", \"El socket debe ajustarse perfectamente\", \"Puede haber cambios de volumen en el muñón\"]','[\"Revisar el liner diariamente por desgaste\", \"Limpiar el socket con alcohol isopropílico\", \"Verificar alineación cada 6 meses\", \"Cambiar liner cada 6-12 meses\"]','/images/protesis/transtibial.png'),(16,'Transfemoral','Prótesis para amputación por encima de la rodilla. Incluye una rodilla protésica articulada.','protesis','[\"Socket de contención isquiática\", \"Liner de gel con pin o vacío\", \"Rodilla protésica (mecánica o microprocesador)\", \"Tubo de conexión\", \"Pie protésico con respuesta energética\"]','K2','[\"Permite caminar de forma independiente\", \"Rodillas modernas ofrecen gran estabilidad\", \"Tecnología de microprocesador disponible\", \"Múltiples opciones de personalización\"]','[\"Mayor gasto energético (40-60% más)\", \"Curva de aprendizaje más larga\", \"Costo más elevado\", \"Requiere mayor fuerza en cadera\"]','[\"Lubricar articulación de rodilla según fabricante\", \"Cargar batería en rodillas electrónicas\", \"Verificar sistema de bloqueo\", \"Inspección profesional cada 3-6 meses\"]','/images/protesis/transfemoral.png'),(17,'Desarticulación de Rodilla','Prótesis para amputación a nivel de la articulación de la rodilla.','protesis','[\"Socket de contacto con extremo cerrado\", \"Articulación de rodilla externa\", \"Sistema de suspensión por vacío o correa\", \"Adaptadores de conexión\", \"Pie protésico\"]','K2','[\"Excelente palanca para control\", \"Permite carga de peso en el extremo\", \"Suspensión natural por los cóndilos\", \"Menor gasto energético que transfemoral\"]','[\"Rodilla protésica queda más baja\", \"Asimetría cosmética al sentarse\", \"Opciones de rodilla más limitadas\"]','[\"Verificar el ajuste del socket regularmente\", \"Limpiar área de contacto del muñón\", \"Revisar articulación de rodilla mensualmente\"]','/images/protesis/desart-rodilla.png'),(18,'Pie Parcial','Prótesis para amputaciones parciales del pie (transmetatarsiana, Lisfranc, Chopart).','protesis','[\"Plantilla de silicona personalizada\", \"Relleno cosmético del antepié\", \"Placa de fibra de carbono\", \"Calzado adaptado o especial\"]','K1','[\"Preserva parte del pie natural\", \"Mínimo impacto en la marcha\", \"Fácil de ocultar con calzado\", \"Bajo mantenimiento\"]','[\"Opciones limitadas de calzado\", \"Puede requerir modificaciones\", \"Riesgo de úlceras en el muñón\"]','[\"Inspeccionar piel del muñón diariamente\", \"Mantener plantilla limpia y seca\", \"Usar calzado con soporte adecuado\"]','/images/protesis/pie-parcial.png'),(19,'Syme','Prótesis para desarticulación de tobillo. Conserva el talón natural.','protesis','[\"Socket con ventana posterior o lateral\", \"Relleno de talón personalizado\", \"Pie protésico SACH o dinámico\", \"Acabado cosmético\"]','K1','[\"Excelente capacidad de carga\", \"Suspensión natural\", \"Longitud de pierna casi normal\", \"Buena propiocepción\"]','[\"Bulto visible en área de tobillo\", \"Dificultad para usar calzado normal\", \"Opciones de pies más limitadas\"]','[\"Verificar integridad del relleno de talón\", \"Limpiar ventana del socket\", \"Control de volumen del muñón\"]','/images/protesis/syme.png'),(20,'Desarticulación de Cadera','Prótesis para amputación a nivel de la articulación de la cadera.','protesis','[\"Socket tipo cesta pélvica\", \"Articulación de cadera\", \"Rodilla protésica con bloqueo\", \"Sistema de tubo y adaptadores\", \"Pie protésico\"]','K3','[\"Permite movilidad independiente\", \"Tecnología avanzada disponible\", \"Diseños cada vez más ligeros\"]','[\"Alto gasto energético (80-100% más)\", \"Peso significativo del sistema\", \"Control complejo de la marcha\", \"Alto costo\"]','[\"Requiere revisión profesional frecuente\", \"Mantener articulaciones lubricadas\", \"Verificar sistema de suspensión pélvico\", \"Cuidado especial de la piel\"]','/images/protesis/desart-cadera.png'),(21,'Miembro Superior - Transradial','Prótesis para amputación debajo del codo. Múltiples opciones de control.','protesis','[\"Socket de contacto\", \"Sistema de suspensión\", \"Unidad de muñeca\", \"Dispositivo terminal (gancho o mano)\", \"Sistema de control (cable o mioeléctrico)\"]','K1','[\"Conserva articulación del codo\", \"Buen control del dispositivo\", \"Múltiples opciones de terminal\", \"Permite función bimanual\"]','[\"Requiere entrenamiento\", \"Manos mioeléctricas costosas\", \"Mantenimiento regular necesario\"]','[\"Cargar baterías diariamente (mioeléctricas)\", \"Limpiar guante cosmético\", \"Lubricar cables y articulaciones\", \"Verificar electrodos\"]','/images/protesis/transradial.png'),(22,'Miembro Superior - Transhumeral','Prótesis para amputación por encima del codo. Incluye codo protésico.','protesis','[\"Socket con arnés de suspensión\", \"Codo protésico (mecánico o eléctrico)\", \"Unidad de muñeca rotatoria\", \"Dispositivo terminal\", \"Sistema de control híbrido\"]','K2','[\"Permite función del brazo completo\", \"Tecnología avanzada disponible\", \"Opciones de control variadas\"]','[\"Control más complejo\", \"Mayor peso del sistema\", \"Costo elevado\", \"Entrenamiento extenso\"]','[\"Verificar arnés y suspensión\", \"Mantener codo lubricado\", \"Cargar sistemas eléctricos\", \"Revisión profesional trimestral\"]','/images/protesis/transhumeral.png');
/*!40000 ALTER TABLE `tipos_dispositivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_dolor`
--

DROP TABLE IF EXISTS `tipos_dolor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_dolor` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_dolor`
--

LOCK TABLES `tipos_dolor` WRITE;
/*!40000 ALTER TABLE `tipos_dolor` DISABLE KEYS */;
INSERT INTO `tipos_dolor` VALUES (1,'punzante','Dolor punzante o agudo'),(2,'sordo','Dolor sordo o persistente'),(3,'quemante','Sensación de quemadura'),(4,'pulsatil','Dolor pulsátil'),(5,'hormigueo','Hormigueo o entumecimiento'),(6,'calambres','Calambres musculares'),(7,'otro','Otro tipo de dolor');
/*!40000 ALTER TABLE `tipos_dolor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_reaccion`
--

DROP TABLE IF EXISTS `tipos_reaccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_reaccion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emoji` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_reaccion`
--

LOCK TABLES `tipos_reaccion` WRITE;
/*!40000 ALTER TABLE `tipos_reaccion` DISABLE KEYS */;
INSERT INTO `tipos_reaccion` VALUES (1,'me_gusta','❤️','Me gusta'),(2,'me_inspira','?','Me inspira'),(3,'me_identifico','?','Me identifico'),(4,'me_motiva','?','Me motiva'),(5,'apoyo','?','Te apoyo');
/*!40000 ALTER TABLE `tipos_reaccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_recordatorio`
--

DROP TABLE IF EXISTS `tipos_recordatorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_recordatorio` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_recordatorio`
--

LOCK TABLES `tipos_recordatorio` WRITE;
/*!40000 ALTER TABLE `tipos_recordatorio` DISABLE KEYS */;
INSERT INTO `tipos_recordatorio` VALUES (1,'medicina','Recordatorio para registrar mediciones médicas',NULL),(2,'nutricion','Recordatorio para registrar comidas',NULL),(3,'fisioterapia','Recordatorio para ejercicios o limpieza de prótesis',NULL),(4,'cita','Recordatorio de cita médica',NULL),(5,'cuestionario','Recordatorio para completar cuestionarios',NULL),(6,'medicamento','Recordatorio para tomar medicamento',NULL);
/*!40000 ALTER TABLE `tipos_recordatorio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_recuperacion`
--

DROP TABLE IF EXISTS `tokens_recuperacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_recuperacion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `codigo` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('password','pin','email_verificacion') COLLATE utf8mb4_unicode_ci NOT NULL,
  `intentos` int unsigned DEFAULT '0',
  `usado` tinyint(1) DEFAULT '0',
  `expira_en` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_usuario_tipo` (`usuario_id`,`tipo`),
  CONSTRAINT `tokens_recuperacion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_recuperacion`
--

LOCK TABLES `tokens_recuperacion` WRITE;
/*!40000 ALTER TABLE `tokens_recuperacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_recuperacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones_dolor`
--

DROP TABLE IF EXISTS `ubicaciones_dolor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones_dolor` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones_dolor`
--

LOCK TABLES `ubicaciones_dolor` WRITE;
/*!40000 ALTER TABLE `ubicaciones_dolor` DISABLE KEYS */;
INSERT INTO `ubicaciones_dolor` VALUES (1,'munon','Muñón'),(2,'rodilla','Rodilla'),(3,'cadera','Cadera'),(4,'espalda','Espalda'),(5,'hombro','Hombro'),(6,'cuello','Cuello'),(7,'pie','Pie'),(8,'mano','Mano'),(9,'otro','Otra ubicación');
/*!40000 ALTER TABLE `ubicaciones_dolor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pin_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_completo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `rol_id` int unsigned NOT NULL,
  `area_medica_id` int unsigned DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `primer_acceso` tinyint(1) DEFAULT '1',
  `email_verificado` tinyint(1) DEFAULT '0',
  `email_verificado_at` timestamp NULL DEFAULT NULL,
  `usar_pin` tinyint(1) DEFAULT '0',
  `mantener_sesion` tinyint(1) DEFAULT '1',
  `intentos_fallidos` int unsigned DEFAULT '0',
  `bloqueado_hasta` timestamp NULL DEFAULT NULL,
  `perfil_publico` tinyint(1) DEFAULT '1',
  `mostrar_nombre_real` tinyint(1) DEFAULT '1',
  `nombre_anonimo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publicaciones_aprobadas` int unsigned DEFAULT '0',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol_id`),
  KEY `idx_area` (`area_medica_id`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`area_medica_id`) REFERENCES `areas_medicas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin@vitalia.app','$2y$10$dQ2iNXULJQq0vM2P5w4r5eXtFRQ/4.jgCSh1wCyexGJh5bAcdG8.C','$2y$10$dQ2iNXULJQq0vM2P5w4r5eXtFRQ/4.jgCSh1wCyexGJh5bAcdG8.C','Administrador Sistema','1985-03-15',1,NULL,1,0,1,NULL,0,1,0,NULL,1,1,NULL,0,'2026-01-25 04:42:36','2026-01-19 16:48:37','2026-01-25 04:42:36'),(2,'dr.garcia@vitalia.app','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','Dr. Carlos García López','1978-06-20',2,1,1,0,1,NULL,0,1,0,NULL,1,1,NULL,0,'2026-01-25 07:17:31','2026-01-19 16:48:37','2026-01-25 07:17:31'),(3,'dra.martinez@vitalia.app','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','Dra. María Martínez Ruiz','1982-09-10',2,2,1,0,1,NULL,0,1,0,NULL,1,1,NULL,0,'2026-01-25 04:36:51','2026-01-19 16:48:37','2026-01-25 04:36:51'),(4,'lic.rodriguez@vitalia.app','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','Lic. Ana Rodríguez Sánchez','1990-01-25',2,3,1,0,1,NULL,0,1,0,NULL,1,1,NULL,0,NULL,'2026-01-19 16:48:37','2026-01-19 17:38:44'),(5,'psic.hernandez@vitalia.app','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','Psic. Roberto Hernández','1988-11-30',2,4,1,0,1,NULL,0,1,0,NULL,1,1,NULL,0,NULL,'2026-01-19 16:48:37','2026-01-19 17:38:44'),(6,'tec.sanchez@vitalia.app','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','Téc. Laura Sánchez Mora','1992-04-18',2,5,1,0,1,NULL,0,1,0,NULL,1,1,NULL,0,'2026-01-25 06:45:20','2026-01-19 16:48:37','2026-01-25 06:45:20'),(7,'paciente1@test.com','$2y$10$dQ2iNXULJQq0vM2P5w4r5eXtFRQ/4.jgCSh1wCyexGJh5bAcdG8.C','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','Juan Pérez González','1955-08-12',3,NULL,1,0,1,NULL,1,1,0,NULL,1,1,NULL,0,'2026-01-30 00:58:00','2026-01-19 16:48:37','2026-01-30 00:58:00'),(8,'paciente2@test.com','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','María López Vega','1960-12-03',3,NULL,1,0,1,NULL,1,1,0,NULL,1,1,NULL,0,NULL,'2026-01-19 16:48:37','2026-01-19 17:38:44'),(9,'paciente3@test.com','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','$2y$10$BvXm4LmEB.edG1/9Di/q4uGGC.485C447ajpiwS1WOnueXMHdXsA6','Roberto Díaz Mendoza','1958-05-22',3,NULL,1,0,1,NULL,1,1,0,NULL,1,1,NULL,0,'2026-01-25 06:07:45','2026-01-19 16:48:37','2026-01-25 06:07:45');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos_asignados`
--

DROP TABLE IF EXISTS `videos_asignados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos_asignados` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `video_id` int unsigned NOT NULL,
  `asignado_por` int unsigned NOT NULL,
  `frecuencia_recomendada` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repeticiones` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion` (`paciente_id`,`video_id`),
  KEY `video_id` (`video_id`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_paciente` (`paciente_id`),
  CONSTRAINT `videos_asignados_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `videos_asignados_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos_ejercicios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `videos_asignados_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos_asignados`
--

LOCK TABLES `videos_asignados` WRITE;
/*!40000 ALTER TABLE `videos_asignados` DISABLE KEYS */;
INSERT INTO `videos_asignados` VALUES (1,1,1,2,'Lunes, Miércoles, Viernes','3 series x 10 rep','Aumentar gradualmente las repeticiones',1,'2026-01-19 16:48:37'),(2,1,2,2,'Martes, Jueves','3 series x 8 rep','Usar apoyo si es necesario',1,'2026-01-19 16:48:37'),(3,1,4,2,'Diario','1 vez','Realizar al despertar',1,'2026-01-19 16:48:37'),(4,3,1,2,'Lunes, Miércoles, Viernes','2 series x 8 rep','Comenzar con pocas repeticiones',1,'2026-01-19 16:48:37'),(5,3,3,2,'Martes, Jueves, Sábado','15 minutos','Practicar 15 minutos',1,'2026-01-19 16:48:37');
/*!40000 ALTER TABLE `videos_asignados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos_educativos_protesis`
--

DROP TABLE IF EXISTS `videos_educativos_protesis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos_educativos_protesis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria` enum('colocacion','cuidados','ejercicios','mantenimiento','testimonios','general') COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_video` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duracion_minutos` int DEFAULT NULL,
  `nivel_k_aplicable` json DEFAULT NULL,
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos_educativos_protesis`
--

LOCK TABLES `videos_educativos_protesis` WRITE;
/*!40000 ALTER TABLE `videos_educativos_protesis` DISABLE KEYS */;
INSERT INTO `videos_educativos_protesis` VALUES (7,'Colocación de prótesis transtibial','Técnica correcta para ponerte tu prótesis','colocacion','https://youtube.com/watch?v=example1',12,'[\"K1\", \"K2\", \"K3\", \"K4\"]',1,1,'2026-01-30 00:51:28'),(8,'Colocación de prótesis transfemoral','Guía para prótesis por encima de la rodilla','colocacion','https://youtube.com/watch?v=example2',15,'[\"K2\", \"K3\", \"K4\"]',2,1,'2026-01-30 00:51:28'),(9,'Limpieza del liner','Mantenimiento del liner de silicona','cuidados','https://youtube.com/watch?v=example3',8,'[\"K1\", \"K2\", \"K3\", \"K4\"]',3,1,'2026-01-30 00:51:28'),(10,'Ejercicios de equilibrio','Rutina para mejorar estabilidad','ejercicios','https://youtube.com/watch?v=example4',20,'[\"K2\", \"K3\", \"K4\"]',4,1,'2026-01-30 00:51:28'),(11,'Fortalecimiento del muñón','Ejercicios para mantener fuerza muscular','ejercicios','https://youtube.com/watch?v=example5',18,'[\"K1\", \"K2\", \"K3\", \"K4\"]',5,1,'2026-01-30 00:51:28'),(12,'Mantenimiento semanal','Lista de verificación semanal','mantenimiento','https://youtube.com/watch?v=example6',10,'[\"K1\", \"K2\", \"K3\", \"K4\"]',6,1,'2026-01-30 00:51:28');
/*!40000 ALTER TABLE `videos_educativos_protesis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos_ejercicios`
--

DROP TABLE IF EXISTS `videos_ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos_ejercicios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `youtube_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `youtube_video_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duracion_minutos` int unsigned DEFAULT NULL,
  `nivel_id` int unsigned NOT NULL,
  `categoria_id` int unsigned NOT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instrucciones` text COLLATE utf8mb4_unicode_ci,
  `precauciones` text COLLATE utf8mb4_unicode_ci,
  `creado_por` int unsigned NOT NULL,
  `publicado` tinyint(1) DEFAULT '1',
  `vistas` int unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_nivel` (`nivel_id`),
  KEY `idx_categoria` (`categoria_id`),
  KEY `idx_publicado` (`publicado`),
  FULLTEXT KEY `ft_videos` (`titulo`,`descripcion`),
  CONSTRAINT `videos_ejercicios_ibfk_1` FOREIGN KEY (`nivel_id`) REFERENCES `niveles_ejercicio` (`id`),
  CONSTRAINT `videos_ejercicios_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_ejercicio` (`id`),
  CONSTRAINT `videos_ejercicios_ibfk_3` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos_ejercicios`
--

LOCK TABLES `videos_ejercicios` WRITE;
/*!40000 ALTER TABLE `videos_ejercicios` DISABLE KEYS */;
INSERT INTO `videos_ejercicios` VALUES (1,'Ejercicios de fortalecimiento de muñón - Nivel básico','Ejercicios esenciales para fortalecer los músculos del muñón después de la amputación','https://www.youtube.com/watch?v=dQw4w9WgXcQ','dQw4w9WgXcQ',15,1,1,NULL,'Realizar 3 series de 10 repeticiones. Descansar 30 segundos entre series.','Detener si hay dolor intenso',2,1,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(2,'Ejercicios de equilibrio con prótesis','Rutina para mejorar el equilibrio al usar la prótesis','https://www.youtube.com/watch?v=dQw4w9WgXcQ','dQw4w9WgXcQ',20,2,3,NULL,'Usar apoyo cerca. Realizar frente a un espejo para verificar postura.','Tener superficie de apoyo cerca',2,1,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(3,'Marcha con prótesis - Técnica básica','Aprende la técnica correcta de marcha con tu nueva prótesis','https://www.youtube.com/watch?v=dQw4w9WgXcQ','dQw4w9WgXcQ',25,2,3,NULL,'Comenzar con barras paralelas. Avanzar gradualmente a bastón y luego sin apoyo.','No forzar la marcha',2,1,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(4,'Estiramientos para amputados','Rutina de estiramientos para prevenir contracturas','https://www.youtube.com/watch?v=dQw4w9WgXcQ','dQw4w9WgXcQ',12,1,2,NULL,'Mantener cada estiramiento 30 segundos. No rebotar.','Evitar estiramientos bruscos',2,1,0,'2026-01-19 16:48:37','2026-01-19 16:48:37'),(5,'Ejercicios de respiración y relajación','Técnicas de respiración para manejar el dolor y la ansiedad','https://www.youtube.com/watch?v=dQw4w9WgXcQ','dQw4w9WgXcQ',10,1,2,NULL,'Realizar en un lugar tranquilo. Ideal antes de dormir.',NULL,5,1,0,'2026-01-19 16:48:37','2026-01-19 16:48:37');
/*!40000 ALTER TABLE `videos_ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vista_especialistas`
--

DROP TABLE IF EXISTS `vista_especialistas`;
/*!50001 DROP VIEW IF EXISTS `vista_especialistas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_especialistas` AS SELECT 
 1 AS `usuario_id`,
 1 AS `nombre_completo`,
 1 AS `email`,
 1 AS `area_medica_id`,
 1 AS `area_medica`,
 1 AS `activo`,
 1 AS `ultimo_acceso`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_pacientes`
--

DROP TABLE IF EXISTS `vista_pacientes`;
/*!50001 DROP VIEW IF EXISTS `vista_pacientes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_pacientes` AS SELECT 
 1 AS `paciente_id`,
 1 AS `usuario_id`,
 1 AS `nombre_completo`,
 1 AS `email`,
 1 AS `fecha_nacimiento`,
 1 AS `edad`,
 1 AS `fase_numero`,
 1 AS `fase_nombre`,
 1 AS `progreso_general`,
 1 AS `fecha_cambio_fase`,
 1 AS `activo`,
 1 AS `ultimo_acceso`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `votos_faq`
--

DROP TABLE IF EXISTS `votos_faq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votos_faq` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `faq_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `es_util` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_voto` (`faq_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `votos_faq_ibfk_1` FOREIGN KEY (`faq_id`) REFERENCES `faqs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `votos_faq_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votos_faq`
--

LOCK TABLES `votos_faq` WRITE;
/*!40000 ALTER TABLE `votos_faq` DISABLE KEYS */;
/*!40000 ALTER TABLE `votos_faq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `vista_especialistas`
--

/*!50001 DROP VIEW IF EXISTS `vista_especialistas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_especialistas` AS select `u`.`id` AS `usuario_id`,`u`.`nombre_completo` AS `nombre_completo`,`u`.`email` AS `email`,`am`.`id` AS `area_medica_id`,`am`.`nombre` AS `area_medica`,`u`.`activo` AS `activo`,`u`.`ultimo_acceso` AS `ultimo_acceso` from (`usuarios` `u` join `areas_medicas` `am` on((`u`.`area_medica_id` = `am`.`id`))) where (`u`.`rol_id` = 2) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_pacientes`
--

/*!50001 DROP VIEW IF EXISTS `vista_pacientes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_pacientes` AS select `p`.`id` AS `paciente_id`,`u`.`id` AS `usuario_id`,`u`.`nombre_completo` AS `nombre_completo`,`u`.`email` AS `email`,`u`.`fecha_nacimiento` AS `fecha_nacimiento`,timestampdiff(YEAR,`u`.`fecha_nacimiento`,curdate()) AS `edad`,`f`.`numero` AS `fase_numero`,`f`.`nombre` AS `fase_nombre`,`p`.`progreso_general` AS `progreso_general`,`p`.`fecha_cambio_fase` AS `fecha_cambio_fase`,`u`.`activo` AS `activo`,`u`.`ultimo_acceso` AS `ultimo_acceso`,`u`.`created_at` AS `created_at` from ((`pacientes` `p` join `usuarios` `u` on((`p`.`usuario_id` = `u`.`id`))) join `fases_tratamiento` `f` on((`p`.`fase_actual_id` = `f`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-29 20:51:06
