import process from "child_process";
export function execShellCommand(cmd: string, cwd?: string) {
  const exec = process.exec;
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        cwd: cwd,
      },
      (error, stdout, stderr) => {
        if (error) {
          console.warn(error);
        }
        resolve(stdout ? stdout : stderr);
      }
    );
  });
}
//bundle node index file
const command = "./src/index.ts";
const outPath = "./dist";
execShellCommand(
  `npx esbuild ${command} --bundle --platform=node --outdir=${outPath}`,
  __dirname
);
