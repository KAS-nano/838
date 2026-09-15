import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const extensions = [".ts", ".tsx", ".js", ".mjs"];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const parentPath = fileURLToPath(context.parentURL);
    if (parentPath.endsWith(".ts") || parentPath.endsWith(".tsx")) {
      for (const extension of extensions) {
        try {
          const candidate = pathToFileURL(path.resolve(path.dirname(parentPath), `${specifier}${extension}`)).href;
          return await nextResolve(candidate, context);
        } catch {
          // Continue with Node's normal resolver when no candidate exists.
        }
      }
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    return nextLoad(url, context);
  }
  return nextLoad(url, context);
}
