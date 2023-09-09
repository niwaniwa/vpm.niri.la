const repositoryName: string | undefined = Deno.env.get("REPOSITORY_NAME");
const version: string | undefined = Deno.env.get("VERSION");
const vpmJsonPath: string | undefined = Deno.env.get("VPM_JSON_PATH");

const packageUrl = `https://github.com/niwaniwa/${repositoryName}/releases/download/${version}/package.json`

console.log(`packageUrl: ${packageUrl}`);

const parentJson = JSON.parse(Deno.readTextFileSync(`${repositoryName}`))

console.log(JSON.stringify(parentJson, null, 4));

const packageJson = await fetch(packageUrl)
    .then((response) => {
        if (!response.ok) {
            throw new Error("Failed to get package.json");
        }
        return response.json();
    })

parentJson.packages ??= {};
parentJson.packages[packageJson.name] ??= {versions: {}};
parentJson.packages[packageJson.name].versions[packageJson.version] = packageJson

Deno.writeTextFileSync(`${repositoryName}`, JSON.stringify(parentJson, null, 4) + "\n")

await new Deno.Command("git", { args: ["add", `${repositoryName}`] })
await new Deno.Command("git", { args: ["commit", "-m", `update package ${repositoryName} version ${version}`] })
await new Deno.Command("git", { args: ["push"] })