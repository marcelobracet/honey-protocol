# Truque do Mel 🍯 · Honey Protocol

Produto digital vendido por tráfego pago: **landing page de vendas → checkout → acesso automático ao app** de ritual matinal (mel, chá verde, canela e gengibre). Um único projeto Next.js serve 6 idiomas.

O checkout é o **KashPay**, que cobra pela sua própria conta **Stripe**. Por isso quem manda no acesso é o webhook do Stripe, e não o da plataforma de checkout: a documentação é pública, a assinatura é verificável e o comportamento não muda se você trocar de front-end de checkout. O webhook da Hotmart continua no projeto e pode rodar em paralelo, caso você também venda lá.

| Rota | O que é |
| --- | --- |
| `/{locale}` | Landing page de vendas (pt, en, es, fr, it, de) |
| `/{locale}/vsl` | Página de VSL com botão de compra que aparece após X segundos |
| `/{locale}/thank-you` | Página de obrigado pós-compra: passos, reenvio de link, evento Purchase deduplicado |
| `/{locale}/login` | Entrada por link mágico (sem senha) |
| `/{locale}/app` | O app (exige compra ativa) |
| `/{locale}/account` | Minha conta: idioma, lembretes, exportar e excluir dados (LGPD) |
| `/{locale}/legal/{terms,privacy,refund}` | Termos, privacidade, reembolso |
| `/{locale}/support` | Suporte |
| `/api/checkout/return` | Retorno do checkout: confere a sessão no Stripe, libera e **já loga o comprador** |
| `/api/webhooks/stripe` | Webhook Stripe (KashPay): libera e revoga acesso |
| `/api/webhooks/hotmart` | Webhook Hotmart: idem, para vendas na Hotmart |
| `/api/cron/reminders` | Cron horário: lembrete matinal + sequência de e-mails dos 7 primeiros dias |

## Stack

- **Next.js 16** (App Router, React 19, Turbopack), **Tailwind 4**, **Framer Motion**
- **Postgres** (Neon na Vercel ou qualquer Postgres) via `postgres` (postgres.js), migrações em `db/migrations`
- **Autenticação própria**: link mágico de uso único (hash no banco) + sessão JWT (`jose`) em cookie httpOnly
- **Resend** para e-mails transacionais (boas-vindas, link de acesso, lembrete)
- **KashPay + Stripe** para checkout e liberação de acesso (Hotmart opcional, em paralelo)
- **Meta Pixel** e **GA4** (só após consentimento) + **Conversions API** (Purchase server-side)
- **Back redirect** opcional na landing e na VSL (`BACK_REDIRECT_URL`, com override por idioma)
- **Barra fixa de CTA** no celular e **exit intent** no desktop (uma vez por sessão)
- **Sequência de onboarding** por e-mail nos dias 1, 2, 3, 5 e 6 após a compra (`email_log` garante envio único; respeita o toggle de lembretes)

## Fluxo do comprador

1. Tráfego cai na landing (`/pt`, `/en`…) com `utm_*`. Os UTMs ficam na sessão e vão para o link do checkout, junto com o idioma (`lang={locale}`, ou `xcod` no modo Hotmart).
2. Pagamento aprovado → o comprador volta para `/api/checkout/return?session_id={CHECKOUT_SESSION_ID}`, que confere a sessão direto no Stripe, libera o acesso e **cria a sessão ali mesmo**. Ele cai na página de obrigado já logado, com um botão para o app.
3. Em paralelo, `checkout.session.completed` chega no webhook e libera o acesso de novo (é idempotente), cobrindo quem fechou a aba antes de voltar. O e-mail de boas-vindas com link mágico é enviado se houver provedor configurado, e falhar nele não derruba o evento.
4. Quem perdeu a sessão entra por `/{locale}/auth/confirm?token=…`, que envia o token por POST para scanners de e-mail não queimarem o link.
5. Reembolso total ou chargeback → webhook revoga o acesso; o app mostra a tela "acesso indisponível". Reembolso parcial não revoga, e disputa ganha devolve o acesso.
6. Para entrar depois: `/login` com o e-mail da compra → novo link. A resposta é a mesma para e-mails sem compra (não vaza quem é cliente).

### E-mail não está no caminho crítico

