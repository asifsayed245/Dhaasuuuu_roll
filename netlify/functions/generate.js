import Replicate from "replicate";

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    const token = process.env.REPLICATE_API_TOKEN;
    const OWNER = process.env.REPLICATE_OWNER || "asifsayed245";
    const DEPLOYMENT = process.env.REPLICATE_DEPLOYMENT || "dhaaso-role";
    if (!token) return { statusCode: 500, body: JSON.stringify({ error: "Missing REPLICATE_API_TOKEN" }) };
    const replicate = new Replicate({ auth: token });

    const body = JSON.parse(event.body || "{}");
    const { prompt } = body;

    const wf = {
      "3": {"inputs":{"seed":673853604296923,"steps":20,"cfg":1,"sampler_name":"dpmpp_2m","scheduler":"sgm_uniform","denoise":1,"model":["18",0],"positive":["13",0],"negative":["7",0],"latent_image":["5",0]},"class_type":"KSampler"},
      "5": {"inputs":{"width":1024,"height":1024,"batch_size":1},"class_type":"EmptyLatentImage"},
      "6": {"inputs":{"text":"A dynamic, slightly angled shot of a paneer wrap, with the bottom half wrapped in a custom-branded paper, held firmly in hand against a stylish, slightly out-of-focus brick wall backdrop with subtle graffiti. Visible char marks on the exposed top half, with a generous, colorful filling spilling out. Use vibrant, contrasting colors for the wrap and ingredients. The lighting is sharp and focused, highlighting the texture and freshness, creating an energetic, 'grab-and-go' appeal.","clip":["11",0]},"class_type":"CLIPTextEncode"},
      "7": {"inputs":{"text":"blurry, low quality, simple, modern, vibrant colors.","clip":["11",0]},"class_type":"CLIPTextEncode"},
      "8": {"inputs":{"samples":["3",0],"vae":["12",0]},"class_type":"VAEDecode"},
      "9": {"inputs":{"filename_prefix":"ComfyUI","images":["8",0]},"class_type":"SaveImage"},
      "10":{"inputs":{"unet_name":"flux1-dev.safetensors","weight_dtype":"default"},"class_type":"UNETLoader"},
      "11":{"inputs":{"clip_name1":"clip_l.safetensors","clip_name2":"t5xxl_fp16.safetensors","type":"flux","device":"default"},"class_type":"DualCLIPLoader"},
      "12":{"inputs":{"vae_name":"ae.safetensors"},"class_type":"VAELoader"},
      "13":{"inputs":{"guidance":3,"conditioning":["6",0]},"class_type":"FluxGuidance"},
      "18":{"inputs":{"lora_name":"faso-ro-ads-lora.safetensors","strength_model":1,"model":["10",0]},"class_type":"LoraLoaderModelOnly"}
    };

    if (prompt !== undefined && wf["6"]?.inputs) wf["6"].inputs.text = String(prompt);

    const prediction = await replicate.deployments.predictions.create(
      OWNER, DEPLOYMENT,
      { input: { workflow_json: JSON.stringify(wf), output_format: "png", output_quality: 95, randomise_seeds: true, force_reset_cache: false, return_temp_files: false } }
    );

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: prediction?.id, status: prediction?.status }) };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: err?.message || "Create failed" }) };
  }
}
