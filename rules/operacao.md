# Operação
> leitor: agente e operador humano

## Quando
Durante qualquer tarefa do projeto.

## Procedimento
1. Execute mudanças locais solicitadas em etapas, com checks e evidências CA-xx.
2. O agente prepara o diff; commits, push e publicação ficam com a pessoa responsável.
3. Dependências técnicas seguem ADR-001; escolha arquitetural nova exige decisão do time.
4. Banco de desenvolvimento é local. Consultas de conectividade externas só quando pedidas, sem gravação.
5. Operador: reserve raciocínio cuidadoso para spec, plano e diagnóstico; use contexto independente na verificação final.

## Verificação
Diff revisável, comandos reais registrados e nenhuma ação remota não autorizada.

## Não faça
- Não confunda permissão para executar a tarefa com autorização para publicar.
- Não declare uma spec pronta sem o verificador exigido em spec-flow.md.
