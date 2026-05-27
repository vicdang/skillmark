# Push Code to GitHub

Your SSH key is authenticated as `vicdang92`, but the repo is under `vicdang`. 

Use a **Personal Access Token** instead.

---

## Step 1: Create GitHub Personal Access Token

1. Go to **[GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)**
2. Click **Generate new token (classic)**
3. **Token settings:**
   - Name: `skillmark-deploy`
   - Expiration: 90 days or No expiration
   - Scopes: Check `repo` (full control of private repositories)
4. Click **Generate token**
5. **Copy the token** (you won't see it again)

---

## Step 2: Store Token Locally

```bash
# Create .git-credentials file for credential helper
cat > ~/.git-credentials << EOF
https://YOUR_GITHUB_USERNAME:YOUR_TOKEN_HERE@github.com
EOF

# Make it readable only by you
chmod 600 ~/.git-credentials

# Configure git to use credential helper
git config --global credential.helper store
```

Replace:
- `YOUR_GITHUB_USERNAME` → `vicdang`
- `YOUR_TOKEN_HERE` → Paste the token from Step 1

---

## Step 3: Switch Remote to HTTPS

```bash
cd /Users/vic/Personal/skillmark
git remote set-url origin https://github.com/vicdang/skillmark.git
```

---

## Step 4: Push Code

```bash
git push origin main
```

When prompted for password, paste the personal access token.

---

## Done!

Your code is now pushed to GitHub and ready for Vercel to deploy.

Next step: Go to [Vercel](https://vercel.com) and import the repo again.
