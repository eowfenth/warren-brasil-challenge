# Warren Brasil Challenge ![License | GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)

<div align="center">Code for Back-end Challenge</div>

### O que é este projeto?

Este projeto é a minha participação no processo seletivo da Warren Brasil. O desafio envolve montar um sistema de conta corrente digital.
Entre as funcionalidades deve constar extrato, depósito, resgate e pagamento (possivelmente transferência);
O prazo dado para termino é de 7 dias.

### O que este projeto possui e não possui em relação ao desejado

-   Este projeto não possui um código front-end para você interagir. No entanto, existe uma collection do `postman` completa com todos os endpoints. Existe uma ordem de execução caso você queira verificar os endpoints de maneira rápida.

A collection está neste [link]().

-   O projeto não possui a funcionalidade de calcular a remuneração da conta corrente.
-   O projeto possui as 4 funcionalidades: depósito de uma conta (`deposit`), pagamento entre contas (`transfer`), resgate (`withdraw`) e obtenção de extrato (`statement`). Além disso, o projeto possui autenticação e também cadastro.
-   O projeto possui documentação de todos os métodos e possui uma documentação gerada, para mais informações leia o restante do readme.
-   O projeto possui `eslint` e `prettier` para manter a base de código consistente.
-   Segredos são salvos em variáveis de ambiente utilizando `dotenv`.
-   O desejado era rodar não só o banco de dados, mas o projeto como um todo em `Docker`. Possivelmente utilizando `Docker Compose`. No momento, existe apenas instruções para rodar o banco de dados utilizando Docker;
-   O projeto foi configurado apenas para ambiente de desenvolvimento. Para uso em produção, alguns `tweaks` terão que ser feitos, por exemplo, lidar com `cors`;
-   A ideia era utilizar a pagar.me para gerar um novo boleto para simular um pagamento e depósito por meio de boletos. Eventualmente utilizar isso como serviço para buscar e escutar alterações no boleto para adicionar seus pagamentos nas contas do usuário. A integração com a pagar.me foi feita mas a funcionalidade não foi finalizada.
-   O projeto, por óbvio, não trata de concorrência de chamadas. Não existe um sistema de filas que proteja de ações concorrentes indevidas;
-   O projeto possui cadastro e autenticação, apesar disso, utiliza `JWT` ao invés de `OAuth`;
-   O projeto utiliza do `Helmet` para mitigar algumas vulnerabilidades;

### O que este projeto utiliza?

Este projeto foi montado utilizando `Typescript`, `Koa`, `Knex` e `Axios`. Os testes foram feitos com `Jest`. A documentação foi gerada com `Typedoc`.

### Como instalar e rodar

Ao baixar este repositório, basta Para instalar, basta digitar no seu terminal `npm ci`.

#### Variáveis de Ambiente

Existem variáveis de ambiente que você precisa preencher. Acesse o arquivo `.env.example`, renomeie-o para `.env` e preencha as variáveis.

Segue uma relação para entendê-las:

| Variável           | Datatype | Descrição                                                               |
| ------------------ | -------- | ----------------------------------------------------------------------- |
| JWT_SECRET=        | string   | String utilizada como segredo para encryptar token de acesso a API      |
| JWT_EXPIRING_TIME= | string   | Tempo de expiração do token de acesso. Formato: '7d' equivale a 7 dias. |
| PAGARME_BASE_URL=  | string   | URL Base para interagir com a Pagar.me                                  |
| PAGARME_API_KEY=   | string   | Chave utilizada para interagir com a Pagar.me                           |
| PORT=              | number   | Porta de utilização da aplicação                                        |
| DB_DATABASE=       | string   | Nome do banco de dados                                                  |
| DB_PASSWORD=       | string   | Senha de Acesso ao banco de dados                                       |
| DB_USERNAME=       | string   | Usuário de Acesso ao banco de dados                                     |
| DB_PORT=           | number   | Porta de acesso ao banco de dados                                       |
| PAGE_SIZE_DEFAULT= | number   | Valor para alterar tamanho da paginação em certas chamadas              |

Para obter sua própria chave da `Pagar.me` e utilizar a funcionalidade `pagamento por boleto`, cadastra-se [aqui](https://beta.dashboard.sandbox.pagar.me/#/account/login);

#### Rodando...

O processo de iniciar o projeto é o seguinte:

1. Iniciar o banco de dados;
2. Instalar dependências back-end;
3. Rodar migrações;
4. Iniciar projeto back-end;

#### Iniciando banco de dados;

Este projeto utiliza `postgres` como banco de dados, sugiro utilizar Docker para isso.

Caso você esteja usando `Docker`, rode os comandos a seguir no seu terminal para iniciar um novo container com `postgres`:

1. `docker run -d -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres`

Para confirmar que está funcionando, digite:

2. `docker container ls | grep postgres`

#### Instalando dependências do back-end:

Para instalar, basta digitar no seu terminal `npm ci`.

#### Migrações:

Para rodar as migrações, preencha as variáveis de ambiente e rode o seguinte comando:

```
    npm run migration:run
```

#### Iniciando o projeto back-end:

Você pode fazer de duas formas:

1. A primeira é utilizando o ts-node sem necessidade de compilar os arquivos .ts.

Para isso, rode: `npm run start`

2. A segunda opção é buildando o projeto. Para isso:

-   Build o projeto com `npm run build`
-   Rode o projeto com `npm run start:build`

### Funcionalidades

-   Cadastro e Autenticação utilizando JWT

    -   Cadastro pode ser utilizado requisitando `POST /auth/sign_up`;
    -   Autenticação pode ser utilizada requisitando `POST /auth/sign_in`;

-   Extrato / histórico da conta

    -   Pode ser utilizado pelo endpoint `GET /wallet/statement`;

-   Pagamento (Transferência entre contas)

    -   Pode ser utilizado pelo endpoint `POST /wallet/transfer`;

-   Deposito

    -   Pode ser utilizado pelo endpoint `POST /wallet/deposit`;

-   Resgate (Saque)
    -   Pode ser utilizado pelo endpoint `POST /wallet/withdraw`;

### Documentação

Você gerar documentação do projeto utilizando o comando `npm run typedoc:run` e então acessar a documentação gerada pelo `Typedoc`, na arquivo `docs/index.html`;

### Fluxo da Aplicação

Espere o seguinte fluxo para experimentação de todas as funcionalidades da aplicação:

1. Criação de um usuário;
2. Autenticação deste usuário e obtenção do `token de acesso`;
3. Utilizando do `token de acesso` para fazer todas as requisições a seguir;
4. Criar um novo deposito;
5. Obter extrato;
6. Criar um novo resgate;
7. Obter extrato;
8. Repetir passos (1) e (2);
9. Criar uma transferência de um usuário para outro;
10. Verificar extratos de ambos os usuários;
