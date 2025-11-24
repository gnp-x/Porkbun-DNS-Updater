# Porkbun DNS Updater

Porkbun DNS Updater will update the IP address for all A records for your porkbun domain and subdomains if provided. This is helpful for those that are self-hosting and don't have a static IP.

It requires the bun* runtime, which you can install from https://bun.com. 

*No, I didn't choose bun because bun is in porkbun (I *wish* I was that clever). I did it because it's better than node.

```bash
# To install bun globally
curl -fsSL https://bun.sh/install | bash
```

```bash
# To install dependencies:
bun install
```

### Porkbun API Keys

- Make sure you generate your keys and activate API access for your domains: https://kb.porkbun.com/article/190-getting-started-with-the-porkbun-api
- Make a .env file with the following contents:

```bash
secretapikey='YOUR_SECRET_KEY'
apikey='YOUR_API_KEY'
```

```bash
# To run:
bun run porkbun_dns.ts help
```

### Examples:

This will update the non-prefixed A record for the domain and its subdomain www.

```bash
bun run porkbun_dns.ts example.com www
```

- Updates https://example.com
- Updates https://www.example.com

This will update the non-prefixed A record and the A records for the subdomains www and blog.

```bash
bun run porkbun_dns.ts example.com www blog
```

- Updates https://example.com
- Updates https://www.example.com
- Updates https://blog.example.com

You can add on as many subdomains as you'd like and it will handle them all as long as the records exist in porkbun.

### Recommendation

I recommend running this as a cron job on your server so you can determine how often you want it to check if it needs to update its IP address.
