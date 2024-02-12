import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './router';

export const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
    }),
  ],
});

client.getBooks.query().then((books) => {
  console.log(books);
});
