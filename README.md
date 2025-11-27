> ### **Updates to this script will only occur at:** https://codeberg.org/gnp/porkbun-dns-updater

# Porkbun DNS Updater

Porkbun DNS Updater will update the IP address for all A records for your porkbun domain and subdomains based on the public IP of said machine. This is helpful for those that are self-hosting and don't have a static IP.

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

### Example:

This will update the non-prefixed A record for the domain and its subdomains.

```bash
bun run porkbun_dns.ts example.com
```

### Recommendation

I recommend running this as a cron job on your server so you can determine how often you want it to check if it needs to update its IP address.
