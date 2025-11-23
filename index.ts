import { $ } from "bun";

async function getIP() {
  const ip = await $`curl ifconfig.me`.text();
  return ip.toString();
}

async function updateDomainIP() {
  const domainName = Bun.argv[2]?.trim();
  const ip = await getIP();
  console.log(`Updating ${domainName} porkbun A records to point to ${ip}...`);

  const urlPattern = new RegExp(
    /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/
  );

  if (domainName === undefined || urlPattern.test(domainName) === false) {
    return console.log("Please put in a valid domain name.");
  }

  const subdomains: string[] = Bun.argv.slice(3);

  const options = {
    method: "POST",
    body: JSON.stringify({
      secretapikey: Bun.env.secretapikey,
      apikey: Bun.env.apikey,
      content: ip,
      ttl: "600",
    }),
  };

  // update non-prefix record.
  const url = `https://api.porkbun.com/api/json/v3/dns/editByNameType/${domainName}/A`;
  const res = await fetch(url, options);

  if (res.status === 200) {
    console.log(`${url} has been updated to point to ${ip}`);
  } else if (res.status == 400) {
    return console.log("IP is the same, no changes to be made.");
  } else {
    return console.log(
      "There was an issue executing the program. Make sure your environment variables are set correctly."
    );
  }

  if (subdomains.length == 0) return;

  // update ip for all subdomains listed as arguments
  for (let i = 0; i < subdomains.length; i++) {
    const url = `https://api.porkbun.com/api/json/v3/dns/editByNameType/${domainName}/A/${subdomains[i]}`;
    await fetch(url, options);
    console.log(`${url} has been updated to point to ${ip}`);
  }
}

await updateDomainIP();
