export { default as Transactor } from "./Transactor";

export const httpURL = (uri) => {
  if(!uri?.match) return undefined
  
  const match = uri.match(/^(ip[nf]s):\/\/(.+)$/)
  if(!match) {
    return uri
  } else {
    return `https://ipfs.io/${match[1]}/${match[2]}`
  }
}

export const capitalize = (str) => {
  if(!str?.split) return str
  return (
    str.trim().split(/\s+/g)
    .map((sub) => (`${
      sub[0]?.toUpperCase() ?? ''
    }${
      sub.substring(1)?.toLowerCase() ?? ''
    }`))
    .join(' ')
  )
}