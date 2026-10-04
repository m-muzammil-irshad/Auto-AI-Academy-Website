import sys
from PIL import Image

def extract_neon(input_path, output_path):
    img = Image.open(input_path).convert("RGB")
    data = img.getdata()
    
    new_data = []
    
    for r, g, b in data:
        max_val = max(r, g, b)
        if max_val == 0:
            new_data.append((0, 0, 0, 0))
        else:
            A = max_val
            R = int((r / A) * 255)
            G = int((g / A) * 255)
            B = int((b / A) * 255)
            new_data.append((R, G, B, A))
            
    img = img.convert("RGBA")
    img.putdata(new_data)
    
    # Crop to bounding box based on alpha
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

if __name__ == "__main__":
    import os
    input_file = r"C:\Users\muzam\.gemini\antigravity-ide\brain\44a3c9ed-02e6-4c09-bd9d-f16aeca4643f\favicon_polished_1791038345936.jpg"
    output_file = r"d:\Auto AI Web Clone\Auto-AI-Academy-Website\src\app\icon.png"
    if os.path.exists(input_file):
        extract_neon(input_file, output_file)
    else:
        print(f"Input file not found: {input_file}")
