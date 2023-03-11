import * as ModuleAlias from "module-alias"
import * as url from "url"
const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

ModuleAlias.addAliases({
  "@": __dirname + "/../",
})
