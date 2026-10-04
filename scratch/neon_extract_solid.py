import sys
from PIL import Image

def extract_neon_solid(input_path, output_path):
    img = Image.open(input_path).convert("RGB")
    data = img.getdata()
    
    new_data = []
    
    for r, g, b in data:
        max_val = max(r, g, b)
        if max_val < 15:
            # Drop very dark pixels completely to avoid dark halos
            new_data.append((0, 0, 0, 0))
        else:
            # Boost the alpha significantly so it's not a ghost
            # 85 * 3 = 255, so anything with brightness > 85 is FULLY opaque
            A = min(255, int((max_val - 15) * 3))
            
            # Normalize colors to be maximally bright (remove the blackness)
            R = min(255, int((r / max_val) * 255))
            G = min(255, int((g / max_val) * 255))
            B = min(255, int((b / max_val) * 255))
            
            # To make it even more visible, let's mix in a bit of white if it's very bright
            # or just leave it saturated. Let's just use the saturated color.
            new_data.append((R, G, B, A))
            
    img = img.convert("RGBA")
    img.putdata(new_data)
    
    # Crop to bounding box based on alpha
    bbox = img.getbbox()
    if bbox:
        # Crop exactly to the logo
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

if __name__ == "__main__":
    import os
    input_file = r"C:\Users\muzam\.gemini\antigravity-ide\brain\44a3c9ed-02e6-4c09-bd9d-f16aeca4643f\favicon_polished_1791038345936.jpg"
    output_file = r"d:\Auto AI Web Clone\Auto-AI-Academy-Website\src\app\icon.png"
    if os.path.exists(input_file):
        extract_neon_solid(input_file, output_file)
    else:
        print(f"Input file not found: {input_file}")
