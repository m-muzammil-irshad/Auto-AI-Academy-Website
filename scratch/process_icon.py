import sys
import math
from PIL import Image

def distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_image(input_path, output_path, crop=True):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    width, height = img.size
    
    # Sample the background color from the top-left corner
    bg_color = data[0][:3]
    
    new_data = []
    
    threshold = 30
    fade = 30
    
    for item in data:
        dist = distance(item[:3], bg_color)
        if dist < threshold:
            new_data.append((item[0], item[1], item[2], 0))
        elif dist < threshold + fade:
            alpha = int(((dist - threshold) / fade) * 255)
            new_data.append((item[0], item[1], item[2], alpha))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    if crop:
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

if __name__ == "__main__":
    import os
    # We will use src/app/icon.jpg as input
    input_file = r"d:\Auto AI Web Clone\Auto-AI-Academy-Website\src\app\icon.jpg"
    output_file = r"d:\Auto AI Web Clone\Auto-AI-Academy-Website\src\app\icon.png"
    if os.path.exists(input_file):
        process_image(input_file, output_file)
        os.remove(input_file)
    else:
        print("Input file not found.")
