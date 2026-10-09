(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var root = document.documentElement;
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

  /* ---------- Cabecera: borde al hacer scroll ---------- */
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

  /* ---------- Revelado al entrar en pantalla ---------- */
  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Formulario de consulta (solo en index.html) ---------- */
  var form = document.getElementById("consulta-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  var submitButton = form.querySelector('button[type="submit"]');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
  };

  function getField(name) {
    return form.elements.namedItem(name);
  }

  function setError(name, message) {
    var errorEl = document.getElementById(name + "-error");
    var input = getField(name);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = !message;
    }
    if (input && input.setAttribute) {
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }
    return !message;
  }

  function validateAll() {
    var firstInvalid = null;
    var valid = true;

    function check(ok, focusTarget) {
      if (!ok) {
        valid = false;
        if (!firstInvalid) firstInvalid = focusTarget;
      }
    }

    check(setError("nombre", rules.nombre(getField("nombre").value)), getField("nombre"));
    check(setError("email", rules.email(getField("email").value)), getField("email"));
    check(setError("telefono", rules.telefono(getField("telefono").value)), getField("telefono"));

    var preferenciaChecked = form.querySelector('input[name="preferencia"]:checked');
    check(
      setError("preferencia", preferenciaChecked ? "" : "Elige cómo prefieres que te contactemos."),
      form.querySelector('input[name="preferencia"]')
    );

    var privacidad = getField("privacidad");
    check(
      setError("privacidad", privacidad.checked ? "" : "Necesitamos que aceptes la política de privacidad para continuar."),
      privacidad
    );

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  // Validación al salir del campo, para no molestar mientras se escribe
  ["nombre", "email", "telefono"].forEach(function (name) {
    var input = getField(name);
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

  function setStatus(message, type) {
    status.textContent = message;
    status.classList.toggle("is-error", type === "error");
    status.classList.toggle("is-warning", type === "warning");
  }

  function buildPayload() {
    var data = new FormData(form);
    return {
      nombre: String(data.get("nombre") || "").trim(),
      email: String(data.get("email") || "").trim(),
      telefono: String(data.get("telefono") || "").trim(),
      motivo: String(data.get("motivo") || ""),
      preferencia: String(data.get("preferencia") || ""),
      privacidad: data.get("privacidad") === "on",
      fecha: new Date().toISOString(),
      origen: window.location.href,
    };
  }

  function setSending(sending) {
    submitButton.disabled = sending;
    submitButton.setAttribute("aria-busy", String(sending));
    submitButton.textContent = sending ? "Enviando…" : "Solicitar una consulta";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("", "");

    // Si el campo trampa tiene contenido, es un robot: no se envía nada
    if (getField("web").value) {
      setStatus("Gracias. Hemos recibido tu solicitud.", "");
      form.reset();
      return;
    }

    if (!validateAll()) {
      setStatus("Revisa los campos marcados para poder enviar tu solicitud.", "error");
      return;
    }

    // Sin endpoint configurado no se envía nada y no se muestra confirmación falsa
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

    fetch(config.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildPayload()),
      signal: controller ? controller.signal : undefined,
      credentials: "omit",
    })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        form.reset();
        form.classList.remove("is-sent");
        void form.offsetWidth;
        form.classList.add("is-sent");
        setStatus(
          "Gracias. Hemos recibido tu solicitud y te responderemos por la vía que has elegido.",
          ""
        );
      })
      .catch(function () {
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
})();
