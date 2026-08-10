import { JSDOM } from 'jsdom';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { open } from 'node:fs/promises';
import { execSync } from 'child_process';
import { readNars, WriteNarsSchema } from '@nf2t/nifitools-js';

const DOWNLOADS_PATH = './downloads';
const ZIP_PATH = `${DOWNLOADS_PATH}/nifi.zip`;
const CACHE_PATH = `${DOWNLOADS_PATH}/cache`;
const NARS_PATH = './nars';
const OUTPUT_PATH = './public';
const BUILD_INFO_OUTPUT = `${OUTPUT_PATH}/buildinfo.json`;
const NARS_OUTPUT = `${OUTPUT_PATH}/nars.json`;

function generateBuildinfo() {
  const gitSha = execSync('git rev-parse HEAD').toString().trim();
  const gitShortSha = execSync('git rev-parse --short HEAD').toString().trim();
  const gitMessage = execSync('git log -1 --pretty=%B').toString().trim();
  const gitDate = execSync('git log -1 --date=iso-strict --pretty=%cd').toString().trim();
  const repository = process.env.GITHUB_REPOSITORY;
  const base = repository ? repository.split('/')[1] : undefined;

  return {
    base,
    git: {
      SHA: gitSha,
      shortSHA: gitShortSha,
      date: gitDate,
      message: gitMessage,
    },
    github: {
      base,
      GITHUB_JOB: process.env.GITHUB_JOB,
      GITHUB_REPOSITORY: repository,
      GITHUB_SHA: process.env.GITHUB_SHA,
      GITHUB_REF: process.env.GITHUB_REF,
      GITHUB_WORKFLOW: process.env.GITHUB_WORKFLOW,
      GITHUB_ACTOR: process.env.GITHUB_ACTOR,
      GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE,
    },
    node: process.versions,
  };
}

async function generateNarsNew() {
  const DOMParser = new JSDOM().window.DOMParser;

  const narInfo = {
    nars: [],
    extensions: [],
    attributes: [],
  };

  const files = readdirSync(NARS_PATH).map(async (x) => {
    const fileHandle = await open(`${NARS_PATH}/${x}`);
    const buffer = await fileHandle.readFile();
    await fileHandle.close();
    return new File([buffer], x);
  });

  await readNars({
    files: await Promise.all(files),
    setCurrentProgress: () => null,
    parseNar: async (nar) => {
      narInfo.nars.push(nar);
    },
    parseExtension: async (extension) => {
      narInfo.extensions.push(extension);
    },
    parseAttribute: async (attribute) => {
      narInfo.attributes.push(attribute);
    },
    DOMParser: new DOMParser(),
  });

  return narInfo;
}

async function generateNars() {
  if (existsSync(CACHE_PATH)) {
    const content = readFileSync(CACHE_PATH, { encoding: 'utf8' });
    return WriteNarsSchema.parseAsync(JSON.parse(content));
  }

  try {
    if (!existsSync(NARS_PATH)) {
      mkdirSync(NARS_PATH);
      if (!existsSync(DOWNLOADS_PATH)) {
        mkdirSync(DOWNLOADS_PATH);
      }

      if (!existsSync(ZIP_PATH)) {
        execSync(`curl https://dlcdn.apache.org/nifi/1.28.1/nifi-1.28.1-bin.zip -o ${ZIP_PATH}`, {
          stdio: 'inherit',
        });
      }

      execSync(`unzip ${ZIP_PATH} '*/*.nar' -d ${DOWNLOADS_PATH}/`, { stdio: 'inherit' });
      execSync(`cp ${DOWNLOADS_PATH}/nifi-*.*.*/lib/*.nar ${NARS_PATH}`, { stdio: 'inherit' });
    }

    const narInfo = await generateNarsNew();
    writeFileSync(CACHE_PATH, JSON.stringify(narInfo));
    return narInfo;
  } catch (error) {
    console.warn('Unable to generate NAR metadata, continuing with empty values.', error);
    return {
      nars: [],
      extensions: [],
      attributes: [],
    };
  }
}

async function run() {
  if (!existsSync(OUTPUT_PATH)) {
    mkdirSync(OUTPUT_PATH);
  }

  writeFileSync(BUILD_INFO_OUTPUT, JSON.stringify(generateBuildinfo()));
  writeFileSync(NARS_OUTPUT, JSON.stringify(await generateNars()));
}

run();
