import * as core from "@actions/core";
import mv from "mv";
import * as fs from "fs";
import * as path from "path";
import util from "util";
const fsPromises = fs.promises;
const mvPromise = util.promisify(mv);
const findRootPackageJson = (startDirectory: string): string => {
  const packagePath = path.join(startDirectory, "./package.json");
  if (fs.existsSync(packagePath)) return startDirectory;
  const pathAbove = path.join(startDirectory, "..");
  return findRootPackageJson(pathAbove);
};
const moveFile = async ({
  fileName = "",
  directoryStart = "",
  directoryDes = "",
  extension = "env",
}: {
  fileName: string;
  directoryStart: string;
  directoryDes: string;
  extension: string;
}) => {
  let curr_path = path.join(directoryStart, `${fileName}.${extension}`);
  let destination_folder = directoryDes;
  let destination = path.join(destination_folder, `${fileName}.${extension}`);
  //create folder if it doesnt exist
  if (!fs.existsSync(destination_folder)) {
    await fsPromises.mkdir(destination_folder);
  }
  //move file
  await mvPromise(curr_path, destination);
};

const createEnv = async ({
  customName,
  inputs,
}: {
  customName: string;
  inputs: string;
}) => {
  const fileName = customName ? customName : "";
  const secretsParse = JSON.parse(inputs) as { [key: string]: string };
  const reactAppSecrets = Object.entries(secretsParse).filter(([key, value]) =>
    /REACT_APP.*/.test(key)
  );
  const envValues: {
    [key: string]: string;
  } = {};
  for (let [key, value] of reactAppSecrets) envValues[key] = value;
  const envContent = Object.keys(envValues).map(
    (key) => `${key} = ${envValues[key]}\r\n`
  );

  await fsPromises.writeFile(
    path.join(__dirname, `${fileName}.env`),
    envContent
  );
  //notify what secrets were copied
  const secretNamesCopied = `${Object.keys(envValues).reduce(
    (a, b) => a + ", " + b
  )} copied`;
  console.log(secretNamesCopied);
  return {
    envValues,
    fileName: `${fileName}.env`,
  };
};
const moveEnv = async (payload: {
  customDirectory?: string;
  fileName: string;
  envValues: {
    [key: string]: string;
  };
}) => {
  const { fileName, envValues } = payload;
  const currDirectory = process.cwd();
  const directoryDes = payload.customDirectory
    ? payload.customDirectory
    : findRootPackageJson(currDirectory);
  //move to root directory
  await moveFile({
    fileName,
    extension: "env",
    directoryStart: currDirectory,
    directoryDes: directoryDes,
  });
  //notify where new env file was moved to
  const output = `${fileName} moved to ${directoryDes}`;
  console.log(output);
  core.setOutput("reactSecrets", envValues);
};
export const createEnvFile = async ({
  inputs,
  customName,
  customDirectory,
}: {
  inputs: string;
  customName: string;
  customDirectory: string;
}) => {
  try {
    const payload = await createEnv({
      inputs,
      customName,
    }); //create env file and return payload
    await moveEnv({ ...payload, customDirectory }); //move env file
  } catch (err) {
    console.error(err);
    core.setFailed("Something went wrong. Check error in logs");
  }
};
export const main = async () => {
  const inputs = core.getInput("REACT_APP_SECRETS");
  const customName = core.getInput("ENV_FILE_NAME");
  const customDirectory = core.getInput("DESTINATION_PATH");
  return createEnvFile({
    inputs,
    customName,
    customDirectory,
  });
};
main();
