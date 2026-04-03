import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { createClient } from "@/lib/supabase/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let apolloClient: ApolloClient | null = null;

function createApolloClient() {
  const httpLink = new HttpLink({
    uri: `${supabaseUrl}/graphql/v1`,
  });

  const authLink = setContext(async (_, { headers }) => {
    // Try to get the user's session token
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token ?? supabaseAnonKey;

    return {
      headers: {
        ...headers,
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
    };
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}

export function getApolloClient() {
  if (!apolloClient) {
    apolloClient = createApolloClient();
  }
  return apolloClient;
}

/** Reset the client (call on sign-out to clear cached data) */
export function resetApolloClient() {
  if (apolloClient) {
    apolloClient.clearStore();
    apolloClient = null;
  }
}
