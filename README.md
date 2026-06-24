# use1app.com

Static landing page for **1APP — AI Automation for Small Businesses**.

## Deployment

This repo is designed for GitHub Pages with custom domain:

- Domain: `use1app.com`
- CNAME file: `use1app.com`
- GitHub Pages source: `main` branch, root folder

## Dynadot DNS setup for apex domain

Add these A records for `@` pointing to GitHub Pages:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

For `www`, add a CNAME:

```text
www -> adecarlo248.github.io
```

Then in GitHub repo settings:

1. Settings → Pages
2. Source: Deploy from branch
3. Branch: `main` / root
4. Custom domain: `use1app.com`
5. Enable "Enforce HTTPS" once DNS is verified
