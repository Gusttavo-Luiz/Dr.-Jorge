# Clínica Veter — site institucional

Site estático (HTML, CSS e JavaScript puro, sem dependências nem etapa de build) da Clínica Veter, clínica veterinária em Vila Pirituba, São Paulo — SP.

Endereço público (após ativar o GitHub Pages): https://gusttavo-luiz.github.io/Dr.-Jorge/

## Estrutura

```
index.html          Página principal: estrutura, textos fixos, SEO e dados estruturados (VeterinaryCare)
privacidade.html    Política de privacidade (LGPD)
404.html            Página de erro do GitHub Pages
admin.html          Painel simples para editar o conteúdo e gerar um novo js/content.js
css/styles.css      Identidade visual, layout responsivo e animações
css/admin.css       Estilos do painel
js/content.js       Conteúdo editável: contatos, WhatsApp, horários, avisos, serviços, equipe, avaliações, fotos
js/main.js          Monta as seções dinâmicas, menu mobile, formulário, mapa, galeria e indicador de horário
js/admin.js         Lógica do painel
fonts/              Fonte Manrope hospedada no próprio site (sem requisições ao Google Fonts)
img/                Logotipo, favicon, ilustrações e imagem de compartilhamento (og-image.png)
robots.txt, sitemap.xml
```

## Antes de publicar — confirmar com a clínica

O site não inventa nenhuma informação. Estes pontos dependem de confirmação:

1. **WhatsApp** — o número (11) 3975-5822 está configurado como WhatsApp (`whatsapp.enabled: true`). Se ele **não** tiver WhatsApp, mude para `false` em `js/content.js`: todos os botões passam a ligar para a clínica e o formulário orienta o contato por telefone.
2. **Horários** — só o fechamento às 22h foi informado. Os dias aparecem como “A confirmar” até serem preenchidos em `hours`. Com o horário do dia preenchido, aparece o indicador “Aberto agora / Fechado agora”.
3. **Serviços** — os seis cards seguem o briefing, mas precisam ser confirmados. Use `active: false` para esconder um serviço sem apagá-lo.
4. **Avaliações** — confira cada texto com a avaliação original no Google. Os relatos 1 e 2 são trechos literais (entre aspas); os relatos 3 a 5 aparecem como **resumo**, sem aspas, porque o texto original não foi fornecido. Quando tiver os textos exatos, troque `summary` por `quote`.
5. **Link do Google** — os botões “Ver avaliações no Google” e “Ver no Google Maps” fazem uma busca pelo nome e endereço da clínica. Troque `links.googleReviews` e `links.maps` pelo link oficial do perfil (Google Maps → Compartilhar) assim que ele for confirmado.
6. **Fotos** — não há fotos reais ainda, então o site usa ilustrações próprias (não fotos genéricas apresentadas como reais). Os cards da equipe mostram as iniciais. A galeria fica oculta até que existam fotos.
7. **Redes sociais** — o bloco só aparece quando houver perfis oficiais em `social`.

## Como atualizar o conteúdo

### Pelo painel (`admin.html`)

Abra `https://gusttavo-luiz.github.io/Dr.-Jorge/admin.html`, edite os campos e clique em **Pré-visualizar no site** para conferir. Quando estiver tudo certo, clique em **Baixar content.js** e substitua o arquivo `js/content.js` do repositório pelo arquivo baixado (no GitHub: abra `js/content.js` → ícone de lápis → cole o conteúdo → *Commit changes*). O site é atualizado em alguns minutos.

O painel não publica nada sozinho e não guarda senhas: o rascunho fica só no navegador de quem está editando. Por isso ele pode ficar público sem risco (está marcado como `noindex`).

### À mão (`js/content.js`)

- **Horários**: lista `hours`. Use `"HH:MM"` em `open`/`close`, ou `closed: true` para dia fechado.
- **Feriados e avisos**: lista `notices`, com `from`/`until` no formato `AAAA-MM-DD`.
- **Serviços**: lista `services` (`active`, `icon`, `title`, `description`).
- **Equipe**: lista `team`. Coloque fotos reais e autorizadas em `img/` (ex.: `img/equipe/dr-jorge.webp`) e informe o caminho em `photo`.
- **Avaliações**: `rating` (nota e total) e lista `testimonials`.
- **Fotos das seções**: `images.hero`, `images.about`, `images.care`, `images.cta` (sem foto, aparece a ilustração).
- **Galeria**: lista `gallery` com `src`, `alt`, `category` (`clinica`, `caes`, `gatos`, `equipe`, `ambiente`) e, opcionalmente, `wide`/`tall`. Não publique pacientes identificáveis sem autorização dos tutores.

Use imagens otimizadas (WebP, até ~1600 px no lado maior).

## Publicação (GitHub Pages)

Em **Settings → Pages**, escolha **Deploy from a branch**, a branch principal do repositório (ex.: `main`) e a pasta `/ (root)`. O GitHub Pages já serve o site com HTTPS.

Se a clínica passar a usar um domínio próprio, atualize o endereço em: `index.html` (canonical, Open Graph e dados estruturados), `privacidade.html` (canonical), `sitemap.xml`, `robots.txt`, `js/content.js` (`siteUrl`) e os caminhos absolutos `/Dr.-Jorge/` do `404.html` (passam a ser `/`). O `robots.txt` só é lido pelos buscadores quando o site está na raiz de um domínio.

## Privacidade e desempenho

- Sem cookies próprios, sem ferramentas de análise e sem fontes externas.
- O Google Maps só carrega quando o visitante clica em “Carregar mapa” (com aviso sobre cookies do Google).
- O formulário não envia dados a nenhum servidor: ele monta a mensagem e abre o WhatsApp. A solicitação só é enviada se o visitante tocar em enviar, e o site deixa claro que o horário depende da confirmação da clínica.

## Como visualizar localmente

```
python3 -m http.server 8000
```

Depois acesse http://localhost:8000.