O acesso é entregue na volta do checkout, sem depender de e-mail. Isso importa porque **enviar e-mail exige um domínio próprio**: nenhum provedor sério entrega para terceiros a partir de um domínio que não é seu, e endereços `@gmail.com` ou `@outlook.com` como remetente são rejeitados ou vão para spam desde as regras de autenticação de 2024. O Resend, sem domínio verificado, só entrega para o dono da conta.

Enquanto não houver domínio, o comprador entra pela página de retorno e continua dentro: a sessão dura 30 dias e **se renova sozinha** a cada visita passada a metade do prazo, então quem usa o app nunca é deslogado. Vale sugerir adicionar à tela inicial, que é o que a página de obrigado faz.

O que ainda precisa de e-mail, e portanto de domínio: entrar de outro aparelho, o lembrete matinal e a sequência de onboarding.

### Como o idioma do comprador é descoberto

Em ordem: metadados da sessão do Stripe (`lang`, `locale`, `language`, `idioma` ou `xcod`, que o KashPay repassa a partir da query do checkout) → idioma configurado no Stripe Checkout → país da cobrança → inglês.

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # preencha DATABASE_URL e SESSION_SECRET no mínimo
npm run db:migrate                 # opcional: o build já faz isso
npm run dev
```

Sem `RESEND_API_KEY`, os e-mails (com o link mágico) são impressos no terminal do `next dev`. Para testar o acesso sem Hotmart, insira uma compra à mão:

```sql
insert into entitlements (email, status, locale) values ('voce@exemplo.com', 'active', 'pt');
```

Depois use `/pt/login` com esse e-mail e copie o link do terminal.

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. **Storage → Neon → Connect** (cria `DATABASE_URL`). As migrações rodam sozinhas: `npm run build` executa `db:migrate` antes do `next build`, então o primeiro deploy depois de conectar o banco já cria as tabelas. Sem `DATABASE_URL` o passo é pulado e o build passa normalmente. Um *advisory lock* impede que dois deploys simultâneos apliquem a mesma migração.
3. Environment Variables: tudo de `.env.local.example`. Obrigatórios: `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CHECKOUT_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `NEXT_PUBLIC_SUPPORT_EMAIL`, dados da empresa.
4. **Stripe** → Dashboard → Webhooks → criar destino apontando para `https://seu-dominio/api/webhooks/stripe`, assinando `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created` e `charge.dispute.closed`. Copie o segredo `whsec_…` para `STRIPE_WEBHOOK_SECRET`.
5. **KashPay** → conecte a mesma conta Stripe, cole o link do checkout em `CHECKOUT_URL` e aponte a página de retorno para `https://seu-dominio/api/checkout/return?session_id={CHECKOUT_SESSION_ID}`. É esse `session_id` que permite logar o comprador na hora; sem ele a página de obrigado cai no fluxo de e-mail. Confirme também se o KashPay repassa os parâmetros da query para os metadados da sessão do Stripe; se não repassar, o idioma cai para o país da cobrança.
6. *(Opcional)* Hotmart → Ferramentas → Webhook (versão 2.0): URL `https://seu-dominio/api/webhooks/hotmart`, eventos de compra (aprovada, completa, reembolsada, chargeback, cancelada, protesto, expirada). Copie o **hottok** para `HOTMART_HOTTOK` e defina `NEXT_PUBLIC_CHECKOUT_LOCALE_PARAM=xcod`.
7. Resend: verifique o domínio do `EMAIL_FROM` (SPF/DKIM) para não cair em spam.
8. O cron está em `vercel.json`. Contas **Hobby** só permitem um disparo por dia, então ele roda às 10:00 UTC e a janela de envio local é ampla (`REMINDER_LOCAL_HOURS=5-21`), para alcançar vários fusos sem acordar ninguém. No plano **Pro**, troque a expressão para `0 * * * *` e defina `REMINDER_LOCAL_HOURS=7-8` para entregar na hora do café da manhã em cada fuso.

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
  app/api/             webhooks Stripe e Hotmart, export de dados, cron de lembretes
  app/icons/[size]     ícones PNG gerados (PWA / Apple)
  components/landing/  seções da página de vendas, botão de checkout, mock do app
  components/app/      telas do app (onboarding, receita, home, em breve), jarro, nav
  i18n/                config de locales, tipos e dicionários
  lib/                 db, auth (sessão + tokens), acesso (grant/revoke/magic link), stripe, hotmart, e-mail, consent, tracking
  proxy.ts             redirect de locale + gate otimista das rotas protegidas
db/migrations/         SQL aplicado por `npm run db:migrate`
```
