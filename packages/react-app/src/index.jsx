import React from 'react'
import ReactDOM from 'react-dom'
import {
  ApolloClient, ApolloProvider, InMemoryCache,
} from '@apollo/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'

const subgraphUri = 'https://api.thegraph.com/subgraphs/name/0xorg/eip1155-subgraph-rinkeby'

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
})

ReactDOM.render(
  <ApolloProvider {...{ client }}>
    <ChakraProvider>
      <App/>
    </ChakraProvider>
  </ApolloProvider>,
  document.getElementById('root'),
)