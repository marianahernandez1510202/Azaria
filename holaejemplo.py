# ============================================================
# CLASE: Variables en Python
# Tema: Qué es una variable, tipos, asignación y nombres válidos
# ============================================================

# ----------------------------------------------------------
# 1. ¿QUÉ ES UNA VARIABLE?
# ----------------------------------------------------------
# Una variable es un espacio en memoria que almacena un valor.
# Piensa en ella como una "caja" con una etiqueta (nombre)
# donde guardas información para usarla después.

mensaje = "Hola, bienvenidos a Python!"    # Creamos variable 'mensaje' y guardamos texto
print(mensaje)                              # Mostramos en pantalla el contenido


# ----------------------------------------------------------
# 2. ASIGNACIÓN CON EL OPERADOR =
# ----------------------------------------------------------
# El signo = NO significa "igual que" en matemáticas.
# Significa: "guarda el valor de la derecha en la variable de la izquierda".

edad = 20          # Guardamos el número 20 dentro de la variable 'edad'
print(edad)        # Imprime: 20

edad = 21          # Podemos REASIGNAR: ahora 'edad' vale 21 (el 20 se pierde)
print(edad)        # Imprime: 21


# ----------------------------------------------------------
# 3. TIPOS DE DATOS BÁSICOS
# ----------------------------------------------------------

# --- int (entero): números sin punto decimal ---
cantidad_alumnos = 35                      # Esto es un int
print(cantidad_alumnos)                    # Imprime: 35
print(type(cantidad_alumnos))              # Imprime: <class 'int'>

# --- float (decimal): números con punto decimal ---
promedio = 8.75                            # Esto es un float
print(promedio)                            # Imprime: 8.75
print(type(promedio))                      # Imprime: <class 'float'>

# --- str (cadena de texto): texto entre comillas ---
nombre = "Ana García"                      # Esto es un str (string)
print(nombre)                              # Imprime: Ana García
print(type(nombre))                        # Imprime: <class 'str'>

# --- bool (booleano): solo puede ser True o False ---
esta_inscrito = True                       # Esto es un bool
print(esta_inscrito)                       # Imprime: True
print(type(esta_inscrito))                 # Imprime: <class 'bool'>


# ----------------------------------------------------------
# 4. NOMBRES VÁLIDOS PARA VARIABLES
# ----------------------------------------------------------

# ✅ VÁLIDOS:
nombre_completo = "Carlos López"    # Puede usar guión bajo (_)
edad2 = 25                          # Puede contener números (NO iniciar con uno)
_contador = 0                       # Puede iniciar con guión bajo
miVariable = 100                    # Puede usar camelCase (no recomendado en Python)
MI_CONSTANTE = 3.1416               # MAYÚSCULAS por convención para constantes

# ❌ INVÁLIDOS (descomentar cualquiera causará error):
# 2nombre = "error"                 # NO puede iniciar con un número
# mi-variable = 10                  # NO puede usar guiones (-)
# mi variable = 10                  # NO puede tener espacios
# class = "dato"                    # NO puede ser palabra reservada de Python


# ----------------------------------------------------------
# 5. EJEMPLO PRÁCTICO: FICHA DE ESTUDIANTE
# ----------------------------------------------------------
# Combinamos todo lo aprendido en un mini programa útil.

nombre_estudiante = "María Hernández"   # str   - guardamos el nombre
edad_estudiante = 19                    # int   - guardamos la edad
calificacion = 9.3                      # float - guardamos la calificación
aprobado = True                         # bool  - ¿aprobó la materia?

# Mostramos la ficha usando f-strings (formato de texto moderno)
print()
print("========== FICHA DEL ESTUDIANTE ==========")
print(f"Nombre:        {nombre_estudiante}")       # {variable} se reemplaza por su valor
print(f"Edad:          {edad_estudiante} años")
print(f"Calificación:  {calificacion}")
print(f"Aprobado:      {aprobado}")
print("==========================================")

# Verificamos los tipos de cada variable
print()
print("--- Verificación de tipos ---")
print(f"nombre_estudiante -> {type(nombre_estudiante).__name__}")   # str
print(f"edad_estudiante   -> {type(edad_estudiante).__name__}")     # int
print(f"calificacion      -> {type(calificacion).__name__}")        # float
print(f"aprobado          -> {type(aprobado).__name__}")            # bool


# ----------------------------------------------------------
# 6. CONVERSIÓN ENTRE TIPOS (casting)
# ----------------------------------------------------------
# A veces necesitamos convertir un tipo a otro.

numero_texto = "42"                        # Esto es un str, NO un número
print(type(numero_texto))                  # <class 'str'>

numero_entero = int(numero_texto)          # Convertimos texto "42" a entero 42
print(type(numero_entero))                 # <class 'int'>
print(numero_entero + 8)                   # Ahora sí podemos sumar: imprime 50

decimal = float("3.14")                    # Convertimos texto a decimal
print(decimal)                             # Imprime: 3.14

texto = str(100)                           # Convertimos entero a texto
print(texto + " puntos")                   # Concatenar: "100 puntos"

# Conversión a bool: 0 y cadena vacía son False, todo lo demás es True
print(bool(0))                             # False
print(bool(1))                             # True
print(bool(""))                            # False  (texto vacío)
print(bool("hola"))                        # True   (texto con contenido)