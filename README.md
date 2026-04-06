# 🧾 HDM Cotizador Web

Aplicación web desarrollada para **HDM Maquinarias** que permite generar cotizaciones de repuestos y maquinaria de forma rápida, automática y visual, con conversión de moneda, lógica de negocio por marca y generación de documentos PDF con vista previa en tiempo real.

---

## 🚀 Características actuales

✅ Gestión dinámica de productos  
✅ Autocompletado inteligente de productos (por código o nombre) 🔍  
✅ Carga automática de:
- Código  
- Descripción  
- Unidad  
- Marca  

✅ Cálculo automático de precios según marca  
✅ Ajustes porcentuales por marca (márgenes comerciales)  
- CAT: +18% automático  
- Otras marcas: valores configurables  

✅ Aplicación de descuentos personalizados (%)  
✅ Conversión manual entre USD y PEN  
✅ Tipo de cambio configurable por el usuario  
✅ Vista previa del PDF en tiempo real  
✅ Generación y descarga de cotizaciones en PDF  
✅ Edición de productos dentro de la tabla  
✅ Historial de cotizaciones almacenado en la nube (Supabase) ☁️  
✅ Carga y visualización de cotizaciones anteriores  
✅ Interfaz moderna e intuitiva  

---

## 🖥️ Tecnologías utilizadas

- HTML5  
- CSS3  
- JavaScript (Vanilla JS)  
- jsPDF (Generación de PDF)  
- Supabase (Base de datos y persistencia)

---

## 📷 Funcionalidad principal

### 1. Registrar datos del cliente
- Nombre  
- DNI  
- Dirección  

---

### 2. Agregar productos con autocompletado inteligente

Puedes escribir:
- Código del producto  
- Nombre del producto  

El sistema sugiere coincidencias y al seleccionar:

✔ Completa automáticamente:
- Código  
- Descripción  
- Unidad  
- Marca  

---

### 3. Configurar producto

Cada producto incluye:

- Código  
- Marca  
- Unidad  
- Cantidad  
- Precio base  
- Moneda (USD o PEN)  
- Descuentos (%)  

---

### 4. Aplicar automáticamente

El sistema calcula en tiempo real:

- Ajustes por marca  
- Descuentos acumulativos  
- Conversión de moneda (según tipo de cambio)  
- Subtotales y total general  

---

### 5. Visualizar y generar PDF

- Vista previa en tiempo real  
- Generación automática del documento  
- Descarga en PDF lista para enviar al cliente  

---

### 6. Guardar y recuperar cotizaciones

- Guardado en base de datos (Supabase)  
- Recuperación de cotizaciones anteriores  
- Edición sin modificar el original (versionado)

---

## 📊 Reglas de cálculo

El precio final se calcula considerando:

- Ajustes porcentuales por marca  
- Descuentos aplicados  
- Tipo de cambio (si está en USD)  
- Cantidad del producto  
- Redondeo final  

---

## 🧠 Lógica destacada

- Autocompletado dinámico tipo buscador  
- Sincronización automática entre producto y formulario  
- Sistema flexible de ajustes por marca  
- Persistencia en la nube  
- Generación de documentos profesionales  

---

## 🗺️ Roadmap (Mejoras futuras)

### 📊 Reportes y análisis
- Estadísticas de ventas  
- Reportes por cliente  
- Exportación de datos  

### 👥 Multiusuario
- Sistema de cuentas  
- Control de acceso  
- Registro de actividad  

### 📱 UI/UX
- Diseño responsive  
- Optimización para móviles y tablets  

### ⚡ Mejoras técnicas
- Navegación con teclado en buscador  
- Optimización para grandes volúmenes de productos  
- Validaciones avanzadas  

### 🔐 Seguridad
- Autenticación de usuarios  
- Respaldo automático  

---

## 🎯 Objetivo del proyecto

Optimizar el proceso de cotización en **HDM Maquinarias**, reduciendo errores manuales, acelerando la atención al cliente y centralizando la información en una plataforma moderna, eficiente y escalable.