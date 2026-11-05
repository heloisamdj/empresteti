# Segredos e configuração
> leitor: agente

## Quando
Ao tocar em .env, configuração, autenticação ou código cliente.

## Procedimento
1. Registre só nomes e exemplos sem credenciais em .env.example.
2. Mantenha .env e .env.local ignorados; nunca imprima seus valores.
3. URL e chave anônima são públicas; service_role e conexões PostgreSQL são segredos.
4. Autenticação do app acontece no servidor por tRPC; nenhum token é retornado ao navegador como dado do procedimento.
5. `npm run check:supabase` confere configuração sem gravar nem exibir credenciais.
6. Configuração remota de Vercel/Supabase deve ser registrada como pendência externa quando não houver acesso autorizado.

## Verificação
Nenhum segredo no diff, bundle ou arquivo rastreado; cookies de sessão httpOnly.

## Não faça
- Não use service_role no cliente, nem prefixo NEXT_PUBLIC_ em segredo.
- Não guarde sessão em localStorage/sessionStorage.
