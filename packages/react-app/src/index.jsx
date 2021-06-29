import React from 'react'
import ReactDOM from 'react-dom'
import {
  ApolloClient, ApolloProvider, InMemoryCache,
} from '@apollo/client'
import {
  ChakraProvider, extendTheme, ColorModeScript,
} from '@chakra-ui/react'
import App from './App'

const subgraphUri = (
  'https://api.thegraph.com/subgraphs/name/0xorg/eip1155-subgraph-rinkeby'
)

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
})

const config = {
  useSystemColorMode: false,
  initialColorMode: 'dark',
}

const theme = extendTheme({ config })
  // styles: {
  //   global: {
  //     // body: {
  //     //   bg: 'red',
  //     //   color: "white",
  //     // },
  //   },
  // },
// })

ReactDOM.render(
  <ApolloProvider {...{ client }}>
    <ChakraProvider {...{ theme }}>
      <ColorModeScript
        initialColorMode={theme.config.initialColorMode}
      />
      <App/>
    </ChakraProvider>
  </ApolloProvider>,
  document.getElementById('root'),
)