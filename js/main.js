(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Datos editables (js/config.js) ---------- */
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var value = config[el.getAttribute("data-cfg")];
    if (value) el.textContent = value;
  });

  document.querySelectorAll("[data-cfg-text]").forEach(function (el) {
    var value = config[el.getAttribute("data-cfg-text")];
    if (value) el.textContent = value;
  });

  document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
    var key = el.getAttribute("data-cfg-href");
    var value = config[key];
    if (!value) return;
    var prefix = key === "email" ? "mailto:" : "tel:";
    var target = key === "phone" && config.phoneHref ? config.phoneHref : value;
    el.setAttribute("href", prefix + target);
  });

  document.querySelectorAll("[data-cfg-social]").forEach(function (container) {
    if (!config.socials || !config.socials.length) return;
    var title = document.createElement("p");
    title.className = "footer-title";
    title.textContent = "Redes";
    var list = document.createElement("ul");
    list.className = "footer-links";
    config.socials.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.name;
      li.appendChild(a);
      list.appendChild(li);
    });
    container.appendChild(title);
    container.appendChild(list);
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Cabecera y botón volver arriba ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Movimiento: la página amanece contigo ----------
   Titulares: entran palabra a palabra. Imágenes: se descubren con un recorte.
   Listas: en cascada. Portada: sale el sol. Cada cosa entra a su manera. */
  var hero = document.querySelector("[data-hero]");

  function splitWords(root) {
    var index = 0;
    var isHeading = /^H[1-6]$/.test(root.tagName);
    if (isHeading) root.setAttribute("aria-label", root.textContent.replace(/\s+/g, " ").trim());

    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (part === "") return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            var outer = document.createElement("span");
            outer.className = "w";
            var inner = document.createElement("span");
            inner.className = "wi";
            inner.style.setProperty("--i", String(index++));
            inner.textContent = part;
            if (isHeading) outer.setAttribute("aria-hidden", "true");
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName.toLowerCase() !== "svg") {
          walk(child);
        }
      });
    })(root);
  }

  var motionTargets = document.querySelectorAll("[data-split], [data-wipe], [data-stagger]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    motionTargets.forEach(function (el) { el.classList.add("is-in"); });
    if (hero) hero.classList.add("is-in");
  } else {
    document.querySelectorAll("[data-split]").forEach(splitWords);

    // Un elemento totalmente recortado por su propio clip-path no cuenta como visible para
    // IntersectionObserver, así que las imágenes con recorte se observan a través de su contenedor.
    var wipeOf = new WeakMap();

    var seen = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          (wipeOf.get(entry.target) || entry.target).classList.add("is-in");
          seen.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.18 }
    );

    motionTargets.forEach(function (el) {
      if (hero && hero.contains(el)) return; // la portada tiene su propia secuencia
      if (el.hasAttribute("data-wipe") && el.parentElement) {
        wipeOf.set(el.parentElement, el);
        seen.observe(el.parentElement);
      } else {
        seen.observe(el);
      }
    });

    // Portada: arranca cuando las fuentes están listas (o a los 700 ms como máximo)
    var started = false;
    function startHero() {
      if (started || !hero) return;
      started = true;
      requestAnimationFrame(function () {
        hero.classList.add("is-in");
        hero.querySelectorAll("[data-split]").forEach(function (el) { el.classList.add("is-in"); });
      });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(startHero);
    setTimeout(startHero, 700);
  }

  /* Dos voces que se acercan al bajar por «Cómo trabajamos» (solo transform, por JS) */
  var voices = document.getElementById("voices");
  if (voices) {
    var voiceA = voices.querySelector(".voice-a");
    var voiceB = voices.querySelector(".voice-b");
    var ticking = false;

    var placeVoices = function (progress) {
      var w = voices.clientWidth;
      var d = voiceA.offsetWidth;
      var overlap = d * 0.5;
      var startA = w * 0.04;
      var startB = w - d - w * 0.04;
      var endA = w / 2 - d + overlap / 2;
      var endB = w / 2 - overlap / 2;
      var ax = startA + (endA - startA) * progress;
      var bx = startB + (endB - startB) * progress;
      voiceA.style.transform = "translate3d(" + ax.toFixed(1) + "px,0,0)";
      voiceB.style.transform = "translate3d(" + bx.toFixed(1) + "px,0,0)";
    };

    var updateVoices = function () {
      ticking = false;
      if (reduceMotion) return placeVoices(1);
      var r = voices.getBoundingClientRect();
      var vh = window.innerHeight;
      var t = Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.5)));
      placeVoices(t * t * (3 - 2 * t));
    };

    var requestVoices = function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateVoices);
      }
    };

    window.addEventListener("scroll", requestVoices, { passive: true });
    window.addEventListener("resize", requestVoices);
    updateVoices();
  }

  /* ---------- Servicios desplegables ---------- */
  var services = document.querySelectorAll(".service");
  var form = document.getElementById("consulta-form");

  services.forEach(function (service) {
    var toggleBtn = service.querySelector(".service-toggle");
    var panel = service.querySelector(".service-panel");
    var requestBtn = service.querySelector("[data-request]");

    toggleBtn.addEventListener("click", function () {
      var open = toggleBtn.getAttribute("aria-expanded") !== "true";
      toggleBtn.setAttribute("aria-expanded", String(open));
      toggleBtn.textContent = open ? "Menos información" : "Más información";
      service.classList.toggle("is-open", open);
      // Fuera del árbol de accesibilidad cuando está cerrado
      if (open) {
        panel.removeAttribute("inert");
      } else {
        panel.setAttribute("inert", "");
      }
    });

    requestBtn.addEventListener("click", function () {
      if (!form) return;
      selectMotivo(service.getAttribute("data-motivo"));
      goToStep(1);
      document.getElementById("contacto").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(function () {
        document.getElementById("nombre").focus({ preventScroll: true });
      }, reduceMotion ? 0 : 500);
    });
  });

  /* ---------- Asistente de solicitud de consulta (tres pasos) ---------- */
  if (!form) return;

  var status = document.getElementById("form-status");
  var count = document.getElementById("form-count");
  var progressBar = document.getElementById("progress-bar");
  var panels = Array.prototype.slice.call(form.querySelectorAll(".panel"));
  var prevBtn = form.querySelector("[data-prev]");
  var nextBtn = form.querySelector("[data-next]");
  var submitBtn = form.querySelector("[data-submit]");
  var successBox = document.getElementById("form-success");
  var restartBtn = successBox.querySelector("[data-restart]");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var currentStep = 1;
  var TOTAL_STEPS = panels.length;

  var rules = {
    nombre: function (value) {
      var v = value.trim();
      if (!v) return "Escribe tu nombre.";
      if (v.length < 2) return "El nombre debe tener al menos 2 caracteres.";
      return "";
    },
    email: function (value) {
      var v = value.trim();
      if (!v) return "Escribe tu correo electrónico.";
      if (!EMAIL_RE.test(v)) return "Revisa el formato del correo, por ejemplo nombre@dominio.es.";
      return "";
    },
    telefono: function (value) {
      var v = value.trim();
      if (!v) return "";
      var digits = v.replace(/\D/g, "");
      if (!/^[+0-9 ()-]+$/.test(v) || digits.length < 6 || digits.length > 15) {
        return "Revisa el número de teléfono.";
      }
      return "";
    },
    mensaje: function (value) {
      return value.length > 1000 ? "El mensaje es demasiado largo (máximo 1000 caracteres)." : "";
    },
  };

  function field(name) {
    return form.elements.namedItem(name);
  }

  function setError(name, message) {
    var errorEl = document.getElementById(name + "-error");
    var input = field(name);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = !message;
    }
    if (input && input.setAttribute && !input.length) {
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }
    return !message;
  }

  function selectMotivo(value) {
    var option = form.querySelector('input[name="motivo"][value="' + value + '"]');
    if (option) option.checked = true;
  }

  function setStatus(message, type) {
    status.textContent = message;
    status.classList.toggle("is-error", type === "error");
    status.classList.toggle("is-warning", type === "warning");
  }

  /* Validación por paso. Devuelve el primer campo con error, o null si todo está bien */
  function validateStep(step) {
    var firstInvalid = null;
    function check(ok, target) {
      if (!ok && !firstInvalid) firstInvalid = target;
    }

    if (step === 1) {
      check(setError("nombre", rules.nombre(field("nombre").value)), field("nombre"));
      check(setError("email", rules.email(field("email").value)), field("email"));
      check(setError("telefono", rules.telefono(field("telefono").value)), field("telefono"));
    }

    if (step === 2) {
      check(setError("mensaje", rules.mensaje(field("mensaje").value)), field("mensaje"));
    }

    if (step === 3) {
      var preferencia = form.querySelector('input[name="preferencia"]:checked');
      var preferenciaInput = form.querySelector('input[name="preferencia"]');
      check(
        setError("preferencia", preferencia ? "" : "Elige cómo prefieres que te contactemos."),
        preferenciaInput
      );
      var privacidad = field("privacidad");
      check(
        setError("privacidad", privacidad.checked ? "" : "Necesitamos que aceptes la política de privacidad para continuar."),
        privacidad
      );
    }

    return firstInvalid;
  }

  function focusPanelTitle(step) {
    var title = document.getElementById("step-title-" + step);
    if (title) title.focus({ preventScroll: true });
  }

  function goToStep(step, moveFocus) {
    currentStep = step;
    panels.forEach(function (panel) {
      var active = Number(panel.getAttribute("data-step")) === step;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", String(!active));
      if (active) {
        panel.removeAttribute("inert");
      } else {
        panel.setAttribute("inert", "");
      }
    });

    count.textContent = "Paso " + step + " de " + TOTAL_STEPS;
    progressBar.style.transform = "scaleX(" + step / TOTAL_STEPS + ")";
    prevBtn.hidden = step === 1;
    nextBtn.hidden = step === TOTAL_STEPS;
    submitBtn.hidden = step !== TOTAL_STEPS;
    setStatus("", "");
    if (moveFocus) focusPanelTitle(step);
  }

  nextBtn.addEventListener("click", function () {
    var invalid = validateStep(currentStep);
    if (invalid) {
      invalid.focus();
      setStatus("Revisa los campos marcados para continuar.", "error");
      return;
    }
    goToStep(Math.min(currentStep + 1, TOTAL_STEPS), true);
  });

  prevBtn.addEventListener("click", function () {
    goToStep(Math.max(currentStep - 1, 1), true);
  });

  // Validación al salir de cada campo de texto, sin molestar mientras se escribe
  ["nombre", "email", "telefono"].forEach(function (name) {
    var input = field(name);
    input.addEventListener("blur", function () {
      if (input.value.trim() !== "" || input.getAttribute("aria-invalid") === "true") {
        setError(name, rules[name](input.value));
      }
    });
  });

  form.addEventListener("change", function (event) {
    var target = event.target;
    if (target.name === "preferencia") setError("preferencia", "");
    if (target.name === "privacidad") setError("privacidad", "");
  });

  function buildPayload() {
    var data = new FormData(form);
    return {
      nombre: String(data.get("nombre") || "").trim(),
      email: String(data.get("email") || "").trim(),
      telefono: String(data.get("telefono") || "").trim(),
      motivo: String(data.get("motivo") || ""),
      mensaje: String(data.get("mensaje") || "").trim(),
      preferencia: String(data.get("preferencia") || ""),
      privacidad: data.get("privacidad") === "on",
      origen: window.location.href,
    };
  }

  function setSending(sending) {
    submitBtn.disabled = sending;
    prevBtn.disabled = sending;
    submitBtn.setAttribute("aria-busy", String(sending));
    submitBtn.textContent = sending ? "Enviando…" : "Enviar solicitud";
  }

  function showSuccess() {
    form.hidden = true;
    successBox.hidden = false;
    successBox.focus({ preventScroll: true });
  }

  restartBtn.addEventListener("click", function () {
    form.reset();
    successBox.hidden = true;
    form.hidden = false;
    goToStep(1);
    document.getElementById("nombre").focus();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Enter en un paso intermedio avanza en lugar de enviar
    if (currentStep < TOTAL_STEPS) {
      nextBtn.click();
      return;
    }

    setStatus("", "");

    // Campo trampa relleno: se trata como enviado sin hacer nada
    if (field("web").value) {
      showSuccess();
      return;
    }

    // Validación completa antes de enviar
    for (var step = 1; step <= TOTAL_STEPS; step++) {
      var invalid = validateStep(step);
      if (invalid) {
        goToStep(step, false);
        invalid.focus();
        setStatus("Revisa los campos marcados para enviar tu solicitud.", "error");
        return;
      }
    }

    // Sin endpoint no se envía nada y no se muestra una confirmación falsa
    if (!config.formEndpoint) {
      console.warn("Formulario sin endpoint: configura formEndpoint en js/config.js");
      setStatus(
        "No hemos podido enviar tu solicitud en este momento. Puedes llamarnos o escribirnos directamente.",
        "warning"
      );
      return;
    }

    setSending(true);

    var controller = "AbortController" in window ? new AbortController() : null;
    var timeout = setTimeout(function () {
      if (controller) controller.abort();
    }, 15000);

    // text/plain evita la comprobación previa (preflight) que Apps Script no admite
    fetch(config.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(buildPayload()),
      signal: controller ? controller.signal : undefined,
      credentials: "omit",
    })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data || !data.ok) throw new Error(data && data.error ? data.error : "respuesta no válida");
        showSuccess();
      })
      .catch(function (error) {
        console.error(error);
        setStatus(
          "No hemos podido enviar tu solicitud. Inténtalo de nuevo o llámanos directamente.",
          "error"
        );
      })
      .finally(function () {
        clearTimeout(timeout);
        setSending(false);
      });
  });

  // Estado inicial
  goToStep(1);

  /* ---------- Inicio rápido en la portada ----------
     Recoge nombre y correo, los pasa al asistente y lo deja en el paso 2.
     No se envía nada hasta que la persona termina y pulsa «Enviar solicitud». */
  var quick = document.getElementById("quick-start");
  if (quick) {
    var qsName = document.getElementById("qs-nombre");
    var qsEmail = document.getElementById("qs-email");
    var qsError = document.getElementById("qs-error");

    function qsShow(message, input) {
      qsError.textContent = message;
      qsError.hidden = !message;
      [qsName, qsEmail].forEach(function (el) {
        el.setAttribute("aria-invalid", el === input ? "true" : "false");
      });
      if (input) input.focus();
    }

    quick.addEventListener("submit", function (event) {
      event.preventDefault();
      var nameError = rules.nombre(qsName.value);
      if (nameError) return qsShow(nameError, qsName);
      var emailError = rules.email(qsEmail.value);
      if (emailError) return qsShow(emailError, qsEmail);
      qsShow("", null);

      field("nombre").value = qsName.value.trim();
      field("email").value = qsEmail.value.trim();
      setError("nombre", "");
      setError("email", "");
      goToStep(2, false);

      document.getElementById("contacto").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(function () {
        focusPanelTitle(2);
      }, reduceMotion ? 0 : 500);
    });

    [qsName, qsEmail].forEach(function (el) {
      el.addEventListener("input", function () {
        if (!qsError.hidden) qsShow("", null);
      });
    });
  }
})();
