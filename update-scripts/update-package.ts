const repositoryName: string | undefined = Deno.env.get("REPOSITORY_NAME") ?? "KineLVideoPlayer"
const version: string | undefined = Deno.env.get("VERSION") ?? "2.5.0"
const vpmJsonPath: string | undefined = Deno.env.get("VPM_JSON_PATH") ?? "../vpm.json"

const packageUrl = `https://github.com/niwaniwa/${repositoryName}/releases/download/${version}/package.json`

console.log(`packageUrl: ${packageUrl}`);

const parentJson = JSON.parse(Deno.readTextFileSync(`${vpmJsonPath}`))

const packageJson = await fetch(packageUrl)
    .then((response) => {
        if (!response.ok) {
            throw new Error("Failed to get package.json");
        }
        return response.json();
    })

packageJson.url = `https://github.com/niwaniwa/${repositoryName}/releases/download/${version}/${packageJson.name}-${version}.zip`

parentJson.packages ??= {};
parentJson.packages[packageJson.name] ??= {versions: {}};
parentJson.packages[packageJson.name].versions[packageJson.version] = packageJson

Deno.writeTextFileSync(`${vpmJsonPath}`, JSON.stringify(parentJson, null, 4) + "\n")

// // run git commands
const decoder = new TextDecoder();
await new Deno.Command("git", { args: ["add", `${vpmJsonPath}`] }).output().then(o => console.log(`log: ${decoder.decode(o.stdout)}`))
await new Deno.Command("git", { args: ["commit", "-m", `update package ${repositoryName} version ${version}`] }).output().then(o => console.log(`log: ${decoder.decode(o.stdout)}`))
while (true) {
    const output = await new Deno.Command("git", { args: ["push"] }).output().then(o => o);
    if (output.success) {
        break
    }
    console.log(`retry push...: ${decoder.decode(output.stderr) }`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    await new Deno.Command("git", { args: ["pull", "--rebase"]});
}
await new Promise(resolve => setTimeout(resolve, 1000));
await new Deno.Command("git", { args: ["log", "--pretty=format:\" % h % s\"", "--graph"] }).output().then(o => console.log(`log: ${decoder.decode(o.stdout)}`))
