import React from "react"
import ReactDOM from "react-dom"
import {
  ApolloClient, ApolloProvider, InMemoryCache,
} from "@apollo/client"
import "./index.css"
import App from "./App"
import { ChakraProvider } from "@chakra-ui/react"
import { ThemeSwitcherProvider } from "react-css-theme-switcher"

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
}

const prevTheme = window.localStorage.getItem("theme")

// let subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract"
const subgraphUri = "https://api.thegraph.com/subgraphs/name/0xorg/eip1155-subgraph-rinkeby"

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <ChakraProvider>
      <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme ? prevTheme : "light"}>
        <App subgraphUri={subgraphUri}/>
      </ThemeSwitcherProvider>
    </ChakraProvider>
  </ApolloProvider>,
  document.getElementById("root"),
)