(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Kepler AI",
    tagline: "Asistentes de IA para automatizar ventas y atención al cliente.",

    contact: {
      email: "kepleraiagency@gmail.com",
      whatsappNumber: "5491138120436",
      whatsappMessage: "Hola! Quiero más info para automatizar mi negocio con Kepler AI"
    },

    // Scripted demo conversation for the animated chat mockup in the
    // "El agente en acción" section. Edit freely — the HTML already
    // contains the same conversation as static fallback for no-JS/first paint.
    demoScript: [
      { from: "user",  text: "Hola, vi el anuncio del gimnasio, ¿cuánto sale el pase mensual?" },
      { from: "agent", text: "¡Hola! El plan mensual tiene un valor de $45.000 e incluye acceso libre y todas las clases grupales." },
      { from: "user",  text: "¿Tenés alguna promo? Me gustaría probar antes de anotarme" },
      { from: "agent", text: "Sí, este mes la inscripción es sin cargo. Y tenemos una clase de prueba gratuita, podés venir mañana a las 6pm o el jueves a las 10am. ¿Cuál te queda mejor?" },
      { from: "user",  text: "El jueves a las 10am" },
      { from: "chip",  text: "Reunión agendada · Jueves 10:00 AM" }
    ]
  };
})();
