# Truque do Mel 🍯 · Honey Protocol

Produto digital vendido por tráfego pago: **landing page de vendas → checkout Hotmart → acesso automático ao app** de ritual matinal (mel, chá verde, canela e gengibre). Um único projeto Next.js serve 6 idiomas.

| Rota | O que é |
| --- | --- |
| `/{locale}` | Landing page de vendas (pt, en, es, fr, it, de) |
| `/{locale}/vsl` | Página de VSL com botão de compra que aparece após X segundos |
| `/{locale}/thank-you` | Página de obrigado da Hotmart: passos, reenvio de link, evento Purchase deduplicado |
| `/{locale}/login` | Entrada por link mágico (sem senha) |
| `/{locale}/app` | O app (exige compra ativa) |
| `/{locale}/account` | Minha conta: idioma, lembretes, exportar e excluir dados (LGPD) |
| `/{locale}/legal/{terms,privacy,refund}` | Termos, privacidade, reembolso |
| `/{locale}/support` | Suporte |
| `/api/webhooks/hotmart` | Webhook Hotmart: libera/revoga acesso |
| `/api/cron/reminders` | Cron horário: lembrete matinal + sequência de e-mails dos 7 primeiros dias |

## Stack

- **Next.js 16** (App Router, React 19, Turbopack), **Tailwind 4**, **Framer Motion**
- **Postgres** (Neon na Vercel ou qualquer Postgres) via `postgres` (postgres.js), migrações em `db/migrations`
- **Autenticação própria**: link mágico de uso único (hash no banco) + sessão JWT (`jose`) em cookie httpOnly
- **Resend** para e-mails transacionais (boas-vindas, link de acesso, lembrete)
- **Hotmart** para checkout e webhook
- **Meta Pixel** e **GA4** (só após consentimento) + **Conversions API** (Purchase server-side)
- **Back redirect** opcional na landing e na VSL (`BACK_REDIRECT_URL`, com override por idioma)
- **Barra fixa de CTA** no celular e **exit intent** no desktop (uma vez por sessão)
- **Sequência de onboarding** por e-mail nos dias 1, 2, 3, 5 e 6 após a compra (`email_log` garante envio único; respeita o toggle de lembretes)

## Fluxo do comprador

1. Tráfego cai na landing (`/pt`, `/en`…) com `utm_*`. Os UTMs ficam na sessão e vão para o link do checkout (`src`, `sck`, `xcod={locale}`).
2. Hotmart aprova a compra → `PURCHASE_APPROVED` no webhook → cria/ativa `entitlements` e envia **e-mail de boas-vindas com link mágico** no idioma do comprador (`xcod` ou país do checkout).
3. Comprador clica → `/{locale}/auth/confirm?token=…` → a página envia o token por POST (evita que scanners de e-mail queimem o link) → sessão criada → `/app`.
4. Reembolso/chargeback/cancelamento → webhook revoga o acesso; o app mostra a tela "acesso indisponível".
5. Para entrar depois: `/login` com o e-mail da compra → novo link. A resposta é a mesma para e-mails sem compra (não vaza quem é cliente).

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # preencha DATABASE_URL e SESSION_SECRET no mínimo
npm run db:migrate
npm run dev
```

Sem `RESEND_API_KEY`, os e-mails (com o link mágico) são impressos no terminal do `next dev`. Para testar o acesso sem Hotmart, insira uma compra à mão:

```sql
insert into entitlements (email, status, locale) values ('voce@exemplo.com', 'active', 'pt');
```

Depois use `/pt/login` com esse e-mail e copie o link do terminal.

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. **Storage → Neon → Connect** (cria `DATABASE_URL`). Rode `npm run db:migrate` localmente apontando para essa URL (ou use a URL no seu CI).
3. Environment Variables: tudo de `.env.local.example`. Obrigatórios: `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `SESSION_SECRET`, `HOTMART_HOTTOK`, `CHECKOUT_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `NEXT_PUBLIC_SUPPORT_EMAIL`, dados da empresa.
4. Hotmart → Ferramentas → Webhook (versão 2.0): URL `https://seu-dominio/api/webhooks/hotmart`, eventos de compra (aprovada, completa, reembolsada, chargeback, cancelada, protesto, expirada). Copie o **hottok** para `HOTMART_HOTTOK`.
5. Resend: verifique o domínio do `EMAIL_FROM` (SPF/DKIM) para não cair em spam.
6. O cron de lembretes já está em `vercel.json` (a cada hora; envia entre 7h e 9h no fuso do usuário).

### Um checkout por país

`CHECKOUT_URL` é o padrão. `CHECKOUT_URL_EN`, `CHECKOUT_URL_ES`… apontam para ofertas diferentes (moeda/idioma do checkout). O mesmo vale para `PRICE_XX` (texto do preço na página) e `ANCHOR_PRICE_XX` (preço riscado).

## Idiomas

Textos ficam em `src/i18n/dictionaries/{pt,en,es,fr,it,de}.ts`, tipados por `src/i18n/types.ts`. Para adicionar um idioma: crie o dicionário, adicione a sigla em `src/i18n/config.ts` e em `get-dictionary.ts`. O nome da marca é localizado por mercado (The Honey Trick, El Truco de la Miel…).

A seção de depoimentos fica oculta enquanto `landing.testimonials.items` estiver vazio. **Não invente depoimentos nem números**: preencha só com relatos reais e autorizados.

## LGPD / GDPR

- Política de privacidade, termos e reembolso por idioma, com controlador, bases legais, retenção, direitos e contato do encarregado.
- Banner de cookies: Pixel só carrega após aceite; recusar é tão fácil quanto aceitar.
- Registro de consentimento em `consents` (termos no primeiro login, lembretes ao ligar/desligar).
- Portabilidade: `/api/account/export` (JSON). Exclusão: página Minha conta (apaga usuário e histórico; o registro de compra fica pelo prazo legal, como diz a política).
- Dados mínimos: e-mail, nome (da Hotmart), idioma, fuso e dias de ritual. Sem senhas.

## Estrutura

```
src/
  app/[locale]/        layout raiz, landing, login, auth/confirm, app, account, legal, support
  app/api/             webhook Hotmart, export de dados, cron de lembretes
  app/icons/[size]     ícones PNG gerados (PWA / Apple)
  components/landing/  seções da página de vendas, botão de checkout, mock do app
  components/app/      telas do app (onboarding, receita, home, em breve), jarro, nav
  i18n/                config de locales, tipos e dicionários
  lib/                 db, auth (sessão + tokens), acesso (grant/revoke/magic link), hotmart, e-mail, consent, tracking
  proxy.ts             redirect de locale + gate otimista das rotas protegidas
db/migrations/         SQL aplicado por `npm run db:migrate`
```
