/**
 * Receptor de solicitudes de consulta del Centro de Orientación y Mediación Familiar.
 *
 * Qué hace:
 *  1. Recibe el envío del formulario de la web (POST).
 *  2. Valida los datos en el servidor (nunca confiar solo en el navegador).
 *  3. Te envía un correo con los datos. En "Responder" escribes directamente a la persona.
 *  4. Opcionalmente guarda cada solicitud en una hoja de cálculo de tu Google Drive.
 *
 * Los datos quedan en tu cuenta de Google. Nada se envía a otros servicios.
 *
 * PUESTA EN MARCHA (una sola vez):
 *  1. Entra en https://script.google.com con tu cuenta y crea un proyecto nuevo.
 *  2. Pega este archivo completo en Code.gs (sustituye el contenido existente).
 *  3. Rellena NOTIFY_EMAIL con el correo donde quieres recibir las solicitudes.
 *  4. (Opcional) Crea una hoja de cálculo en Google Sheets, copia su ID de la URL
 *     (la parte entre /d/ y /edit) y pégalo en SHEET_ID.
 *  5. Pulsa "Implementar" > "Nueva implementación" > tipo "Aplicación web":
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier usuario
 *     Acepta los permisos (correo y, si lo usas, hojas de cálculo).
 *  6. Copia la URL que termina en /exec y pégala en formEndpoint de js/config.js.
 *
 * Cada vez que cambies este código, vuelve a implementar ("Gestionar implementaciones"
 * > editar > nueva versión), o la web seguirá usando la versión anterior.
 */

// ---------- CONFIGURACIÓN ----------
var NOTIFY_EMAIL = "[tu-correo@dominio.es]";
var SHEET_ID = "";                 // opcional: ID de la hoja de cálculo
var SHEET_NAME = "Solicitudes";
var MOTIVOS = ["matrimonial", "pareja", "mediacion", "familiar", "prevencion", "otro", "sin-definir", ""];
var PREFERENCIAS = ["telefono", "correo"];
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------- ENTRADA ----------
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Campo trampa: si llega relleno, es un robot. Respondemos OK sin hacer nada.
    if (data.web) return respond({ ok: true });

    var result = validate(data);
    if (result.error) return respond({ ok: false, error: result.error });

    var solicitud = result.value;
    if (SHEET_ID) saveToSheet(solicitud);
    notify(solicitud);

    return respond({ ok: true });
  } catch (err) {
    console.error(err);
    return respond({ ok: false, error: "No hemos podido procesar la solicitud." });
  }
}

// Comprobación de que la URL responde (útil al implementar)
function doGet() {
  return respond({ ok: true, servicio: "solicitudes-consulta" });
}

// ---------- VALIDACIÓN ----------
function validate(d) {
  var nombre = clean(d.nombre, 100);
  var email = clean(d.email, 254);
  var telefono = clean(d.telefono, 20);
  var motivo = clean(d.motivo, 30);
  var mensaje = clean(d.mensaje, 1000);
  var preferencia = clean(d.preferencia, 20);

  if (nombre.length < 2) return { error: "Revisa el nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Revisa el correo electrónico." };
  if (telefono && (telefono.replace(/\D/g, "").length < 6 || !/^[+0-9 ()-]+$/.test(telefono))) {
    return { error: "Revisa el teléfono." };
  }
  if (MOTIVOS.indexOf(motivo) === -1) return { error: "Motivo no válido." };
  if (PREFERENCIAS.indexOf(preferencia) === -1) return { error: "Elige cómo prefieres que te contactemos." };
  if (d.privacidad !== true) return { error: "Falta la aceptación de la política de privacidad." };

  return {
    value: {
      nombre: nombre,
      email: email,
      telefono: telefono,
      motivo: motivo,
      mensaje: mensaje,
      preferencia: preferencia,
      fecha: new Date(),
      origen: clean(d.origen, 300),
    },
  };
}

function clean(value, max) {
  return String(value == null ? "" : value).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
}

// ---------- SALIDA ----------
function notify(s) {
  var etiquetas = {
    matrimonial: "Orientación matrimonial",
    pareja: "Orientación de pareja",
    mediacion: "Mediación familiar",
    familiar: "Orientación familiar",
    prevencion: "Prevención y fortalecimiento",
    otro: "Otro",
    "sin-definir": "Todavía no lo tiene claro",
    "": "No indicado",
  };
  var preferencias = { telefono: "Teléfono", correo: "Correo electrónico" };

  var cuerpo = [
    "Nueva solicitud de consulta",
    "",
    "Nombre: " + s.nombre,
    "Correo: " + s.email,
    "Teléfono: " + (s.telefono || "No indicado"),
    "Motivo: " + etiquetas[s.motivo],
    "Preferencia de contacto: " + preferencias[s.preferencia],
    "",
    "Mensaje:",
    s.mensaje || "(sin mensaje)",
    "",
    "Recibida: " + Utilities.formatDate(s.fecha, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"),
    "Página: " + (s.origen || "No disponible"),
    "",
    "Para responder, usa 'Responder': el correo irá directamente a la persona.",
  ].join("\n");

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: "Nueva solicitud de consulta: " + s.nombre,
    body: cuerpo,
    replyTo: s.email,
    name: "Web del centro",
  });
}

function saveToSheet(s) {
  var libro = SpreadsheetApp.openById(SHEET_ID);
  var hoja = libro.getSheetByName(SHEET_NAME);
  if (!hoja) {
    hoja = libro.insertSheet(SHEET_NAME);
    hoja.appendRow(["Fecha", "Nombre", "Correo", "Teléfono", "Motivo", "Preferencia", "Mensaje", "Página"]);
    hoja.setFrozenRows(1);
  }
  hoja.appendRow([s.fecha, s.nombre, s.email, s.telefono, s.motivo, s.preferencia, s.mensaje, s.origen]);
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
