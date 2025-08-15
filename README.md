# ComfyUI on Replicate — Netlify (Updated UI)

- Advanced (width/height) sits directly under Prompt.
- No logs shown below images.
- Click image to open a full-size lightbox; Download buttons provided.
- Netlify Functions use polling (generate + status) to avoid timeouts.

## Deploy
1. Push this folder to a GitHub repo (files, not the zip).
2. In Netlify, connect the repo.
3. Set env vars in Site settings → Environment variables:
   - REPLICATE_API_TOKEN = r8_… (secret)
   - REPLICATE_OWNER = asifsayed245
   - REPLICATE_DEPLOYMENT = dhaaso-role
4. Deploy, then open your site.
