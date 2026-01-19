## Regras do projeto

- Priorize sempre a implementacao seguindo a documentacao e os padroes do NestJS.
- Use Controllers apenas para orquestrar requests/responses e Services para regras de negocio.
- Evite valores hardcoded; prefira configuracao via env ou parametros explicitos.
- Valide entradas com Pipes/DTOs (ex.: `ParseIntPipe`, `class-validator`).
- Trate erros com excecoes do NestJS (`HttpException`, `InternalServerErrorException`, etc.).
- Organize por modulo (Controller, Service, Module, DTOs e Specs no mesmo dominio).
- Documente rotas com Swagger (`@nestjs/swagger`) e mantenha exemplos atualizados.
- Mantenha padrao de estilo consistente com ESLint/Prettier do projeto.
- Adicione testes basicos quando alterar comportamentos relevantes.
