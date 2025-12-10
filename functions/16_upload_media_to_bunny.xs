function upload_media_to_bunny {
  input {
    attachment? file?
  }

  stack {
    api.lambda {
      code = """
        const crypto = await import("node:crypto");
        
        // Inputs
        const file = $input.file;
        if (!file) {
          throw new Error("No file provided.");
        }
        
        const userId = $input.user_id || null;
        const relatedTable = $input.related_table || "general";
        const relatedId = $input.related_id || null;
        
        // Build filename
        const originalName = file.filename || "upload";
        const ext = originalName.split(".").pop().toLowerCase();
        const uuid = crypto.randomUUID();
        const newFilename = `${uuid}.${ext}`;
        
        // Build Bunny storage path
        // Example: inspections/421/uuid.jpg
        let storagePath = `${relatedTable}/${relatedId}/${newFilename}`;
        
        // Bunny API settings
        const storageHost = $env.BUNNY_STORAGE_HOST; // e.g. "la.storage.bunnycdn.com"
        const storageZone = $env.BUNNY_STORAGE_ZONE; // e.g. "flat-roof-llc"
        const accessKey = $env.BUNNY_STORAGE_KEY;
        
        // Upload to Bunny via HTTP PUT
        const url = `https://${storageHost}/${storageZone}/${storagePath}`;
        
        const uploadResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "AccessKey": accessKey,
            "Content-Type": "application/octet-stream"
          },
          body: file.data
        });
        
        // Validate upload success
        if (!uploadResponse.ok) {
          throw new Error(`Bunny upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        // Insert into media table
        return {
          new_record: {
            path: storagePath,
            filename: newFilename,
            mime_type: file.content_type,
            extension: ext,
            size_bytes: file.size,
            user_id: userId
          }
        };
        """
      timeout = 10
    } as $created_file
  
    db.add media {
      data = {
        created_at: "now"
        path      : $created_file.path
        filename  : $created_file.filename
        mime_type : $created_file.mime_type
        extension : $created_file.extension
        size_bytes: $created_file.size_bytes
        user_id   : $auth.id
        updated_at: null
      }
    } as $created_media_record
  }

  response = $created_media_record
  history = 100
}