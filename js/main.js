/* =========================================================================
   Comportamento do site — Clínica Veter
   Lê os dados de js/content.js (window.SITE) e monta as seções dinâmicas.
   ========================================================================= */
(function () {
  "use strict";

  var SITE = window.SITE;
  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  root.classList.add("js");

  /* ---------- Utilitários ---------- */

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = doc.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      var value = attrs[key];
      if (value === null || value === undefined || value === false) return;
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value);
    });
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === "string" ? doc.createTextNode(child) : child);
    });
    return node;
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  function icon(name, extraClass) {
    var svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "icon" + (extraClass ? " " + extraClass : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = doc.createElementNS(SVG_NS, "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  }

  function stars(count, cls) {
    var wrap = el("span", { class: "stars" + (cls ? " " + cls : ""), "aria-hidden": "true" });
    for (var i = 0; i < 5; i++) {
      var star = icon("star");
      if (i >= count) star.style.opacity = ".25";
      wrap.appendChild(star);
    }
    return wrap;
  }

  function get(obj, path) {
    return path.split(".").reduce(function (acc, key) { return acc == null ? acc : acc[key]; }, obj);
  }

  /* Data/hora atuais no fuso da clínica */
  function nowInClinic() {
    var parts = {};
    new Intl.DateTimeFormat("en-CA", {
      timeZone: SITE.timeZone, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", weekday: "short"
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var dows = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      date: parts.year + "-" + parts.month + "-" + parts.day,
      dow: dows[parts.weekday],
      minutes: Number(parts.hour) * 60 + Number(parts.minute)
    };
  }

  function toMinutes(hhmm) {
    var p = hhmm.split(":");
    return Number(p[0]) * 60 + Number(p[1]);
  }

  function formatTime(hhmm) {
    var p = hhmm.split(":");
    if (hhmm === "24:00") return "0h";
    return Number(p[0]) + "h" + (p[1] !== "00" ? p[1] : "");
  }

  function dayText(d) {
    if (d.closed) return "Fechado";
    if (d.open && d.close) return formatTime(d.open) + " às " + formatTime(d.close);
    return null;
  }

  /* ---------- Contato: WhatsApp e links ---------- */

  var wa = SITE.whatsapp || {};
  var waEnabled = Boolean(wa.enabled && wa.number);
  var tel = "tel:" + SITE.contact.phoneE164;

  function waUrl(message) {
    return "https://wa.me/" + wa.number + (message ? "?text=" + encodeURIComponent(message) : "");
  }

  function setupContactLinks() {
    $$("[data-wa]").forEach(function (link) {
      if (waEnabled) {
        link.href = waUrl(wa.messages[link.getAttribute("data-wa")]);
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        /* Sem WhatsApp confirmado: o botão vira ligação */
        link.href = tel;
        link.removeAttribute("target");
        var use = $("use[href='#i-whatsapp']", link);
        if (use) use.setAttribute("href", "#i-phone");
        var label = $("[data-wa-label]", link);
        if (label) label.textContent = "Ligar para agendar";
        if (link.classList.contains("wa-float")) link.classList.add("is-phone");
      }
    });

    if (!waEnabled) {
      var submit = $("#form-agendamento [type='submit']");
      if (submit) {
        $("use", submit).setAttribute("href", "#i-check");
        $("[data-wa-label]", submit).textContent = "Preparar solicitação";
      }
      var intro = $(".form-card__intro");
      if (intro) intro.textContent = "Preencha os dados e ligue para a clínica para concluir sua solicitação. O horário só fica confirmado após a resposta da equipe.";
    }

    $$("[data-link]").forEach(function (link) {
      var url = SITE.links[link.getAttribute("data-link")];
      if (url) link.href = url;
      else link.hidden = true;
    });

    $$("[data-bind]").forEach(function (node) {
      var value = get(SITE, node.getAttribute("data-bind"));
      if (value != null) node.textContent = value;
    });

    $$("[data-year]").forEach(function (node) { node.textContent = new Date().getFullYear(); });
  }

  /* ---------- Fotos reais configuradas em content.js ---------- */

  function setupImages() {
    $$("[data-image]").forEach(function (frame) {
      var image = SITE.images && SITE.images[frame.getAttribute("data-image")];
      if (!image || !image.src) return;
      var img = $("img", frame);
      img.src = image.src;
      img.alt = image.alt || "";
      img.classList.remove("media-frame__art");
    });
  }

  /* ---------- Equipe ---------- */

  function renderTeam() {
    var list = $("[data-render='team']");
    if (!list) return;
    (SITE.team || []).forEach(function (member) {
      var media = el("div", { class: "team-card__media" }, [
        member.photo
          ? el("img", { src: member.photo, alt: "Foto de " + member.name, loading: "lazy", decoding: "async", width: 480, height: 360 })
          : el("span", { class: "team-card__monogram", "aria-hidden": "true", text: member.initials || member.name.charAt(0) })
      ]);
      var body = el("div", { class: "team-card__body" }, [
        el("p", { class: "team-card__role", text: member.role }),
        el("h3", { text: member.name }),
        el("p", { text: member.description }),
        member.link
          ? el("a", { class: "btn btn--ghost", href: member.link, target: "_blank", rel: "noopener" }, ["Conhecer " + member.name, icon("arrow")])
          : null
      ]);
      list.appendChild(el("li", { class: "team-card reveal" }, [media, body]));
    });
  }

  /* ---------- Serviços ---------- */

  var SERVICE_ICONS = ["stethoscope", "clipboard", "scalpel", "shield", "heart", "leaf", "paw"];

  function renderServices() {
    var list = $("[data-render='services']");
    if (!list) return;
    var active = (SITE.services || []).filter(function (s) { return s.active !== false; });
    if (!active.length) {
      list.parentNode.removeChild(list);
      return;
    }
    active.forEach(function (service) {
      var name = SERVICE_ICONS.indexOf(service.icon) > -1 ? service.icon : "paw";
      list.appendChild(el("li", { class: "service-card reveal" }, [
        el("span", { class: "icon-badge" }, [icon(name)]),
        el("h3", { text: service.title }),
        service.description ? el("p", { text: service.description }) : null
      ]));
    });
  }

  /* ---------- Avaliações ---------- */

  function renderTestimonials() {
    var list = $("[data-render='testimonials']");
    if (!list) return;
    (SITE.testimonials || []).forEach(function (t) {
      var name = t.showAuthor === false || !t.author ? "Cliente da Clínica Veter" : t.author;
      var content;
      if (t.quote) {
        content = el("blockquote", {}, [el("p", { text: "“" + t.quote + "”" })]);
      } else {
        content = el("div", { class: "review-card__content" }, [
          el("span", { class: "review-card__summary-label", text: "Resumo do relato" }),
          el("p", { class: "review-card__summary", text: t.summary })
        ]);
        content.style.marginBottom = "24px";
      }
      var starsNode = stars(t.stars || 5);
      list.appendChild(el("li", { class: "review-card reveal" }, [
        el("div", { class: "review-card__top" }, [
          starsNode,
          el("span", { class: "sr-only", text: (t.stars || 5) + " de 5 estrelas." }),
          t.highlight ? el("span", { class: "review-card__tag", text: t.highlight }) : null
        ]),
        content,
        el("div", { class: "review-card__author" }, [
          el("span", { class: "review-card__avatar", "aria-hidden": "true", text: name.charAt(0) }),
          el("span", {}, [el("strong", { text: name }), el("small", { text: "Avaliação no Google" })])
        ])
      ]));
    });
  }

  /* ---------- Horários ---------- */

  function renderHours() {
    var hours = SITE.hours || [];
    var now = nowInClinic();
    var known = hours.filter(function (d) { return dayText(d); });

    var list = $("[data-render='hours']");
    if (list) {
      hours.forEach(function (d) {
        var text = dayText(d);
        var row = el("div", { class: "hours__row" + (d.dow === now.dow ? " is-today" : "") }, [
          el("dt", { text: d.day + (d.dow === now.dow ? " (hoje)" : "") }),
          el("dd", { class: text ? null : "is-pending", text: text || "A confirmar" })
        ]);
        list.appendChild(row);
      });
    }

    var note = $("[data-render='hours-note']");
    if (note && SITE.hoursNote && known.length < hours.length) note.textContent = SITE.hoursNote;

    var notices = $("[data-render='notices']");
    if (notices) {
      (SITE.notices || []).forEach(function (n) {
        if ((n.from && now.date < n.from) || (n.until && now.date > n.until)) return;
        notices.appendChild(el("p", { class: "notice", role: "status" }, [icon("calendar"), n.text]));
      });
    }

    /* Indicador "Aberto agora" — só aparece com o horário de hoje confirmado */
    var status = $("[data-render='status']");
    var today = hours.filter(function (d) { return d.dow === now.dow; })[0];
    if (status && today && dayText(today)) {
      var open = !today.closed && now.minutes >= toMinutes(today.open) && now.minutes < toMinutes(today.close);
      status.textContent = open ? "Aberto agora" : "Fechado agora";
      status.classList.toggle("status--open", open);
      status.hidden = false;
    }

    var footer = $("[data-render='footer-hours']");
    if (footer) {
      known.forEach(function (d) {
        footer.appendChild(el("span", {}, [el("span", { text: d.day }), el("span", { text: dayText(d) })]));
      });
      if (known.length < hours.length) {
        if (!known.length && SITE.hoursNote) footer.appendChild(el("p", { text: SITE.hoursNote }));
        footer.appendChild(el("p", { text: known.length ? "Demais dias: consulte a clínica." : "Consulte os horários pelo telefone." }));
      }
    }
  }

  /* ---------- Redes sociais (somente perfis oficiais confirmados) ---------- */

  function renderSocial() {
    var list = $("[data-render='social']");
    var items = (SITE.social || []).filter(function (s) { return s.url && (s.network === "instagram" || s.network === "facebook"); });
    if (!list || !items.length) return;
    items.forEach(function (s) {
      var label = s.network === "instagram" ? "Instagram" : "Facebook";
      list.appendChild(el("li", {}, [
        el("a", { href: s.url, target: "_blank", rel: "noopener", "aria-label": label + " da Clínica Veter" }, [icon(s.network)])
      ]));
    });
    list.hidden = false;
  }

  /* ---------- Galeria + visualização ampliada ---------- */

  var CATEGORIES = { clinica: "Nossa clínica", caes: "Cães", gatos: "Gatos", equipe: "Equipe veterinária", ambiente: "Ambiente de atendimento" };

  function renderGallery() {
    var section = $("#galeria");
    var photos = (SITE.gallery || []).filter(function (p) { return p.src; });
    if (!section || !photos.length) return;
    section.hidden = false;

    var grid = $("[data-render='gallery']", section);
    var filters = $("[data-render='gallery-filters']", section);

    photos.forEach(function (photo, index) {
      var btn = el("button", { class: "gallery__btn", type: "button", "data-index": index, "aria-label": "Ampliar foto: " + (photo.alt || "foto da galeria") }, [
        el("img", { src: photo.src, alt: photo.alt || "", loading: "lazy", decoding: "async" })
      ]);
      grid.appendChild(el("li", {
        class: "gallery__item" + (photo.wide ? " gallery__item--wide" : "") + (photo.tall ? " gallery__item--tall" : ""),
        "data-category": photo.category || ""
      }, [btn]));
    });

    var used = Object.keys(CATEGORIES).filter(function (key) {
      return photos.some(function (p) { return p.category === key; });
    });
    if (used.length > 1) {
      ["todas"].concat(used).forEach(function (key) {
        var chip = el("button", { class: "chip", type: "button", "data-filter": key, "aria-pressed": key === "todas" ? "true" : "false", text: key === "todas" ? "Todas" : CATEGORIES[key] });
        filters.appendChild(chip);
      });
      filters.addEventListener("click", function (event) {
        var chip = event.target.closest("[data-filter]");
        if (!chip) return;
        var key = chip.getAttribute("data-filter");
        $$(".chip", filters).forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        $$(".gallery__item", grid).forEach(function (item) {
          item.hidden = key !== "todas" && item.getAttribute("data-category") !== key;
        });
      });
    } else {
      filters.hidden = true;
    }

    setupLightbox(photos, grid);
  }

  function setupLightbox(photos, grid) {
    var dialog = $(".lightbox");
    if (!dialog || typeof dialog.showModal !== "function") return;
    var img = $(".lightbox__img", dialog);
    var caption = $(".lightbox__caption", dialog);
    var current = 0;
    var opener = null;

    function visibleIndexes() {
      return $$(".gallery__item", grid).filter(function (item) { return !item.hidden; }).map(function (item) {
        return Number($(".gallery__btn", item).getAttribute("data-index"));
      });
    }

    function show(index) {
      current = index;
      img.src = photos[index].src;
      img.alt = photos[index].alt || "";
      caption.textContent = photos[index].alt || "";
    }

    function step(dir) {
      var list = visibleIndexes();
      var pos = list.indexOf(current);
      show(list[(pos + dir + list.length) % list.length]);
    }

    grid.addEventListener("click", function (event) {
      var btn = event.target.closest(".gallery__btn");
      if (!btn) return;
      opener = btn;
      show(Number(btn.getAttribute("data-index")));
      dialog.showModal();
    });

    dialog.addEventListener("click", function (event) {
      var action = event.target.closest("[data-lb]");
      if (action) {
        var type = action.getAttribute("data-lb");
        if (type === "close") dialog.close();
        else step(type === "next" ? 1 : -1);
      } else if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    });

    var touchX = null;
    dialog.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      touchX = null;
    });

    dialog.addEventListener("close", function () {
      if (opener) opener.focus();
    });
  }

  /* ---------- Cabeçalho e menu ---------- */

  function setupHeader() {
    var header = $(".header");
    var toggle = $(".menu-toggle");
    var nav = $("#menu");

    function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      $(".sr-only", toggle).textContent = open ? "Fechar menu" : "Abrir menu";
      $("use", toggle).setAttribute("href", open ? "#i-close" : "#i-menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 1141px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });

    /* Destaca no menu a seção visível */
    if (!("IntersectionObserver" in window)) return;
    var links = $$(".nav__list a");
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = byId[entry.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var section = doc.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Animações de entrada ---------- */

  function setupReveal() {
    var items = $$(".reveal");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (item, i) {
      /* Pequeno escalonamento entre cards vizinhos */
      var siblings = item.parentNode ? $$(":scope > .reveal", item.parentNode) : [];
      var pos = siblings.indexOf(item);
      if (pos > 0) item.style.transitionDelay = Math.min(pos, 5) * 70 + "ms";
      observer.observe(item);
    });
  }

  /* ---------- Mapa: carrega só quando o visitante pede ---------- */

  function setupMap() {
    var map = $("[data-map]");
    var button = $("[data-map-load]");
    if (!map || !button || !SITE.links.mapEmbed) {
      if (button) button.hidden = true;
      return;
    }
    button.addEventListener("click", function () {
      var iframe = el("iframe", {
        src: SITE.links.mapEmbed,
        title: "Mapa com a localização da Clínica Veter",
        loading: "lazy",
        referrerpolicy: "no-referrer-when-downgrade",
        allowfullscreen: ""
      });
      map.replaceChildren(iframe);
      iframe.focus();
    });
  }

  /* ---------- Formulário de solicitação ---------- */

  function setupForm() {
    var form = $("#form-agendamento");
    var success = $("#form-sucesso");
    if (!form || !success) return;

    var rules = {
      nome: function (v) { return v.length >= 2 ? "" : "Informe seu nome."; },
      telefone: function (v) {
        var digits = v.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 13 ? "" : "Informe um telefone com DDD, por exemplo (11) 90000-0000.";
      },
      pet: function (v) { return v.length >= 1 ? "" : "Informe o nome do seu pet."; },
      motivo: function (v) { return v ? "" : "Selecione o motivo do contato."; }
    };

    function check(field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var message = rule(field.value.trim());
      var error = doc.getElementById(field.id + "-erro");
      field.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) error.textContent = message;
      return !message;
    }

    /* Máscara simples para telefone brasileiro */
    var phone = form.elements.telefone;
    phone.addEventListener("input", function () {
      var d = phone.value.replace(/\D/g, "").slice(0, 11);
      var out = d;
      if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 6) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(d.length - 4);
      phone.value = out;
    });

    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      field.addEventListener("blur", function () { if (field.value) check(field); });
      field.addEventListener("input", function () { if (field.getAttribute("aria-invalid") === "true") check(field); });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var invalid = Object.keys(rules).map(function (name) { return form.elements[name]; }).filter(function (f) { return !check(f); });
      if (invalid.length) {
        invalid[0].focus();
        return;
      }

      var data = {
        nome: form.elements.nome.value.trim(),
        telefone: form.elements.telefone.value.trim(),
        pet: form.elements.pet.value.trim(),
        motivo: form.elements.motivo.value,
        mensagem: form.elements.mensagem.value.trim()
      };
      var lines = [
        "Olá! Conheci a Clínica Veter pelo site e gostaria de solicitar um atendimento.",
        "",
        "Nome: " + data.nome,
        "Telefone: " + data.telefone,
        "Nome do pet: " + data.pet,
        "Motivo: " + data.motivo
      ];
      if (data.mensagem) lines.push("Mensagem: " + data.mensagem);
      lines.push("", "Aguardo a confirmação dos horários disponíveis.");
      var text = lines.join("\n");

      var link = $("[data-success-link]", success);
      var info = $("[data-success-text]", success);
      if (waEnabled) {
        var url = waUrl(text);
        link.href = url;
        window.open(url, "_blank", "noopener");
      } else {
        link.href = tel;
        link.removeAttribute("target");
        link.textContent = "Ligar para " + SITE.contact.phoneDisplay;
        info.textContent = "Para concluir sua solicitação, ligue para a clínica no " + SITE.contact.phoneDisplay +
          ". A consulta só fica agendada após a confirmação da equipe.";
      }

      form.hidden = true;
      success.hidden = false;
      success.focus();
    });

    $("[data-form-reset]", success).addEventListener("click", function () {
      form.reset();
      success.hidden = true;
      form.hidden = false;
      form.elements.nome.focus();
    });
  }

  /* Esconde o botão flutuante enquanto o formulário está visível */
  function setupFloatingButton() {
    var button = $(".wa-float");
    var target = $(".form-card");
    if (!button || !target || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      button.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(target);
  }

  /* ---------- Pré-visualização do rascunho do painel (admin.html) ---------- */

  function loadPreview() {
    if (!/[?&]preview=1/.test(location.search)) return;
    var draft = null;
    try { draft = JSON.parse(localStorage.getItem("veter-content-draft")); } catch (e) { /* sem rascunho */ }
    if (!draft) return;
    SITE = draft;
    wa = SITE.whatsapp || {};
    waEnabled = Boolean(wa.enabled && wa.number);
    tel = "tel:" + SITE.contact.phoneE164;
    doc.body.prepend(el("p", { class: "preview-banner", role: "status" }, [
      "Pré-visualização do rascunho do painel — este conteúdo ainda não foi publicado."
    ]));
  }

  /* ---------- Inicialização ---------- */

  loadPreview();
  setupContactLinks();
  setupImages();
  renderTeam();
  renderServices();
  renderTestimonials();
  renderHours();
  renderSocial();
  renderGallery();
  setupHeader();
  setupMap();
  setupForm();
  setupFloatingButton();
  setupReveal();
})();
