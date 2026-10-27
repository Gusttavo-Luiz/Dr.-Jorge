/* =========================================================================
   Painel de conteúdo — Clínica Veter
   Edita uma cópia de window.SITE no navegador, permite pré-visualizar o
   site com o rascunho e gera um novo js/content.js para download.
   Nada é publicado automaticamente: o arquivo baixado precisa substituir
   js/content.js no repositório.
   ========================================================================= */
(function () {
  "use strict";

  var DRAFT_KEY = "veter-content-draft";
  var doc = document;
  var state = loadDraft() || clone(window.SITE);

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }

  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch (e) { /* armazenamento indisponível */ }
  }

  function status(text) { $("[data-status]").textContent = text; }

  function getPath(path) {
    return path.split(".").reduce(function (acc, key) { return acc == null ? acc : acc[key]; }, state);
  }

  function setPath(path, value) {
    var keys = path.split(".");
    var last = keys.pop();
    var target = keys.reduce(function (acc, key) {
      if (acc[key] == null) acc[key] = {};
      return acc[key];
    }, state);
    target[last] = value;
    saveDraft();
    status("Rascunho salvo neste navegador. Lembre-se de baixar o content.js para publicar.");
  }

  /* ---------- Campos ---------- */

  var uid = 0;

  function field(def, path) {
    var id = "f" + (++uid);
    var value = getPath(path);
    var wrap = doc.createElement("div");
    wrap.className = "field" + (def.full ? " field--full" : "") + (def.type === "checkbox" ? " field--check" : "");

    var label = doc.createElement("label");
    label.htmlFor = id;
    label.textContent = def.label;

    var input;
    if (def.type === "textarea") {
      input = doc.createElement("textarea");
      input.rows = def.rows || 3;
      input.value = value == null ? "" : value;
    } else if (def.type === "select") {
      input = doc.createElement("select");
      def.options.forEach(function (opt) {
        var o = doc.createElement("option");
        o.value = opt[0];
        o.textContent = opt[1];
        input.appendChild(o);
      });
      input.value = value == null ? "" : String(value);
    } else {
      input = doc.createElement("input");
      input.type = def.type || "text";
      if (def.type === "checkbox") input.checked = def.invert ? value === false : value !== false && Boolean(value);
      else input.value = value == null ? "" : value;
      if (def.placeholder) input.placeholder = def.placeholder;
    }
    input.id = id;

    input.addEventListener(def.type === "checkbox" || def.type === "select" ? "change" : "input", function () {
      var v;
      if (def.type === "checkbox") v = def.invert ? !input.checked : input.checked;
      else if (def.type === "number") v = input.value === "" ? null : Number(input.value);
      else if (def.type === "time") v = input.value || null;
      else v = input.value;
      if (def.cast) v = def.cast(v);
      setPath(path, v);
      if (def.rerender) render();
    });

    wrap.appendChild(label);
    wrap.appendChild(input);
    if (def.hint) {
      var hint = doc.createElement("p");
      hint.className = "field__hint";
      hint.textContent = def.hint;
      wrap.appendChild(hint);
    }
    return wrap;
  }

  function grid(defs, base) {
    var g = doc.createElement("div");
    g.className = "panel__grid";
    defs.forEach(function (def) { g.appendChild(field(def, base + def.key)); });
    return g;
  }

  /* Lista de itens com adicionar, remover e reordenar */
  function list(path, defs, opts) {
    var wrap = doc.createElement("div");
    var items = getPath(path) || [];
    items.forEach(function (item, index) {
      var box = doc.createElement("div");
      box.className = "item";
      var head = doc.createElement("div");
      head.className = "item__head";
      var title = doc.createElement("span");
      title.className = "item__title";
      title.textContent = opts.title(item, index);
      head.appendChild(title);

      if (!opts.fixed) {
        var tools = doc.createElement("div");
        tools.className = "item__tools";
        [["↑", "Mover para cima", -1], ["↓", "Mover para baixo", 1]].forEach(function (b) {
          var btn = doc.createElement("button");
          btn.type = "button";
          btn.textContent = b[0];
          btn.setAttribute("aria-label", b[1]);
          btn.disabled = index + b[2] < 0 || index + b[2] >= items.length;
          btn.addEventListener("click", function () {
            var moved = items.splice(index, 1)[0];
            items.splice(index + b[2], 0, moved);
            saveDraft();
            render();
          });
          tools.appendChild(btn);
        });
        var del = doc.createElement("button");
        del.type = "button";
        del.className = "danger";
        del.textContent = "Remover";
        del.addEventListener("click", function () {
          if (!window.confirm("Remover “" + opts.title(item, index) + "”?")) return;
          items.splice(index, 1);
          saveDraft();
          render();
        });
        tools.appendChild(del);
        head.appendChild(tools);
      }

      box.appendChild(head);
      box.appendChild(grid(defs, path + "." + index + "."));
      wrap.appendChild(box);
    });

    if (!opts.fixed) {
      var add = doc.createElement("button");
      add.type = "button";
      add.className = "btn btn--ghost add-btn";
      add.textContent = "+ " + opts.addLabel;
      add.addEventListener("click", function () {
        if (!getPath(path)) setPath(path, []);
        getPath(path).push(clone(opts.empty));
        saveDraft();
        render();
      });
      wrap.appendChild(add);
    }
    return wrap;
  }

  function panel(id, title, help, content) {
    var section = doc.createElement("section");
    section.className = "panel";
    section.id = id;
    var h = doc.createElement("h2");
    h.textContent = title;
    section.appendChild(h);
    if (help) {
      var p = doc.createElement("p");
      p.className = "panel__help";
      p.textContent = help;
      section.appendChild(p);
    }
    content.forEach(function (node) { section.appendChild(node); });
    return section;
  }

  /* ---------- Definições das seções ---------- */

  var ICONS = [["stethoscope", "Estetoscópio"], ["clipboard", "Prancheta"], ["scalpel", "Bisturi"], ["shield", "Escudo"], ["heart", "Coração"], ["leaf", "Folha"], ["paw", "Pata"]];
  var CATEGORIES = [["clinica", "Nossa clínica"], ["caes", "Cães"], ["gatos", "Gatos"], ["equipe", "Equipe veterinária"], ["ambiente", "Ambiente de atendimento"]];
  var STARS = [["5", "5 estrelas"], ["4", "4 estrelas"], ["3", "3 estrelas"], ["2", "2 estrelas"], ["1", "1 estrela"]];

  function render() {
    var editor = $("[data-editor]");
    editor.replaceChildren();

    var sections = [
      panel("p-horarios", "Horários", "Preencha abertura e fechamento de cada dia confirmado. Dias sem horário aparecem como “A confirmar”. Marque “Fechado” para dias sem atendimento.", [
        list("hours", [
          { key: "open", label: "Abre às", type: "time" },
          { key: "close", label: "Fecha às", type: "time" },
          { key: "closed", label: "Fechado neste dia", type: "checkbox" }
        ], { fixed: true, title: function (d) { return d.day; } }),
        grid([{ key: "hoursNote", label: "Observação de horário", full: true, hint: "Aparece enquanto a tabela estiver incompleta. Deixe vazio para ocultar." }], "")
      ]),
      panel("p-avisos", "Avisos e feriados", "Avisos aparecem no card de horários entre as datas indicadas.", [
        list("notices", [
          { key: "text", label: "Texto do aviso", full: true },
          { key: "from", label: "Exibir a partir de", type: "date" },
          { key: "until", label: "Exibir até", type: "date" }
        ], { title: function (n, i) { return "Aviso " + (i + 1); }, addLabel: "Adicionar aviso", empty: { text: "", from: "", until: "" } })
      ]),
      panel("p-servicos", "Serviços", "Exiba apenas serviços confirmados pela clínica. Desmarque “Ativo” para esconder sem apagar.", [
        list("services", [
          { key: "active", label: "Ativo (aparece no site)", type: "checkbox", full: true },
          { key: "title", label: "Nome do serviço" },
          { key: "icon", label: "Ícone", type: "select", options: ICONS },
          { key: "description", label: "Descrição", type: "textarea", full: true }
        ], { title: function (s) { return s.title || "Novo serviço"; }, addLabel: "Adicionar serviço", empty: { active: true, icon: "paw", title: "", description: "" } })
      ]),
      panel("p-equipe", "Equipe", "Use somente fotos reais e autorizadas, enviadas para a pasta img/ do repositório (ex.: img/equipe/dr-jorge.webp). Não inclua títulos ou especialidades sem confirmação.", [
        list("team", [
          { key: "name", label: "Nome" },
          { key: "role", label: "Função" },
          { key: "initials", label: "Inicial (sem foto)" },
          { key: "photo", label: "Foto (caminho do arquivo)", placeholder: "img/equipe/nome.webp" },
          { key: "description", label: "Descrição", type: "textarea", full: true },
          { key: "link", label: "Link “Conhecer o profissional” (opcional)", full: true }
        ], { title: function (m) { return m.name || "Novo integrante"; }, addLabel: "Adicionar integrante", empty: { name: "", role: "", initials: "", description: "", photo: "", link: "" } })
      ]),
      panel("p-avaliacoes", "Avaliações", "Confira cada texto com a avaliação original no Google. Preencha “Trecho literal” para citações entre aspas OU “Resumo” para relatos resumidos. Indique cortes com [...].", [
        grid([
          { key: "rating.value", label: "Nota média (ex.: 4,7)" },
          { key: "rating.count", label: "Total de avaliações", type: "number" },
          { key: "links.googleReviews", label: "Link do perfil no Google", full: true }
        ], ""),
        list("testimonials", [
          { key: "author", label: "Autor" },
          { key: "stars", label: "Estrelas", type: "select", options: STARS, cast: Number },
          { key: "showAuthor", label: "Exibir o nome do autor", type: "checkbox", full: true },
          { key: "quote", label: "Trecho literal", type: "textarea", full: true },
          { key: "summary", label: "Resumo do relato", type: "textarea", full: true },
          { key: "highlight", label: "Destaque (etiqueta)", full: true }
        ], { title: function (t) { return t.author || "Nova avaliação"; }, addLabel: "Adicionar avaliação", empty: { author: "", showAuthor: true, stars: 5, quote: "", summary: "", highlight: "" } })
      ]),
      panel("p-galeria", "Galeria", "A seção aparece no site quando houver ao menos uma foto. Não publique pacientes identificáveis sem autorização dos tutores.", [
        list("gallery", [
          { key: "src", label: "Arquivo da foto", placeholder: "img/galeria/recepcao.webp" },
          { key: "category", label: "Categoria", type: "select", options: CATEGORIES },
          { key: "alt", label: "Descrição da foto (texto alternativo)", full: true },
          { key: "wide", label: "Foto larga (ocupa 2 colunas)", type: "checkbox" },
          { key: "tall", label: "Foto alta (ocupa 2 linhas)", type: "checkbox" }
        ], { title: function (p, i) { return "Foto " + (i + 1); }, addLabel: "Adicionar foto", empty: { src: "", alt: "", category: "clinica", wide: false, tall: false } })
      ]),
      panel("p-imagens", "Imagens das seções", "Sem foto, o site mostra as ilustrações próprias. Use fotos reais da clínica com uma descrição clara.", [
        grid([
          { key: "images.hero.src", label: "Topo — arquivo" }, { key: "images.hero.alt", label: "Topo — descrição" },
          { key: "images.about.src", label: "A Clínica — arquivo" }, { key: "images.about.alt", label: "A Clínica — descrição" },
          { key: "images.care.src", label: "Atendimento humanizado — arquivo" }, { key: "images.care.alt", label: "Atendimento humanizado — descrição" },
          { key: "images.cta.src", label: "Contato — arquivo" }, { key: "images.cta.alt", label: "Contato — descrição" }
        ], "")
      ]),
      panel("p-contato", "Contato e WhatsApp", "Desative o WhatsApp se o número não tiver WhatsApp: os botões passam a ligar para a clínica.", [
        grid([
          { key: "contact.phoneDisplay", label: "Telefone (como aparece)" },
          { key: "contact.phoneE164", label: "Telefone para ligação", hint: "Formato +55DDDNÚMERO, ex.: +551139755822" },
          { key: "whatsapp.enabled", label: "WhatsApp ativo", type: "checkbox", full: true },
          { key: "whatsapp.number", label: "Número do WhatsApp", hint: "Formato 55DDDNÚMERO, sem espaços" },
          { key: "whatsapp.messages.schedule", label: "Mensagem — agendamento", type: "textarea", full: true },
          { key: "whatsapp.messages.services", label: "Mensagem — serviços", type: "textarea", full: true },
          { key: "whatsapp.messages.location", label: "Mensagem — localização", type: "textarea", full: true }
        ], "")
      ]),
      panel("p-redes", "Redes sociais", "Cadastre apenas perfis oficiais confirmados.", [
        list("social", [
          { key: "network", label: "Rede", type: "select", options: [["instagram", "Instagram"], ["facebook", "Facebook"]] },
          { key: "url", label: "Endereço do perfil", placeholder: "https://www.instagram.com/..." }
        ], { title: function (s) { return s.network === "facebook" ? "Facebook" : "Instagram"; }, addLabel: "Adicionar rede social", empty: { network: "instagram", url: "" } })
      ])
    ];

    var toc = $("[data-toc]");
    toc.replaceChildren();
    sections.forEach(function (section) {
      editor.appendChild(section);
      var a = doc.createElement("a");
      a.href = "#" + section.id;
      a.textContent = $("h2", section).textContent;
      toc.appendChild(a);
    });
  }

  /* ---------- Exportação ---------- */

  function cleanForExport(data) {
    var out = clone(data);
    (out.testimonials || []).forEach(function (t) {
      if (!t.quote) delete t.quote;
      if (!t.summary) delete t.summary;
    });
    (out.hours || []).forEach(function (d) { if (!d.closed) delete d.closed; });
    return out;
  }

  function buildFile() {
    return [
      "/* =========================================================================",
      "   Conteúdo editável do site — Clínica Veter",
      "   Gerado pelo painel admin.html em " + new Date().toLocaleString("pt-BR") + ".",
      "   Para editar novamente, use o painel ou altere este arquivo à mão.",
      "   Só publique informações confirmadas pela clínica.",
      "   ========================================================================= */",
      "",
      "window.SITE = " + JSON.stringify(cleanForExport(state), null, 2) + ";",
      ""
    ].join("\n");
  }

  doc.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.getAttribute("data-action");
    if (action === "download") {
      var blob = new Blob([buildFile()], { type: "text/javascript;charset=utf-8" });
      var a = doc.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "content.js";
      doc.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      status("Arquivo content.js baixado. Substitua js/content.js no repositório para publicar.");
    } else if (action === "preview") {
      saveDraft();
      window.open("./?preview=1", "_blank", "noopener");
    } else if (action === "reset") {
      if (!window.confirm("Descartar o rascunho e voltar ao conteúdo publicado?")) return;
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignorado */ }
      state = clone(window.SITE);
      render();
      status("Rascunho descartado.");
    }
  });

  if (loadDraft()) status("Rascunho anterior carregado deste navegador.");
  render();
})();
