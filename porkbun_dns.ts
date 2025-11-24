import { $ } from "bun";

interface recordsObject {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: string;
  prio: string;
  notes: string;
}

async function main() {
  if (Bun.argv.length < 3 || Bun.argv[2] == "help") {
    return console.log("Usage: bun run porkbun_dns.ts <DOMAIN_NAME>");
  }
  const ip = await getIP();
  const domainName = domainValidator() as string;
  const subdomains: string[] = await getSubdomains(domainName);
  await updateDomainIP(ip, domainName, subdomains);
}

main();

async function getIP() {
  const ip = await $`curl ifconfig.me`.text();
  return ip;
}

function domainValidator() {
  const domainName = Bun.argv[2];
  const urlPattern = new RegExp(
    /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/
  );

  if (domainName === undefined || urlPattern.test(domainName) === false) {
    console.log("Please put in a valid domain name.");
  } else {
    return domainName;
  }
}

async function getSubdomains(domainName: string) {
  const url = `https://api.porkbun.com/api/json/v3/dns/retrieve/${domainName}`;
  const options = {
    method: "POST",
    body: JSON.stringify({
      secretapikey: Bun.env.secretapikey,
      apikey: Bun.env.apikey,
    }),
  };
  const subdomains: string[] = [];
  try {
    const res = await fetch(url, options);
    const list = await res.body?.json();
    const records: recordsObject[] = list.records;
    const aRecords = records.filter((e) => e.type === "A");
    aRecords.forEach((e) => {
      const subdomain = e.name.split(".")[0];
      if (subdomain !== undefined)
        if (!domainName.includes(subdomain)) subdomains.push(subdomain);
    });
    return subdomains;
  } catch (error) {
    console.log(
      `Unable to fetch subdomains of ${domainName}... Processing root domain name.`
    );
    return subdomains;
  }
}

async function updateDomainIP(
  ip: string,
  domainName: string,
  subdomains: string[]
) {
  const options = {
    method: "POST",
    body: JSON.stringify({
      secretapikey: Bun.env.secretapikey,
      apikey: Bun.env.apikey,
      content: ip,
      ttl: "600",
    }),
  };

  console.log(`Updating ${domainName} porkbun A records to point to ${ip}...`);

  // update non-prefix record.
  const url = `https://api.porkbun.com/api/json/v3/dns/editByNameType/${domainName}/A`;
  const res = await fetch(url, options);

  if (res.status === 200) {
    console.log(`${url} has been updated to point to ${ip}`);
  } else if (res.status === 400) {
    return console.log("IP is the same, no changes to be made.");
  } else {
    return console.log(
      "There was an issue executing the program. Make sure your environment variables are set correctly."
    );
  }

  if (subdomains.length === 0) return;

  // update ip for all subdomains listed as arguments
  for (let i = 0; i < subdomains.length; i++) {
    const subdomainUrl = `${url}/${subdomains[i]}`;
    await fetch(subdomainUrl, options);
    console.log(`${subdomainUrl} has been updated to point to ${ip}`);
  }
}
