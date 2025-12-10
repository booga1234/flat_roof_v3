function generate_signed_bunny_url {
  input {
    text path? filters=trim
    int expires_in?=3600
  }

  stack {
    api.lambda {
      code = """
        const crypto = await import("node:crypto");
        
        // 1. Inputs
        const path = $input.path || "/";
        const expiresIn = $input.expires_in || 3600;
        
        const securityKey = $env.BUNNY_TOKEN_KEY;
        const pullZoneUrl = $env.BUNNY_PULLZONE_URL;
        
        // 2. Expiration timestamp (Unix seconds)
        const expires = Math.floor(Date.now() / 1000) + expiresIn;
        
        // Ensure path starts with "/"
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        
        // 3. Bunny Pull Zone Token Auth format:
        // sha256( path + expires + securityKey )
        const stringToSign = normalizedPath + expires + securityKey;
        
        const token = crypto.createHash("sha256")
            .update(stringToSign)
            .digest("hex");
        
        // 4. Build signed URL
        const baseUrl = pullZoneUrl.replace(/\/$/, "");
        const signedUrl = `${baseUrl}${normalizedPath}?token=${token}&expires=${expires}`;
        
        return {
          expires,
          token,
          signed_url: signedUrl
        };
        """
      timeout = 10
    } as $signed_url
  }

  response = $signed_url
  history = 100
}