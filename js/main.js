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

  /* ---------- Portada: profundidad con el ratón ----------
     Decorativo y solo en dispositivos con ratón. El valor se suaviza en cada fotograma
     (efecto muelle) en lugar de seguir el puntero en seco. */
  var heroSunMove = document.querySelector(".hero-sun-move");
  var heroImg = document.querySelector(".arch img");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (hero && heroSunMove && heroImg && finePointer && !reduceMotion) {
    var tx = 0, ty = 0, cx = 0, cy = 0, parallaxFrame = null;

    var parallaxLoop = function () {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      heroSunMove.style.transform = "translate3d(" + (-cx * 40).toFixed(2) + "px," + (-cy * 30).toFixed(2) + "px,0)";
      heroImg.style.transform = "scale(1.06) translate3d(" + (cx * -16).toFixed(2) + "px," + (cy * -12).toFixed(2) + "px,0)";
      if (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005) {
        parallaxFrame = requestAnimationFrame(parallaxLoop);
      } else {
        parallaxFrame = null;
      }
    };

    var aimParallax = function (x, y) {
      tx = x;
      ty = y;
      if (!parallaxFrame) parallaxFrame = requestAnimationFrame(parallaxLoop);
    };

    hero.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse") return;
      var r = hero.getBoundingClientRect();
      aimParallax((event.clientX - r.left) / r.width - 0.5, (event.clientY - r.top) / r.height - 0.5);
    });
    hero.addEventListener("pointerleave", function () { aimParallax(0, 0); });
  }

  /* ---------- Menú que sigue la lectura ----------
     Marca con aria-current la sección visible y desliza el indicador hasta ella. */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a[href^="#"]')).filter(function (a) {
    return !a.closest(".nav-cta");
  });
  var spySections = spyLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var navIndicator = document.querySelector(".nav-indicator");
  var spyFrame = null;
  var lastActive = -2;

  function updateSpy() {
    spyFrame = null;
    var line = window.innerHeight * 0.35;
    var active = -1;
    spySections.forEach(function (section, i) {
      if (section && section.getBoundingClientRect().top <= line) active = i;
    });
    if (active === lastActive) return;
    lastActive = active;

    spyLinks.forEach(function (a, i) {
      if (i === active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });

    if (!navIndicator) return;
    if (active < 0 || window.innerWidth <= 920) {
      navIndicator.classList.remove("is-on");
      return;
    }
    var link = spyLinks[active];
    var x = link.offsetLeft;
    var y = link.offsetTop + link.offsetHeight - 2;
    navIndicator.style.transform = "translate3d(" + x + "px," + y + "px,0) scaleX(" + (link.offsetWidth / 100).toFixed(3) + ")";
    navIndicator.classList.add("is-on");
  }

  function requestSpy() {
    if (!spyFrame) spyFrame = requestAnimationFrame(updateSpy);
  }

  if (spyLinks.length) {
    window.addEventListener("scroll", requestSpy, { passive: true });
    window.addEventListener("resize", function () { lastActive = -2; requestSpy(); });
    updateSpy();
  }

  /* ---------- Pasos que se iluminan al avanzar ---------- */
  var stepsList = document.querySelector(".steps");
  var stepsFill = document.getElementById("steps-fill");
  if (stepsList && stepsFill) {
    var stepItems = Array.prototype.slice.call(stepsList.children);
    var stepsFrame = null;

    var updateSteps = function () {
      stepsFrame = null;
      var p = 1;
      if (!reduceMotion) {
        var r = stepsList.getBoundingClientRect();
        var vh = window.innerHeight;
        p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      }
      stepsFill.style.transform = "scaleX(" + p.toFixed(3) + ")";
      stepItems.forEach(function (li, i) {
        li.classList.toggle("is-active", p >= (i + 0.3) / stepItems.length);
      });
    };

    window.addEventListener("scroll", function () {
      if (!stepsFrame) stepsFrame = requestAnimationFrame(updateSteps);
    }, { passive: true });
    updateSteps();
  }

  /* ---------- Buscador de preguntas frecuentes ---------- */
  var faqInput = document.getElementById("faq-q");
  if (faqInput) {
    var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq details"));
    var faqEmpty = document.getElementById("faq-empty");
    var faqCount = document.getElementById("faq-count");
    var normalize = function (text) {
      return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    };
    var faqTexts = faqItems.map(function (d) { return normalize(d.textContent); });

    faqInput.addEventListener("input", function () {
      var words = normalize(faqInput.value).split(/\s+/).filter(Boolean);
      var shown = 0;
      faqItems.forEach(function (d, i) {
        var match = words.every(function (w) { return faqTexts[i].indexOf(w) !== -1; });
        d.hidden = !match;
        if (match) shown++;
      });
      faqEmpty.hidden = shown !== 0;
      faqCount.textContent = !words.length ? "" : shown === 1 ? "1 pregunta encontrada" : shown + " preguntas encontradas";
    });
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

  /* ---------- Guía «¿Por dónde empezar?» ----------
     Tres preguntas, una orientación prudente y un acceso directo a la solicitud con el
     motivo ya elegido. Las respuestas no salen del navegador. */
  var guideStage = document.getElementById("guide-stage");
  if (guideStage) {
    var guideCount = document.getElementById("guide-count");
    var guideBar = document.getElementById("guide-bar");
    var guideBack = document.querySelector(".guide-back");
    var EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

    var QUESTIONS = [
      {
        key: "quien",
        text: "¿Qué relación te preocupa ahora mismo?",
        options: [
          ["matrimonio", "Nuestro matrimonio"],
          ["pareja", "Nuestra relación de pareja"],
          ["familia", "La convivencia entre madres, padres e hijos"],
          ["acuerdos", "Varias personas de la familia que tenemos que llegar a acuerdos"],
          ["cuidar", "Ninguna en concreto: queremos cuidar nuestros vínculos"],
        ],
      },
      {
        key: "que",
        text: "¿Qué describe mejor lo que está pasando?",
        options: [
          ["comunicacion", "Nos cuesta comunicarnos"],
          ["conflicto", "Hay un conflicto que se repite"],
          ["decisiones", "Tenemos que tomar decisiones o llegar a acuerdos"],
          ["anticipar", "Todavía no pasa nada; queremos anticiparnos"],
        ],
      },
      {
        key: "quienes",
        text: "¿Quién estaría dispuesto a venir?",
        options: [
          ["solo", "De momento, solo yo"],
          ["todos", "Los dos, o todas las personas implicadas"],
          ["nose", "Aún no lo sé"],
        ],
      },
    ];

    var SERVICES = {
      matrimonial: { title: "Orientación matrimonial", text: "Un espacio para que los dos podáis expresar lo que vivís, entender qué está pasando en vuestro matrimonio y decidir juntos qué pasos dar." },
      pareja: { title: "Orientación de pareja", text: "Te ayudamos a identificar los patrones que se repiten, a comprender el conflicto desde cada lado y a desarrollar herramientas para comunicaros mejor." },
      familiar: { title: "Orientación familiar", text: "Acompañamos a madres, padres e hijos a entender lo que ocurre en la convivencia y a encontrar formas más respetuosas de relacionarse en el día a día." },
      mediacion: { title: "Mediación familiar", text: "Una persona imparcial facilita el diálogo para que seáis vosotros quienes lleguéis a vuestros propios acuerdos, con calma y respetando a cada parte." },
      prevencion: { title: "Prevención y fortalecimiento", text: "Un espacio para cuidar el vínculo, mejorar la comunicación y anticiparos a los conflictos antes de que aparezcan." },
    };

    var answers = {};
    var current = 0;
    var busy = false;

    var recommend = function () {
      var notes = [];
      var key;
      if (answers.quien === "cuidar" || answers.que === "anticipar") key = "prevencion";
      else if (answers.quien === "acuerdos" || answers.que === "decisiones") key = "mediacion";
      else if (answers.quien === "familia") key = "familiar";
      else if (answers.quien === "matrimonio") key = "matrimonial";
      else key = "pareja";

      if (key === "mediacion" && answers.quienes !== "todos") {
        notes.push("La mediación necesita que participen, de forma voluntaria, todas las partes. Si de momento vienes tú, podemos empezar con una orientación y valorar juntos el siguiente paso.");
      } else if (answers.quienes === "solo") {
        notes.push("No hace falta que vengáis todos para empezar: también puedes dar tú el primer paso.");
      }
      return { key: key, notes: notes };
    };

    var setChrome = function (step) {
      var isResult = step >= QUESTIONS.length;
      guideCount.textContent = isResult ? "Tu orientación" : "Pregunta " + (step + 1) + " de " + QUESTIONS.length;
      guideBar.style.transform = "scaleX(" + Math.max(0.06, step / QUESTIONS.length).toFixed(3) + ")";
      guideBack.hidden = step === 0;
    };

    var renderQuestion = function (step) {
      var q = QUESTIONS[step];
      var html = '<h3 class="guide-q" tabindex="-1">' + q.text + '</h3><ul class="guide-options">';
      q.options.forEach(function (opt) {
        var picked = answers[q.key] === opt[0] ? " is-picked" : "";
        html += '<li><button class="guide-option' + picked + '" type="button" data-value="' + opt[0] + '">' + opt[1] + "</button></li>";
      });
      guideStage.innerHTML = html + "</ul>";
    };

    var renderResult = function () {
      var r = recommend();
      var service = SERVICES[r.key];
      var notes = r.notes.map(function (n) { return '<p class="guide-note">' + n + "</p>"; }).join("");
      guideStage.innerHTML =
        '<div class="guide-result">' +
        '<svg class="guide-merge" viewBox="0 0 92 56" aria-hidden="true"><circle class="a" cx="32" cy="28" r="24" fill="#5BC48C"/><circle class="b" cx="60" cy="28" r="24" fill="#F7C65B"/></svg>' +
        '<p class="guide-result-label">Por lo que nos cuentas, puede encajarte:</p>' +
        '<h3 tabindex="-1">' + service.title + "</h3>" +
        "<p>" + service.text + "</p>" + notes +
        '<div class="guide-actions">' +
        '<button class="btn btn-primary" type="button" data-guide-request="' + r.key + '">Solicitar una consulta sobre esto</button>' +
        '<button class="link-more" type="button" data-guide-see="' + r.key + '">Ver el servicio</button>' +
        "</div>" +
        '<div class="guide-foot"><p class="guide-disclaimer">Es una orientación general, no un diagnóstico. Lo valoraremos juntos en la primera conversación.</p>' +
        '<button class="link-more" type="button" data-guide-restart>Volver a empezar</button></div>' +
        "</div>";
      var merge = guideStage.querySelector(".guide-merge");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { merge.classList.add("is-merged"); });
      });
    };

    var show = function (step, moveFocus) {
      current = step;
      setChrome(step);
      if (step >= QUESTIONS.length) renderResult();
      else renderQuestion(step);

      if (!reduceMotion && guideStage.animate) {
        guideStage.animate(
          [{ opacity: 0, transform: "translateX(18px)" }, { opacity: 1, transform: "none" }],
          { duration: 240, easing: EASE }
        );
        guideStage.querySelectorAll(".guide-option").forEach(function (btn, i) {
          btn.animate(
            [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
            { duration: 260, delay: 40 + i * 45, easing: EASE, fill: "backwards" }
          );
        });
      }
      if (moveFocus) {
        var heading = guideStage.querySelector("h3");
        if (heading) heading.focus({ preventScroll: true });
      }
    };

    var go = function (step) {
      if (busy) return;
      if (reduceMotion || !guideStage.animate) return show(step, true);
      busy = true;
      var out = guideStage.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-14px)" }],
        { duration: 140, easing: EASE, fill: "forwards" }
      );
      out.onfinish = function () {
        out.cancel();
        busy = false;
        show(step, true);
      };
    };

    guideStage.addEventListener("click", function (event) {
      var option = event.target.closest(".guide-option");
      if (option) {
        answers[QUESTIONS[current].key] = option.getAttribute("data-value");
        guideStage.querySelectorAll(".guide-option").forEach(function (b) { b.classList.toggle("is-picked", b === option); });
        go(current + 1);
        return;
      }

      var request = event.target.closest("[data-guide-request]");
      if (request) {
        selectMotivo(request.getAttribute("data-guide-request"));
        goToStep(1, false);
        document.getElementById("contacto").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        setTimeout(function () {
          document.getElementById("nombre").focus({ preventScroll: true });
        }, reduceMotion ? 0 : 600);
        return;
      }

      var see = event.target.closest("[data-guide-see]");
      if (see) {
        var service = document.querySelector('.service[data-motivo="' + see.getAttribute("data-guide-see") + '"]');
        if (!service) return;
        var toggleBtn = service.querySelector(".service-toggle");
        if (toggleBtn.getAttribute("aria-expanded") !== "true") toggleBtn.click();
        service.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        setTimeout(function () { toggleBtn.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
        return;
      }

      if (event.target.closest("[data-guide-restart]")) {
        answers = {};
        go(0);
      }
    });

    guideBack.addEventListener("click", function () {
      go(Math.max(0, current - 1));
    });

    show(0, false);
  }
})();
