import path from "path"
import nodeExternals from "webpack-node-externals"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

console.log("mode", process.env.WEBPACK_MODE)
const exports = {
  mode: process.env.WEBPACK_MODE || "development",
  entry: "./functions/src/index",
  target: "node16",
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            ["@babel/preset-env"],
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-transform-runtime",
          ],
        },
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: ["css-loader", "postcss-loader"],
      },
      {
        test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        exclude: /node_modules/,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  experiments: {
    outputModule: true,
  },
  externals: [nodeExternals({ importType: "module" }), "url"],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "module", // <-- Important
    chunkFormat: "module",
  },
}

export default exports
