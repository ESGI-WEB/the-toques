This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

copy .env.local.example to .env.local and fill it with your own values
```bash
cp .env.local.example .env.local
```

First, build the docker image:
```bash
docker compose build
```
    
Then, run the container:
```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Prisma

This project uses [Prisma](https://www.prisma.io/) to manage the database. You can find the schema in `prisma/schema.prisma`.

To generate the Prisma client, run:
```bash
docker exec the-toques-next-1 npx prisma generate
```

To generate the database by already created migrations, run:
```bash
docker exec the-toques-next-1 npx prisma migrate deploy
```

To create migration + update the database, run:
```bash
docker exec the-toques-next-1 npx prisma migrate dev --name <fill_migration_name>
```

To create a migration without updating database, run:
```bash
docker exec the-toques-next-1 npx prisma migrate dev --name <fill_migration_name> --create-only
```

