
# SHRTN — Analytics Dashboard Frontend (`url-shortener-front-stats`)

Este módulo aloja la interfaz web dedicada de forma exclusiva a la **visualización detallada y auditoría de analíticas**. Diseñado bajo un enfoque SPA (*Single Page Application*) con JavaScript nativo, HTML5 y Tailwind CSS, el componente renderiza paneles de control (KPIs) y trazas de actividad en tiempo real (*live logs*) para monitorear el rendimiento de los enlaces acortados del usuario.

---

## ⚡ Lógica de Componentes e Interoperabilidad

El frontend aprovecha las capacidades de la API de estadísticas para ofrecer una experiencia fluida y optimizada:

* **Sincronización de Contexto Cruzado:** Si se accede de manera directa desde el panel principal, el módulo lee la variable `code` mediante `URLSearchParams` para invocar inmediatamente las trazas del enlace objetivo sin requerir clicks adicionales.
* **Carga Analítica Bajo Demanda (Lazy Loading):** Con el fin de minimizar el consumo de ancho de banda y lecturas en DynamoDB:
* Primero consulta el listado general (`GET /stats`) para popular el menú de navegación con los metadatos base y totales de clics.
* Solo cuando el usuario selecciona un elemento específico, el cliente web gatilla un segundo fetch dirigido a `GET /stats/{code}` para descargar e invertir cronológicamente el array completo de timestamps (`visit_history`).


* **Inyección de Trazas de Auditoría:** Convierte los timestamps crudos provenientes de la nube en logs formateados bajo el evento virtualizado `GET_DECODE_REQUEST`, simulando un monitor de eventos de servidor en tiempo real.
* **Gobernanza de Seguridad:** Si las variables del `localStorage` son alteradas o caducan, el script intercepta el error, limpia las cookies de sesión y expulsa al usuario devolviéndolo al portal de identidad (`AUTH_URL`).

---

## 📂 Estructura del Módulo

Organización del código de visualización e infraestructura edge:

```text
C:\CODE PROJECTS\URL-SHORTENER\MODULES\FRONTEND\URL-SHORTENER-FRONT-STATS
│   .gitignore
│   README.md                 <-- (Este archivo)
│
├───src                       <-- ARTEFACTOS DEL CLIENTE ANALÍTICO
│       app.js                <-- Controladores de eventos, renderizado de logs y peticiones asíncronas
│       index.html            <-- Vista del Dashboard de analíticas y visualizadores KPI
│       package.json          <-- Dependencias de empaquetamiento y scripts locales
│       styles.css            <-- Hoja de estilos complementaria optimizada con Tailwind
│
└───terraform                 <-- ARQUITECTURA DE HOSTING EN LA NUBE
        main.tf               <-- Configuración del Bucket S3 de origen y distribución CDN global
        outputs.tf
        providers.tf
        terraform.tfstate
        terraform.tfstate.backup
        variables.tf

```

---

## 🛠️ Arquitectura de Distribución Edge

Este front estático se despliega de manera independiente emulando los estándares de la arquitectura Jamstack:

* **Amazon S3 (Almacenamiento Confinado):** Repositorio privado donde residen los recursos estáticos. No tiene acceso HTTP público directo para evitar fugas de datos o peticiones maliciosas externas.
* **Amazon CloudFront (CDN):** Expone el servicio a nivel global. Cuenta con una regla de origen basada en **OAC (Origin Access Control)** que sirve de puente seguro entre la red mundial y el contenedor S3, reduciendo la latencia de carga en el navegador a milisegundos gracias a su red de *Edge Locations*.

---

## ⚙️ Constantes de Entorno del Ecosistema

Las conexiones declaradas en `src/app.js` enlazan este visualizador con el resto del monorrepo:

| Constante | Propósito | URL de Destino |
| --- | --- | --- |
| `API_BASE_URL` | Microservicio central serverless que provee los payloads de analíticas. | `https://jguawzn6ka.execute-api.us-east-1.amazonaws.com` |
| `SHORTENER_FRONTEND_URL` | URL de CloudFront asociada a la consola principal de creación. | `https://de7c8fkkejed4.cloudfront.net` |
| `AUTH_URL` | Endpoint CloudFront dedicado al inicio de sesión global. | `https://d2ahv6rm0lok1j.cloudfront.net` |

---

## 🚀 Despliegue de la Interfaz

1. **Configurar constantes de red:**
Verifica que los endpoints de las APIs y de los frontends hermanos en `app.js` coincidan con tu despliegue actual en la consola de AWS.
2. **Aprovisionar recursos mediante Terraform:**
Accede a la carpeta de infraestructura y ejecuta los comandos de automatización:
```bash
cd terraform
terraform init
terraform apply

```


3. **Carga y Sincronización de archivos:**
Una vez que Terraform construya el bucket S3 y la distribución de CloudFront, despliega los archivos de la carpeta `/src` dentro del bucket correspondiente. La URL generada por CloudFront quedará lista para recibir los tokens de sesión y renderizar los paneles analíticos de todo el sistema.
