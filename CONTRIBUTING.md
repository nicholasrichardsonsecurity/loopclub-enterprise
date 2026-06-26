# Contribuindo com o LoopClub Enterprise

Obrigado por contribuir! Este documento define as regras e boas práticas para manter a qualidade e consistência do projeto.

## Política de Documentação Viva

A documentação é parte integrante do código. Toda alteração deve mantê-la atualizada.

1. **Toda nova funcionalidade** deve atualizar a documentação correspondente.
2. **Toda mudança no banco** deve atualizar [DATABASE.md](docs/DATABASE.md).
3. **Todo endpoint criado ou alterado** deve atualizar [API.md](docs/API.md).
4. **Toda decisão arquitetural** deve atualizar [DECISIONS.md](docs/DECISIONS.md).
5. **Toda entrega** deve atualizar [STATUS.md](docs/STATUS.md) e [CHANGELOG.md](CHANGELOG.md).
6. **Toda sprint** deve possuir arquivo em [docs/sprints/](docs/sprints/).
7. **Nenhum segredo** deve ser documentado ou versionado.
8. **O README** deve permanecer resumido; detalhes ficam em `docs/`.

## Fluxo de contribuição

1. Crie uma branch a partir de `main` com nome descritivo:
   - `feature/nome-da-feature`
   - `fix/nome-do-fix`
   - `docs/nome-da-doc`
2. Faça as alterações seguindo os padrões do projeto.
3. Atualize a documentação conforme a política acima.
4. Verifique se o código compila e os testes passam.
5. Revise se não há segredos ou `.env` incluídos.
6. Abra um Pull Request descritivo.

## Checklist obrigatório antes de finalizar uma tarefa

- [ ] Código compilando sem erros
- [ ] Testes executados (se existentes)
- [ ] API.md atualizada (se houver mudanças em endpoints)
- [ ] DATABASE.md atualizada (se houver mudanças no schema)
- [ ] STATUS.md atualizado
- [ ] CHANGELOG.md atualizado
- [ ] Sprint atual atualizada (docs/sprints/)
- [ ] Nenhum segredo incluído
- [ ] `git status` revisado antes do commit

## Padrões de código

- **Backend:** NestJS modular, controllers enxutos, services com lógica de negócio
- **Mobile:** Flutter com arquitetura feature-first
- **Admin Web:** Next.js com componentes funcionais
- **Commits:** Mensagens em português ou inglês, descritivas e no imperativo

## Variáveis de ambiente

- Use apenas `.env.example` com valores fictícios
- Nunca versionar `.env` ou arquivos com credenciais reais
- Ao adicionar nova variável, atualize `.env.example` e a documentação de instalação
