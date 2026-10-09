/*
 * Datos editables del centro y de la fundadora.
 * Modifica solo este archivo para actualizar teléfono, correo, dirección,
 * horario y el apartado "Sobre la profesional". Los valores entre corchetes
 * son provisionales y deben sustituirse antes de publicar.
 */
window.SITE_CONFIG = {
  // Nombre completo del centro (pie de página y datos legales)
  centerName: "[Nombre completo del centro]",
  centerShortName: "Centro de Orientación y Mediación Familiar",
  siteUrl: "https://www.[dominio-del-centro].es/",

  // Contacto
  phone: "[+34 000 000 000]",
  phoneHref: "+34000000000",
  email: "[correo@dominio.es]",
  address: "[Dirección postal — pendiente de confirmar]",
  schedule: "[Horario de atención — pendiente de confirmar]",

  // Fundadora (apartado "Sobre la profesional")
  founderName: "[Nombre y apellidos]",
  founderTraining: "[Formación académica]",
  founderMaster: "[Máster cursado] · Universidad de Navarra (UNAV)",
  founderExperience: "[Experiencia profesional]",
  founderApproach: "[Enfoque de orientación y mediación]",
  founderMotivation: "[Motivación personal]",

  // Redes sociales: deja la lista vacía si no existen
  socials: [
    // { name: "Instagram", url: "https://www.instagram.com/..." },
  ],

  // Formulario de contacto.
  // URL de un servicio que reciba los datos por POST (por ejemplo, un endpoint
  // propio o un servicio de formularios con el que tengas firmado un
  // encargo de tratamiento). Mientras esté vacío, el formulario valida los
  // datos pero NO envía nada y lo indica claramente.
  formEndpoint: "",
};
