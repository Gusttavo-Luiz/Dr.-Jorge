/* =========================================================================
   Conteúdo editável do site — Clínica Veter
   -------------------------------------------------------------------------
   Contatos, horários, serviços, equipe, avaliações e galeria ficam aqui.
   Para atualizar o site, edite apenas este arquivo (à mão ou pelo painel
   admin.html, que gera uma nova versão dele para download).

   Regra de ouro: só publique informações confirmadas pela clínica.
   Campos vazios ("" ou null) simplesmente não aparecem no site.
   ========================================================================= */

window.SITE = {
  name: "Clínica Veter",

  /* Fuso usado no indicador "Aberto agora" e nos avisos com data */
  timeZone: "America/Sao_Paulo",

  /* Endereço público do site (sem barra no fim). Usado no link do
     formulário e nas mensagens. Atualize também index.html, sitemap.xml
     e robots.txt se mudar o domínio. */
  siteUrl: "https://gusttavo-luiz.github.io/Dr.-Jorge",

  contact: {
    phoneDisplay: "(11) 3975-5822",
    phoneE164: "+551139755822",
    address: {
      street: "Av. Cabo Adão Pereira, 87",
      district: "Vila Pirituba",
      city: "São Paulo",
      state: "SP",
      zip: "02936-010"
    }
  },

  /* WhatsApp: confirme com a clínica que o número tem WhatsApp.
     Com "enabled: false", todos os botões de WhatsApp viram botões de
     ligação e o formulário passa a orientar o contato por telefone. */
  whatsapp: {
    enabled: true,
    number: "551139755822",
    messages: {
      schedule:
        "Olá! Conheci a Clínica Veter pelo site e gostaria de consultar os horários disponíveis para agendar um atendimento para meu pet.",
      services:
        "Olá! Gostaria de saber quais serviços veterinários estão disponíveis na Clínica Veter.",
      location:
        "Olá! Gostaria de confirmar o endereço e os horários de atendimento da Clínica Veter."
    }
  },

  links: {
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=Cl%C3%ADnica+Veter%2C+Av.+Cabo+Ad%C3%A3o+Pereira%2C+87+-+Vila+Pirituba%2C+S%C3%A3o+Paulo+-+SP%2C+02936-010",
    maps:
      "https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica+Veter%2C+Av.+Cabo+Ad%C3%A3o+Pereira%2C+87+-+Vila+Pirituba%2C+S%C3%A3o+Paulo+-+SP",
    mapEmbed:
      "https://www.google.com/maps?q=Cl%C3%ADnica+Veter,+Av.+Cabo+Ad%C3%A3o+Pereira,+87+-+Vila+Pirituba,+S%C3%A3o+Paulo+-+SP,+02936-010&output=embed",
    /* Troque pelo link oficial do perfil no Google (botão "Compartilhar"
       no Google Maps) assim que ele for confirmado. */
    googleReviews:
      "https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica+Veter%2C+Av.+Cabo+Ad%C3%A3o+Pereira%2C+87+-+Vila+Pirituba%2C+S%C3%A3o+Paulo+-+SP"
  },

  rating: {
    value: "4,7",
    count: 481,
    source: "Google"
  },

  /* Horários. "open"/"close" no formato "HH:MM"; deixe null enquanto o
     horário daquele dia não for confirmado ("A confirmar").
     Para dia fechado, use closed: true.
     "dow" segue o JavaScript: 0 = domingo … 6 = sábado. */
  hours: [
    { dow: 1, day: "Segunda-feira", open: null, close: null },
    { dow: 2, day: "Terça-feira", open: null, close: null },
    { dow: 3, day: "Quarta-feira", open: null, close: null },
    { dow: 4, day: "Quinta-feira", open: null, close: null },
    { dow: 5, day: "Sexta-feira", open: null, close: null },
    { dow: 6, day: "Sábado", open: null, close: null },
    { dow: 0, day: "Domingo", open: null, close: null }
  ],

  /* Informação de horário já conhecida, exibida enquanto a tabela acima
     não estiver completa. Deixe "" para ocultar. */
  hoursNote: "Horário de fechamento informado: até as 22h.",

  /* Avisos de feriados ou alterações excepcionais. Aparecem no topo do
     card de horários entre as datas "from" e "until" (AAAA-MM-DD).
     Exemplo:
     { text: "Feriado de Natal: fechado em 25/12.", from: "2026-12-20", until: "2026-12-25" } */
  notices: [],

  /* Serviços — exiba apenas os confirmados pela clínica.
     "active: false" esconde o serviço sem apagá-lo.
     Ícones disponíveis: stethoscope, clipboard, scalpel, shield, heart, leaf, paw */
  services: [
    {
      active: true,
      icon: "stethoscope",
      title: "Consultas veterinárias",
      description: "Atendimento clínico para cães e gatos, com tempo para ouvir o tutor e examinar o paciente com atenção."
    },
    {
      active: true,
      icon: "clipboard",
      title: "Avaliação clínica e diagnóstico",
      description: "Exame cuidadoso dos sinais apresentados pelo pet e orientação clara sobre os próximos passos."
    },
    {
      active: true,
      icon: "scalpel",
      title: "Cirurgias veterinárias",
      description: "Procedimentos realizados com responsabilidade, explicação prévia ao tutor e acompanhamento da equipe."
    },
    {
      active: true,
      icon: "shield",
      title: "Castração",
      description: "Orientação sobre o momento adequado, o preparo e os cuidados no pós-operatório."
    },
    {
      active: true,
      icon: "heart",
      title: "Acompanhamento da saúde",
      description: "Acompanhamento de cães e gatos ao longo das fases da vida, do filhote ao idoso."
    },
    {
      active: true,
      icon: "leaf",
      title: "Orientações preventivas",
      description: "Conversa franca sobre rotina, alimentação e cuidados que contribuem para a saúde do seu pet."
    }
  ],

  /* Equipe. "photo" aceita um arquivo local (ex.: "img/equipe/dr-jorge.webp")
     — use somente fotos reais e autorizadas. Sem foto, o card mostra as
     iniciais. "link" é opcional (ex.: página ou perfil autorizado). */
  team: [
    {
      name: "Dr. Jorge",
      role: "Médico-veterinário",
      initials: "J",
      description:
        "Um dos veterinários mais lembrados nos relatos dos clientes, que destacam a experiência, a atenção e o cuidado em explicar cada procedimento.",
      photo: "",
      link: ""
    },
    {
      name: "Dr. Elton",
      role: "Médico-veterinário",
      initials: "E",
      description:
        "Integrante da equipe veterinária, citado com carinho pelos clientes que acompanham seus pets na clínica.",
      photo: "",
      link: ""
    },
    {
      name: "Regina e equipe",
      role: "Atendimento e acolhimento",
      initials: "R",
      description:
        "O primeiro sorriso na chegada: acolhimento, organização e atenção a tutores e animais em cada etapa da visita.",
      photo: "",
      link: ""
    }
  ],

  /* Avaliações. Revise cada texto com a avaliação original no Google antes
     de publicar. "quote" é usado para trechos literais (entre aspas);
     "summary" para relatos resumidos (exibidos como resumo, sem aspas).
     Use [...] para indicar trechos suprimidos. "showAuthor: false" oculta o nome. */
  testimonials: [
    {
      author: "Aristeia",
      showAuthor: true,
      stars: 5,
      quote:
        "O Dr Jorge e toda sua equipe são maravilhosos! Dr Jorge já o conheço uns 20 anos sempre me tratou e meus pets com muito carinho, explica todo o procedimento [...]",
      highlight: "Confiança construída ao longo dos anos"
    },
    {
      author: "Daphi ny",
      showAuthor: true,
      stars: 5,
      quote:
        "Eu amo a clínica, vou a anos com meus Pets. Sou sempre muito bem atendida. Dr Jorge e Dr Elton são incríveis.",
      highlight: "Atendimento próximo e atencioso"
    },
    {
      author: "Lori Lopes",
      showAuthor: true,
      stars: 5,
      summary:
        "Relata gratidão ao Dr. Jorge, ao Dr. Elton, à Regina e à equipe pelo atendimento durante uma cirurgia complexa.",
      highlight: "Dedicação em um momento delicado"
    },
    {
      author: "Adri Neto",
      showAuthor: true,
      stars: 5,
      summary:
        "Conta que os veterinários identificaram um possível problema cardíaco em sua cadela durante uma consulta.",
      highlight: "Atenção durante a avaliação clínica"
    },
    {
      author: "Rosemeire Fioratti",
      showAuthor: true,
      stars: 5,
      summary:
        "Destaca a competência do Dr. Jorge em um atendimento cirúrgico e a atenção da equipe.",
      highlight: "Cuidado e acompanhamento veterinário"
    }
  ],

  /* Imagens das seções. Enquanto estiverem vazias, o site mostra
     ilustrações próprias. Use somente fotos reais e autorizadas da clínica,
     em arquivos locais (ex.: "img/fotos/hero.webp"), com texto alternativo. */
  images: {
    hero: { src: "", alt: "" },
    about: { src: "", alt: "" },
    care: { src: "", alt: "" },
    cta: { src: "", alt: "" }
  },

  /* Galeria. Categorias: clinica, caes, gatos, equipe, ambiente.
     A seção só aparece quando houver ao menos uma foto. Não publique
     pacientes identificáveis sem autorização dos tutores.
     Exemplo:
     { src: "img/galeria/recepcao.webp", alt: "Recepção da Clínica Veter", category: "clinica", wide: true } */
  gallery: [],

  /* Redes sociais oficiais — o bloco só aparece com perfis confirmados.
     Redes suportadas: instagram, facebook.
     Exemplo: { network: "instagram", url: "https://www.instagram.com/perfil-oficial" } */
  social: []
};
